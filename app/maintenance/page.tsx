'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

type RequestRow = {
  id: string
  title: string
  description: string | null
  status: string
  unit_number: string
  property_name: string
}

export default function MaintenancePage() {
  const router = useRouter()
  const [rows, setRows] = useState<RequestRow[]>([])
  const [loading, setLoading] = useState(true)
  const [busyId, setBusyId] = useState('')

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
    if (propertyIds.length === 0) {
      setRows([])
      setLoading(false)
      return
    }

    const { data: units } = await supabase
      .from('units')
      .select('id, unit_number, property_id')
      .in('property_id', propertyIds)

    const unitIds = (units || []).map((u) => u.id)
    if (unitIds.length === 0) {
      setRows([])
      setLoading(false)
      return
    }

    const { data: requests } = await supabase
      .from('maintenance_requests')
      .select('id, title, description, status, unit_id')
      .in('unit_id', unitIds)
      .order('created_at', { ascending: false })

    const propertyName = Object.fromEntries((properties || []).map((p) => [p.id, p.name]))
    const unitById = Object.fromEntries((units || []).map((u) => [u.id, u]))

    setRows(
      (requests || []).map((r) => {
        const unit = unitById[r.unit_id]
        return {
          id: r.id,
          title: r.title,
          description: r.description,
          status: r.status,
          unit_number: unit?.unit_number || '—',
          property_name: propertyName[unit?.property_id] || '—',
        }
      })
    )
    setLoading(false)
  }

  useEffect(() => {
    load()
  }, [router])

  const markDone = async (id: string) => {
    setBusyId(id)
    await supabase.from('maintenance_requests').update({ status: 'done' }).eq('id', id)
    await load()
    setBusyId('')
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-3xl mx-auto px-4 py-10">
        <a href="/dashboard" className="text-sm text-blue-600">← Dashboard</a>
        <div className="flex justify-between items-center mt-4 mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Matengenezo</h1>
          <a href="/maintenance/new" className="bg-amber-600 text-white px-4 py-2 rounded-lg text-sm">
            + Ombi jipya
          </a>
        </div>

        {loading && <p className="text-gray-600">Inapakia...</p>}
        {!loading && rows.length === 0 && <p className="text-gray-600">Hakuna maombi.</p>}

        <div className="space-y-3">
          {rows.map((r) => (
            <div key={r.id} className="bg-white p-4 rounded-xl shadow">
              <div className="flex justify-between gap-3">
                <p className="font-semibold text-gray-900">{r.title}</p>
                <span className={r.status === 'done' ? 'text-green-600 text-sm' : 'text-amber-600 text-sm'}>
                  {r.status === 'done' ? 'Imekamilika' : 'Inasubiri'}
                </span>
              </div>
              <p className="text-sm text-gray-600">{r.property_name} · Chumba {r.unit_number}</p>
              {r.description && <p className="text-sm text-gray-700 mt-1">{r.description}</p>}
              {r.status !== 'done' && (
                <button
                  onClick={() => markDone(r.id)}
                  disabled={busyId === r.id}
                  className="mt-3 text-sm bg-green-600 text-white px-3 py-1.5 rounded disabled:bg-green-300"
                >
                  {busyId === r.id ? 'Inahifadhi...' : 'Imekamilika'}
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}