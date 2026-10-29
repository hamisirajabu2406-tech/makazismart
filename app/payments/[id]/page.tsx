'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

type Receipt = {
  id: string
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
  if (!date) return '—'
  const [year, month] = date.split('-')
  const index = Number(month) - 1
  if (!year || index < 0 || index > 11) return date
  return `${months[index]} ${year}`
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4 py-3 border-b border-gray-100 last:border-0">
      <span className="text-sm text-gray-500">{label}</span>
      <span className="text-sm font-medium text-gray-900 text-right">{value}</span>
    </div>
  )
}

export default function ReceiptPage() {
  const router = useRouter()
  const [receipt, setReceipt] = useState<Receipt | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const load = async () => {
      const id = window.location.pathname.split('/')[2] || ''
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
        .select('id, amount, payment_date, payment_method, period_start, period_end, tenant_id, unit_id')
        .eq('id', id)
        .single()

      if (paymentError || !payment) {
        setError(paymentError?.message || 'Risiti haipatikani.')
        setLoading(false)
        return
      }

      const { data: tenant } = await supabase.from('tenants').select('full_name').eq('id', payment.tenant_id).maybeSingle()
      const { data: unit } = await supabase.from('units').select('unit_number, property_id').eq('id', payment.unit_id).maybeSingle()

      let propertyName = ''
      if (unit?.property_id) {
        const { data: property } = await supabase.from('properties').select('name').eq('id', unit.property_id).maybeSingle()
        propertyName = property?.name || ''
      }

      setReceipt({
        id: payment.id.slice(0, 8).toUpperCase(),
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

  if (loading) return <p className="p-8 text-gray-500">Inapakia...</p>
  if (error || !receipt) return <p className="p-8 text-red-600">{error || 'Risiti haipatikani.'}</p>

  return (
    <div className="min-h-screen bg-slate-100 print:bg-white">
      <div className="max-w-md mx-auto px-4 py-10 print:py-0 print:max-w-none">
        <div className="flex justify-between items-center mb-4 print:hidden">
          <button onClick={() => router.back()} className="text-sm text-slate-500">Rudi</button>
          <button onClick={() => window.print()} className="text-sm bg-slate-900 text-white px-4 py-2 rounded-full">
            Pakua PDF
          </button>
        </div>

        <article className="bg-white rounded-3xl shadow-sm overflow-hidden print:shadow-none print:rounded-none">
          <div className="bg-slate-900 text-white px-6 py-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs tracking-widest text-slate-400">MAKAZISMART</p>
                <h1 className="text-xl font-semibold mt-1">Risiti ya kodi</h1>
              </div>
              <p className="text-xs text-slate-400">#{receipt.id}</p>
            </div>
            <p className="text-3xl font-semibold mt-6">TZS {Number(receipt.amount).toLocaleString()}</p>
            <p className="text-sm text-slate-300 mt-1">Imelipwa</p>
          </div>

          <div className="px-6 py-2">
            <Row label="Mpangaji" value={receipt.tenant_name} />
            <Row label="Mali" value={receipt.property_name} />
            <Row label="Chumba" value={receipt.unit_number} />
            <Row label="Tarehe" value={receipt.payment_date} />
            <Row label="Njia" value={receipt.payment_method || '—'} />
            <Row
              label="Kipindi cha kodi"
              value={receipt.period_start ? `${monthLabel(receipt.period_start)} – ${monthLabel(receipt.period_end)}` : '—'}
            />
          </div>

          <p className="px-6 pb-6 pt-2 text-xs text-slate-400">
            Kumbukumbu ya malipo yaliyorekodiwa. Si risiti ya kodi ya serikali.
          </p>
        </article>
      </div>
    </div>
  )
}