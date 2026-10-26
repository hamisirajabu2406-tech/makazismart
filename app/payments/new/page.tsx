'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

type TenantOption = {
  id: string
  full_name: string
  unit_id: string
  unit_number: string
  rent_amount: number
}

export default function NewPaymentPage() {
  const router = useRouter()
  const [tenants, setTenants] = useState<TenantOption[]>([])
  const [tenantId, setTenantId] = useState('')
  const [amount, setAmount] = useState('')
  const [method, setMethod] = useState('M-Pesa')
  const [paymentDate, setPaymentDate] = useState('')
  const [periodStart, setPeriodStart] = useState('')
  const [periodEnd, setPeriodEnd] = useState('')
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
        .select('id')
        .eq('owner_id', user.id)

      const propertyIds = (properties || []).map((p) => p.id)
      if (propertyIds.length === 0) return

      const { data: units } = await supabase
        .from('units')
        .select('id, unit_number, rent_amount')
        .in('property_id', propertyIds)

      const unitIds = (units || []).map((u) => u.id)
      if (unitIds.length === 0) return

      const { data: tenantRows, error: tenantError } = await supabase
        .from('tenants')
        .select('id, full_name, unit_id')
        .in('unit_id', unitIds)
        .eq('status', 'active')

      if (tenantError) {
        setError(tenantError.message)
        return
      }

      const unitById = Object.fromEntries((units || []).map((u) => [u.id, u]))
      const options = (tenantRows || []).map((t) => ({
        id: t.id,
        full_name: t.full_name,
        unit_id: t.unit_id,
        unit_number: unitById[t.unit_id]?.unit_number || '',
        rent_amount: unitById[t.unit_id]?.rent_amount || 0,
      }))

      setTenants(options)
      if (options[0]) {
        setTenantId(options[0].id)
        setAmount(String(options[0].rent_amount))
      }
    }
    load()
  }, [router])

  const onTenantChange = (id: string) => {
    setTenantId(id)
    const found = tenants.find((t) => t.id === id)
    if (found) setAmount(String(found.rent_amount))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const tenant = tenants.find((t) => t.id === tenantId)
    if (!tenant) return

    setLoading(true)
    setError('')

    const { error: insertError } = await supabase.from('payments').insert({
      tenant_id: tenant.id,
      unit_id: tenant.unit_id,
      amount: Number(amount),
      payment_date: paymentDate || new Date().toISOString().slice(0, 10),
      payment_method: method,
      status: 'paid',
      period_start: periodStart ? `${periodStart}-01` : null,
      period_end: periodEnd ? `${periodEnd}-01` : null,
    })

    if (insertError) {
      setError(insertError.message)
      setLoading(false)
      return
    }

    router.push('/payments')
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-xl mx-auto px-4 py-10">
        <a href="/payments" className="text-sm text-blue-600">← Malipo</a>
        <h1 className="text-2xl font-bold text-gray-900 mt-4 mb-6">Rekodi Malipo</h1>

        {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4 text-sm">{error}</div>}

        {tenants.length === 0 && !error && (
          <p className="text-gray-600">Hakuna mpangaji. Ongeza mpangaji kwanza.</p>
        )}

        {tenants.length > 0 && (
          <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">Mpangaji</label>
              <select value={tenantId} onChange={(e) => onTenantChange(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900">
                {tenants.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.full_name} — chumba {t.unit_number}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">Kiasi (TZS)</label>
              <input required type="number" min="0" value={amount} onChange={(e) => setAmount(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">Njia</label>
              <select value={method} onChange={(e) => setMethod(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900">
                <option>M-Pesa</option>
                <option>Mixx</option>
                <option>Airtel Money</option>
                <option>Cash</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">Tarehe ya malipo</label>
              <input type="date" value={paymentDate} onChange={(e) => setPaymentDate(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">Kodi kuanzia mwezi</label>
              <input required type="month" value={periodStart} onChange={(e) => setPeriodStart(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">Kodi mpaka mwezi</label>
              <input required type="month" value={periodEnd} onChange={(e) => setPeriodEnd(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900" />
            </div>
            <button disabled={loading} className="w-full bg-blue-600 text-white py-2.5 rounded-lg disabled:bg-blue-300">
              {loading ? 'Inahifadhi...' : 'Hifadhi Malipo'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}