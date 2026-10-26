'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

type Row = {
  id: string
  name: string
  phone: string
  message: string | null
  unit_number: string
  property_name: string
}

export default function InquiriesPage() {
  const router = useRouter()
  const [rows, setRows] = useState<Row[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }

      const { data: properties } = await supabase.from('properties').select('id, name').eq('owner_id', user.id)
      const propertyIds = (properties || []).map((p) => p.id)
      if (propertyIds.length === 0) {
        setLoading(false)
        return
      }

      const { data: units } = await supabase
        .from('units')
        .select('id, unit_number, property_id')
        .in('property_id', propertyIds)

      const unitIds = (units || []).map((u) => u.id)
      if (unitIds.length === 0) {
        setLoading(false)
        return
      }

      const { data: inquiries } = await supabase
        .from('inquiries')
        .select('id, name, phone, message, unit_id')
        .in('unit_id', unitIds)
        .order('created_at', { ascending: false })

      const propertyName = Object.fromEntries((properties || []).map((p) => [p.id, p.name]))
      const unitById = Object.fromEntries((units || []).map((u) => [u.id, u]))

      setRows(
        (inquiries || []).map((i) => {
          const unit = unitById[i.unit_id]
          return {
            id: i.id,
            name: i.name,
            phone: i.phone,
            message: i.message,
            unit_number: unit?.unit_number || '—',
            property_name: propertyName[unit?.property_id] || '—',
          }
        })
      )
      setLoading(false)
    }
    load()
  }, [router])

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-3xl mx-auto px-4 py-10">
        <a href="/dashboard" className="text-sm text-blue-600">← Dashboard</a>
        <h1 className="text-2xl font-bold text-gray-900 mt-4 mb-6">Nia za kupanga</h1>
        {loading && <p className="text-gray-600">Inapakia...</p>}
        {!loading && rows.length === 0 && <p className="text-gray-600">Bado hakuna ujumbe.</p>}
        <div className="space-y-3">
          {rows.map((r) => (
            <div key={r.id} className="bg-white p-4 rounded-xl shadow">
              <p className="font-semibold text-gray-900">{r.name} · {r.phone}</p>
              <p className="text-sm text-gray-600">{r.property_name} · Chumba {r.unit_number}</p>
              {r.message && <p className="text-sm text-gray-800 mt-1">{r.message}</p>}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}