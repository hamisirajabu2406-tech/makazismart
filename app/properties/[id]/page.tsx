'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

type Property = {
  id: string
  name: string
  type: string
  location: string
  address: string
}

type Unit = {
  id: string
  unit_number: string
  rent_amount: number
  status: string | null
  photo_url: string | null
  tenant_id: string | null
  tenant_name: string | null
  tenant_phone: string | null
}

export default function PropertyDetailsPage() {
  const router = useRouter()
  const [propertyId, setPropertyId] = useState('')
  const [property, setProperty] = useState<Property | null>(null)
  const [units, setUnits] = useState<Unit[]>([])
  const [loading, setLoading] = useState(true)
  const [busyId, setBusyId] = useState('')
  const [editingId, setEditingId] = useState('')
  const [rentDraft, setRentDraft] = useState('')

  const load = async (id: string) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push('/login')
      return
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('user_id', user.id)
      .maybeSingle()

    if (profile?.role === 'tenant') {
      router.push('/tenants/home')
      return
    }

    const { data: prop } = await supabase
      .from('properties')
      .select('id, name, type, location, address')
      .eq('id', id)
      .eq('owner_id', user.id)
      .single()

    setProperty(prop)

    const { data: unitRows } = await supabase
      .from('units')
      .select('id, unit_number, rent_amount, status, photo_url')
      .eq('property_id', id)
      .order('unit_number')

    const list = unitRows || []
    const unitIds = list.map((u) => u.id)
    const tenantByUnit: Record<string, { id: string; full_name: string; phone: string | null }> = {}

    if (unitIds.length > 0) {
      const { data: tenants } = await supabase
        .from('tenants')
        .select('id, unit_id, full_name, phone, status')
        .in('unit_id', unitIds)
        .eq('status', 'active')

      for (const t of tenants || []) {
        tenantByUnit[t.unit_id] = { id: t.id, full_name: t.full_name, phone: t.phone }
      }
    }

    setUnits(
      list.map((u) => ({
        ...u,
        tenant_id: tenantByUnit[u.id]?.id || null,
        tenant_name: tenantByUnit[u.id]?.full_name || null,
        tenant_phone: tenantByUnit[u.id]?.phone || null,
      }))
    )
    setLoading(false)
  }

  useEffect(() => {
    const id = window.location.pathname.split('/')[2] || ''
    setPropertyId(id)
    if (id) load(id)
  }, [router])

  const moveOut = async (unit: Unit) => {
    if (!unit.tenant_id) return
    const ok = window.confirm(`${unit.tenant_name} amehama chumba ${unit.unit_number}?`)
    if (!ok) return
    setBusyId(unit.id)
    await supabase.from('tenants').update({ status: 'moved_out' }).eq('id', unit.tenant_id)
    await supabase.from('units').update({ status: 'vacant' }).eq('id', unit.id)
    await load(propertyId)
    setBusyId('')
  }

  const saveRent = async (unitId: string) => {
    const amount = Number(rentDraft)
    if (!amount || amount < 0) return
    setBusyId(unitId)
    await supabase.from('units').update({ rent_amount: amount }).eq('id', unitId)
    setEditingId('')
    await load(propertyId)
    setBusyId('')
  }

  const uploadPhoto = async (unitId: string, file: File) => {
    setBusyId(unitId)
    const path = `${propertyId}/${unitId}/${Date.now()}-${file.name}`
    const { error: uploadError } = await supabase.storage.from('unit-photos').upload(path, file)
    if (uploadError) {
      alert(uploadError.message)
      setBusyId('')
      return
    }
    const { data } = supabase.storage.from('unit-photos').getPublicUrl(path)
    await supabase.from('units').update({ photo_url: data.publicUrl }).eq('id', unitId)
    await load(propertyId)
    setBusyId('')
  }

  if (loading) return <p className="p-8 text-gray-600">Inapakia...</p>
  if (!property) return <p className="p-8 text-gray-600">Mali haipatikani.</p>

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-3xl mx-auto px-4 py-10">
        <a href="/dashboard" className="text-sm text-blue-600">← Dashboard</a>
        <h1 className="text-2xl font-bold text-gray-900 mt-3">{property.name}</h1>
        <a href={`/properties/${propertyId}/edit`} className="text-sm text-blue-600">
  Hariri mali
</a>
        <p className="text-gray-600 mb-6">
          {property.type} · {property.location || property.address || '—'}
        </p>

        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-800">Vyumba</h2>
          <a href={`/properties/${propertyId}/units/new`} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm">
            + Ongeza Chumba
          </a>
        </div>

        {units.length === 0 && <p className="text-gray-600">Bado hakuna vyumba.</p>}

        <div className="space-y-3">
          {units.map((u) => (
            <div key={u.id} className="bg-white p-4 rounded-xl shadow">
              {u.photo_url && (
                <img src={u.photo_url} alt={u.unit_number} className="h-40 w-full object-cover rounded-lg mb-3" />
              )}
              <div className="flex justify-between gap-3">
                <div>
                  <p className="font-medium text-gray-900">{u.unit_number}</p>
                  {editingId === u.id ? (
                    <div className="flex gap-2 mt-2">
                      <input
                        type="number"
                        min="0"
                        value={rentDraft}
                        onChange={(e) => setRentDraft(e.target.value)}
                        className="border border-gray-300 rounded px-2 py-1 text-gray-900 w-36"
                      />
                      <button onClick={() => saveRent(u.id)} className="text-sm bg-blue-600 text-white px-3 py-1 rounded">
                        Hifadhi
                      </button>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-600">
                      TZS {Number(u.rent_amount).toLocaleString()} / mwezi
                    </p>
                  )}
                  {u.tenant_name ? (
                    <p className="text-sm text-gray-800 mt-1">
                      {u.tenant_name}{u.tenant_phone ? ` · ${u.tenant_phone}` : ''}
                    </p>
                  ) : (
                    <p className="text-sm text-gray-400 mt-1">Hakuna mpangaji</p>
                  )}
                </div>
                <span className={u.status === 'occupied' ? 'text-green-600' : 'text-orange-500'}>
                  {u.status === 'occupied' ? 'Kimekaliwa' : 'Tupu'}
                </span>
              </div>
              <div className="flex flex-wrap gap-4 mt-3 items-center">
                <button
                  onClick={() => {
                    setEditingId(u.id)
                    setRentDraft(String(u.rent_amount))
                  }}
                  className="text-sm text-blue-600"
                >
                  Badilisha kodi
                </button>
                <label className="text-sm text-gray-700 cursor-pointer">
                  {busyId === u.id ? 'Inapakia...' : u.photo_url ? 'Badilisha picha' : 'Weka picha'}
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    disabled={busyId === u.id}
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) uploadPhoto(u.id, file)
                    }}
                  />
                </label>
                {u.tenant_id && (
                  <button
                    onClick={() => moveOut(u)}
                    disabled={busyId === u.id}
                    className="text-sm text-red-600 disabled:text-gray-400"
                  >
                    Amehama
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}