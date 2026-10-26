'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

type Property = {
  id: string
  name: string
  type: string
  location: string
  status: string
}

export default function PropertiesPage() {
  const router = useRouter()
  const [items, setItems] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }

      const { data } = await supabase
        .from('properties')
        .select('id, name, type, location, status')
        .eq('owner_id', user.id)
        .order('created_at', { ascending: false })

      setItems(data || [])
      setLoading(false)
    }
    load()
  }, [router])

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-3xl mx-auto px-4 py-10">
        <a href="/dashboard" className="text-sm text-blue-600">← Dashboard</a>
        <div className="flex justify-between items-center mt-4 mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Mali Zangu</h1>
          <a href="/properties/new" className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm">
            + Ongeza Mali
          </a>
        </div>

        {loading && <p className="text-gray-600">Inapakia...</p>}
        {!loading && items.length === 0 && (
          <p className="text-gray-600">Bado huna mali. Ongeza ya kwanza.</p>
        )}

        <div className="space-y-3">
          {items.map((p) => (
            <a key={p.id} href={`/properties/${p.id}`} className="block bg-white p-4 rounded-xl shadow hover:bg-gray-50">
              <p className="font-semibold text-gray-900">{p.name}</p>
              <p className="text-sm text-gray-600">{p.type} · {p.location || '—'} · {p.status}</p>
            </a>
          ))}
        </div>
      </div>
    </div>
  )
}