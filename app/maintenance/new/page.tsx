'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

type UnitOption = {
  id: string
  label: string
}

export default function NewMaintenancePage() {
  const router = useRouter()
  const [units, setUnits] = useState<UnitOption[]>([])
  const [unitId, setUnitId] = useState('')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
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

      const { data: unitRows } = await supabase
        .from('units')
        .select('id, unit_number, property_id')
        .in('property_id', propertyIds)

      const nameById = Object.fromEntries((properties || []).map((p) => [p.id, p.name]))
      const options = (unitRows || []).map((u) => ({
        id: u.id,
        label: `${nameById[u.property_id] || 'Mali'} — ${u.unit_number}`,
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

    const { error: insertError } = await supabase.from('maintenance_requests').insert({
      unit_id: unitId,
      title,
      description,
      status: 'pending',
    })

    if (insertError) {
      setError(insertError.message)
      setLoading(false)
      return
    }

    router.push('/maintenance')
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-xl mx-auto px-4 py-10">
        <a href="/maintenance" className="text-sm text-blue-600">← Matengenezo</a>
        <h1 className="text-2xl font-bold text-gray-900 mt-4 mb-6">Ombi la matengenezo</h1>
        {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4 text-sm">{error}</div>}

        {units.length === 0 ? (
          <p className="text-gray-600">Ongeza chumba kwanza.</p>
        ) : (
          <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">Chumba</label>
              <select value={unitId} onChange={(e) => setUnitId(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900">
                {units.map((u) => (
                  <option key={u.id} value={u.id}>{u.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">Kichwa</label>
              <input required value={title} onChange={(e) => setTitle(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900"
                placeholder="Bomba limepasuka" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">Maelezo</label>
              <textarea value={description} onChange={(e) => setDescription(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900" rows={3} />
            </div>
            <button disabled={loading} className="w-full bg-amber-600 text-white py-2.5 rounded-lg disabled:bg-amber-300">
              {loading ? 'Inahifadhi...' : 'Hifadhi'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}