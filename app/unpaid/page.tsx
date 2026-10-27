'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

type Row = {
  id: string
  full_name: string
  phone: string | null
  property_name: string
  unit_number: string
  rent_amount: number
}

const monthNames = [
  'Januari', 'Februari', 'Machi', 'Aprili', 'Mei', 'Juni',
  'Julai', 'Agosti', 'Septemba', 'Oktoba', 'Novemba', 'Desemba',
]

function coversMonth(payment: {
  payment_date: string | null
  period_start: string | null
  period_end: string | null
  status: string
}, monthKey: string) {
  if (payment.status && payment.status !== 'paid') return false
  if (payment.period_start && payment.period_end) {
    const start = payment.period_start.slice(0, 7)
    const end = payment.period_end.slice(0, 7)
    return start <= monthKey && end >= monthKey
  }
  return (payment.payment_date || '').slice(0, 7) === monthKey
}

function smsLink(row: Row, label: string) {
  const phone = (row.phone || '').replace(/\s/g, '')
  const text = `Habari ${row.full_name}, ukumbusho: kodi ya chumba ${row.unit_number} (${row.property_name}) TZS ${Number(row.rent_amount).toLocaleString()} bado haijalipwa mwezi wa ${label}. Asante.`
  return `sms:${phone}?body=${encodeURIComponent(text)}`
}

export default function UnpaidPage() {
  const router = useRouter()
  const [rows, setRows] = useState<Row[]>([])
  const [label, setLabel] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const load = async () => {
      const now = new Date()
      const monthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
      setLabel(`${monthNames[now.getMonth()]} ${now.getFullYear()}`)

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

      const { data: units } = await supabase
        .from('units')
        .select('id, unit_number, rent_amount, property_id')
        .in('property_id', propertyIds)

      const unitIds = (units || []).map((u) => u.id)
      if (unitIds.length === 0) {
        setLoading(false)
        return
      }

      const { data: tenants } = await supabase
        .from('tenants')
        .select('id, full_name, phone, unit_id')
        .in('unit_id', unitIds)
        .eq('status', 'active')

      const { data: payments } = await supabase
        .from('payments')
        .select('tenant_id, payment_date, period_start, period_end, status')
        .in('unit_id', unitIds)

      const paidTenantIds = new Set(
        (payments || []).filter((p) => coversMonth(p, monthKey)).map((p) => p.tenant_id)
      )

      const propertyName = Object.fromEntries((properties || []).map((p) => [p.id, p.name]))
      const unitById = Object.fromEntries((units || []).map((u) => [u.id, u]))

      setRows(
        (tenants || [])
          .filter((t) => !paidTenantIds.has(t.id))
          .map((t) => {
            const unit = unitById[t.unit_id]
            return {
              id: t.id,
              full_name: t.full_name,
              phone: t.phone,
              property_name: propertyName[unit?.property_id] || '—',
              unit_number: unit?.unit_number || '—',
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
        <h1 className="text-2xl font-bold text-gray-900 mt-4">Hawajalipa</h1>
        <p className="text-gray-600 mb-6">Mwezi huu: {label}</p>

        {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4 text-sm">{error}</div>}
        {loading && <p className="text-gray-600">Inapakia...</p>}
        {!loading && rows.length === 0 && (
          <p className="text-gray-600">Wapangaji wote wamelipa mwezi huu.</p>
        )}

        <div className="space-y-3">
          {rows.map((t) => (
            <div key={t.id} className="bg-white p-4 rounded-xl shadow">
              <p className="font-semibold text-gray-900">{t.full_name}</p>
              <p className="text-sm text-gray-600">{t.property_name} · Chumba {t.unit_number}</p>
              <p className="text-sm text-gray-600">
                {t.phone || 'Hakuna simu'} · TZS {Number(t.rent_amount).toLocaleString()}
              </p>
              {t.phone ? (
                <a href={smsLink(t, label)} className="inline-block mt-3 text-sm bg-green-600 text-white px-3 py-1.5 rounded">
                  Tuma ukumbusho SMS
                </a>
              ) : (
                <p className="text-sm text-gray-400 mt-2">Weka simu ili kutuma SMS.</p>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}