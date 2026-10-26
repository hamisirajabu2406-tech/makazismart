'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

type TenantRow = {
  id: string
  full_name: string
  phone: string | null
  start_date: string | null
  status: string
  unit_number: string
  property_name: string
  rent_amount: number
}

export default function TenantsPage() {
  const router = useRouter()
  const [rows, setRows] = useState<TenantRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }

      const { data: properties, error: propError } = await supabase
        .from('properties')
        .select('id, name')
        .eq('owner_id', user.id)

      if (propError) {
        setError(propError.message)
        setLoading(false)
        return
      }

      const propertyIds = (properties || []).map((p) => p.id)
      if (propertyIds.length === 0) {
        setLoading(false)
        return
      }

      const { data: units, error: unitError } = await supabase
        .from('units')
        .select('id, unit_number, rent_amount, property_id')
        .in('property_id', propertyIds)

      if (unitError) {
        setError(unitError.message)
        setLoading(false)
        return
      }

      const unitIds = (units || []).map((u) => u.id)
      if (unitIds.length === 0) {
        setLoading(false)
        return
      }

      const { data: tenants, error: tenantError } = await supabase
        .from('tenants')
        .select('id, full_name, phone, start_date, status, unit_id')
        .in('unit_id', unitIds)
        .eq('status', 'active')
        .order('created_at', { ascending: false })

      if (tenantError) {
        setError(tenantError.message)
        setLoading(false)
        return
      }

      const propertyName = Object.fromEntries((properties || []).map((p) => [p.id, p.name]))
      const unitById = Object.fromEntries((units || []).map((u) => [u.id, u]))

      setRows(
        (tenants || []).map((t) => {
          const unit = unitById[t.unit_id]
          return {
            id: t.id,
            full_name: t.full_name,
            phone: t.phone,
            start_date: t.start_date,
            status: t.status,
            unit_number: unit?.unit_number || '—',
            property_name: propertyName[unit?.property_id] || '—',
            rent_amount: unit?.rent_amount || 0,
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
        <div className="flex justify-between items-center mt-4 mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Wapangaji</h1>
          <a href="/tenants/new" className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm">
            + Ongeza Mpangaji
          </a>
        </div>
        {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4 text-sm">{error}</div>}
        {loading && <p className="text-gray-600">Inapakia...</p>}
        {!loading && rows.length === 0 && <p className="text-gray-600">Bado hakuna wapangaji.</p>}
        <div className="space-y-3">
          {rows.map((t) => (
            <div key={t.id} className="bg-white p-4 rounded-xl shadow">
              <div className="flex justify-between gap-3">
                <p className="font-semibold text-gray-900">{t.full_name}</p>
                <span className="text-green-600 text-sm">Anaishi</span>
              </div>
              <p className="text-sm text-gray-600 mt-1">{t.property_name} · Chumba {t.unit_number}</p>
              <p className="text-sm text-gray-600">
                {t.phone || 'Hakuna simu'} · TZS {Number(t.rent_amount).toLocaleString()} / mwezi
              </p>
              {t.start_date && <p className="text-sm text-gray-500">Tangu {t.start_date}</p>}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}