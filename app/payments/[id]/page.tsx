'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

type Receipt = {
  amount: number
  payment_date: string
  payment_method: string | null
  period_start: string | null
  period_end: string | null
  tenant_name: string
  unit_number: string
  property_name: string
}

const months = [
  'Januari', 'Februari', 'Machi', 'Aprili', 'Mei', 'Juni',
  'Julai', 'Agosti', 'Septemba', 'Oktoba', 'Novemba', 'Desemba',
]

function monthLabel(date: string | null) {
  if (!date) return ''
  const [year, month] = date.split('-')
  const index = Number(month) - 1
  if (!year || index < 0 || index > 11) return date
  return `${months[index]} ${year}`
}

export default function ReceiptPage() {
  const router = useRouter()
  const [receipt, setReceipt] = useState<Receipt | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const load = async () => {
      const parts = window.location.pathname.split('/')
      const id = parts[2] || ''
      if (!id) {
        setError('Risiti haipo.')
        setLoading(false)
        return
      }

      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }

      const { data: payment, error: paymentError } = await supabase
        .from('payments')
        .select('amount, payment_date, payment_method, period_start, period_end, tenant_id, unit_id')
        .eq('id', id)
        .single()

      if (paymentError || !payment) {
        setError(paymentError?.message || 'Risiti haipatikani.')
        setLoading(false)
        return
      }

      const { data: tenant } = await supabase
        .from('tenants')
        .select('full_name')
        .eq('id', payment.tenant_id)
        .maybeSingle()

      const { data: unit } = await supabase
        .from('units')
        .select('unit_number, property_id')
        .eq('id', payment.unit_id)
        .maybeSingle()

      let propertyName = ''
      if (unit?.property_id) {
        const { data: property } = await supabase
          .from('properties')
          .select('name')
          .eq('id', unit.property_id)
          .maybeSingle()
        propertyName = property?.name || ''
      }

      setReceipt({
        amount: payment.amount,
        payment_date: payment.payment_date,
        payment_method: payment.payment_method,
        period_start: payment.period_start,
        period_end: payment.period_end,
        tenant_name: tenant?.full_name || '—',
        unit_number: unit?.unit_number || '—',
        property_name: propertyName || '—',
      })
      setLoading(false)
    }
    load()
  }, [router])

  if (loading) return <p className="p-8 text-gray-600">Inapakia...</p>
  if (error || !receipt) return <p className="p-8 text-red-600">{error || 'Risiti haipatikani.'}</p>

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-xl mx-auto px-4 py-10">
        <div className="flex justify-between mb-4 print:hidden">
          <button onClick={() => router.back()} className="text-sm text-blue-600">← Rudi</button>
          <button onClick={() => window.print()} className="text-sm bg-gray-800 text-white px-3 py-1.5 rounded">
            Chapisha / PDF
          </button>
        </div>

        <div className="bg-white p-8 rounded-xl shadow print:shadow-none">
          <p className="text-sm text-blue-600 font-semibold">MakaziSmart</p>
          <h1 className="text-2xl font-bold text-gray-900 mt-1">Risiti ya kodi</h1>
          <p className="text-4xl font-bold text-gray-900 mt-6">
            TZS {Number(receipt.amount).toLocaleString()}
          </p>
          <div className="mt-6 space-y-2 text-gray-800">
            <p>Mpangaji: {receipt.tenant_name}</p>
            <p>Mali: {receipt.property_name}</p>
            <p>Chumba: {receipt.unit_number}</p>
            <p>Tarehe ya malipo: {receipt.payment_date}</p>
            <p>Njia: {receipt.payment_method || '—'}</p>
            {receipt.period_start && (
              <p>Kodi: {monthLabel(receipt.period_start)} mpaka {monthLabel(receipt.period_end)}</p>
            )}
          </div>
          <p className="text-xs text-gray-400 mt-8">Risiti hii ni kumbukumbu ya malipo yaliyorekodiwa kwenye MakaziSmart.</p>
        </div>
      </div>
    </div>
  )
}