'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

type UnitOption = {
  id: string
  unit_number: string
  rent_amount: number
  property_name: string
}

export default function NewTenantPage() {
  const router = useRouter()
  const [units, setUnits] = useState<UnitOption[]>([])
  const [unitId, setUnitId] = useState('')
  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [startDate, setStartDate] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }

      const { data: properties } = await supabase
        .from('properties')
        .select('id, name')
        .eq('owner_id', user.id)

      const propertyIds = (properties || []).map((p) => p.id)
      if (propertyIds.length === 0) return

      const { data: unitRows, error: unitsError } = await supabase
        .from('units')
        .select('id, unit_number, rent_amount, property_id, status')
        .in('property_id', propertyIds)

      if (unitsError) {
        setError(unitsError.message)
        return
      }

      const nameById = Object.fromEntries((properties || []).map((p) => [p.id, p.name]))
      const options = (unitRows || [])
        .filter((u) => u.status !== 'occupied')
        .map((u) => ({
          id: u.id,
          unit_number: u.unit_number,
          rent_amount: u.rent_amount,
          property_name: nameById[u.property_id] || '',
        }))

      setUnits(options)
      if (options[0]) setUnitId(options[0].id)
    }
    load()
  }, [router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { error: insertError } = await supabase.from('tenants').insert({
      unit_id: unitId,
      full_name: fullName,
      phone,
      start_date: startDate || null,
      status: 'active',
    })

    if (insertError) {
      setError(insertError.message)
      setLoading(false)
      return
    }

    await supabase.from('units').update({ status: 'occupied' }).eq('id', unitId)
    router.push('/tenants')
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-xl mx-auto px-4 py-10">
        <a href="/tenants" className="text-sm text-blue-600">← Wapangaji</a>
        <h1 className="text-2xl font-bold text-gray-900 mt-4 mb-6">Ongeza Mpangaji</h1>
        {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4 text-sm">{error}</div>}
        {units.length === 0 && !error && (
          <p className="text-gray-600">Hakuna chumba tupu. Ongeza chumba kwanza.</p>
        )}
        {units.length > 0 && (
          <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">Chumba</label>
              <select value={unitId} onChange={(e) => setUnitId(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900">
                {units.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.property_name} — {u.unit_number} (TZS {Number(u.rent_amount).toLocaleString()})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">Jina la mpangaji</label>
              <input required value={fullName} onChange={(e) => setFullName(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">Simu</label>
              <input required value={phone} onChange={(e) => setPhone(e.target.value)}
                placeholder="0745423403"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">Tarehe ya kuanza</label>
              <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900" />
            </div>
            <button disabled={loading} className="w-full bg-green-600 text-white py-2.5 rounded-lg disabled:bg-green-300">
              {loading ? 'Inahifadhi...' : 'Hifadhi Mpangaji'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}