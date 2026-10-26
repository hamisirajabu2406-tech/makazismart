'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

type Receipt = {
  id: string
  amount: number
  payment_date: string
  payment_method: string | null
  status: string
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

export default function ReceiptPage() {
  const router = useRouter()
  const [receipt, setReceipt] = useState<Receipt | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }

      const id = window.location.pathname.split('/')[2] || ''
      const { data: payment } = await supabase
        .from('payments')
        .select('id, amount, payment_date, payment_method, status, period_start, period_end, tenant_id, unit_id')
        .eq('id', id)
        .single()

      if (!payment) {
        setLoading(false)
        return
      }

      const { data: tenant } = await supabase
        .from('tenants')
        .select('full_name')
        .eq('id', payment.tenant_id)
        .single()

      const { data: unit } = await supabase
        .from('units')
        .select('unit_number, property_id')
        .eq('id', payment.unit_id)
        .single()

      let propertyName = ''
      if (unit?.property_id) {
        const { data: property } = await supabase
          .from('properties')
          .select('name')
          .eq('id', unit.property_id)
          .single()
        propertyName = property?.name || ''
      }

      setReceipt({
        id: payment.id,
        amount: payment.amount,
        payment_date: payment.payment_date,
        payment_method: payment.payment_method,
        status: payment.status,
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
  if (!receipt) return <p className="p-8 text-gray-600">Risiti haipatikani.</p>

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-lg mx-auto px-4 py-10">
        <a href="/payments" className="text-sm text-blue-600 print:hidden">← Malipo</a>
        <div className="bg-white p-8 rounded-xl shadow mt-4">
          <p className="text-sm text-blue-600 font-semibold">MakaziSmart</p>
          <h1 className="text-2xl font-bold text-gray-900 mt-1">Risiti ya Kodi</h1>
          <p className="text-3xl font-bold text-gray-900 mt-4">
            TZS {Number(receipt.amount).toLocaleString()}
          </p>
          <p className="text-base font-medium text-gray-900 mt-2">
            Kodi: {monthLabel(receipt.period_start)} mpaka {monthLabel(receipt.period_end)}
          </p>
          <div className="mt-6 space-y-2 text-sm text-gray-700">
            <p><span className="text-gray-500">Mpangaji:</span> {receipt.tenant_name}</p>
            <p><span className="text-gray-500">Mali:</span> {receipt.property_name}</p>
            <p><span className="text-gray-500">Chumba:</span> {receipt.unit_number}</p>
            <p><span className="text-gray-500">Tarehe ya malipo:</span> {receipt.payment_date}</p>
            <p><span className="text-gray-500">Njia:</span> {receipt.payment_method || '—'}</p>
            <p><span className="text-gray-500">Hali:</span> {receipt.status}</p>
          </div>
          <p className="text-xs text-gray-400 mt-6 break-all">Namba: {receipt.id}</p>
        </div>
        <button onClick={() => window.print()} className="mt-4 bg-gray-800 text-white px-4 py-2 rounded-lg text-sm print:hidden">
          Chapisha
        </button>
      </div>
    </div>
  )
}