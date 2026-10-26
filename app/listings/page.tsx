'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

type Listing = {
  unit_id: string
  unit_number: string
  rent_amount: number
  property_name: string
  property_type: string
  location: string | null
}

export default function ListingsPage() {
  const [rows, setRows] = useState<Listing[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const load = async () => {
      const { data, error: rpcError } = await supabase.rpc('public_listings')
      if (rpcError) setError(rpcError.message)
      setRows(data || [])
      setLoading(false)
    }
    load()
  }, [])

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-3xl mx-auto px-4 py-10">
        <a href="/" className="text-sm text-blue-600">← Mwanzo</a>
        <h1 className="text-2xl font-bold text-gray-900 mt-4">Vyumba vilivyo wazi</h1>
        <p className="text-gray-600 mb-6">Orodha ya umma. Huna haja ya kuingia.</p>

        {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4 text-sm">{error}</div>}
        {loading && <p className="text-gray-600">Inapakia...</p>}
        {!loading && rows.length === 0 && <p className="text-gray-600">Hakuna chumba tupu kwa sasa.</p>}

        <div className="space-y-3">
          {rows.map((r) => (
            <div key={r.unit_id} className="bg-white p-4 rounded-xl shadow">
              <p className="font-semibold text-gray-900">{r.property_name}</p>
              <p className="text-sm text-gray-600">
                {r.property_type} · Chumba {r.unit_number} · {r.location || '—'}
              </p>
              <p className="text-lg font-bold text-gray-900 mt-1">
                TZS {Number(r.rent_amount).toLocaleString()} / mwezi
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}