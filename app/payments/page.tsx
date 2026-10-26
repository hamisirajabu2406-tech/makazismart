'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

type Payment = {
  id: string
  amount: number
  payment_date: string
  payment_method: string | null
  status: string
}

export default function PaymentsPage() {
  const router = useRouter()
  const [rows, setRows] = useState<Payment[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }

      const { data } = await supabase
        .from('payments')
        .select('id, amount, payment_date, payment_method, status')
        .order('created_at', { ascending: false })

      setRows(data || [])
      setLoading(false)
    }
    load()
  }, [router])

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-3xl mx-auto px-4 py-10">
        <a href="/dashboard" className="text-sm text-blue-600">← Dashboard</a>
        <div className="flex justify-between items-center mt-4 mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Malipo</h1>
          <a href="/payments/new" className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm">
            + Rekodi Malipo
          </a>
        </div>

        {loading && <p className="text-gray-600">Inapakia...</p>}
        {!loading && rows.length === 0 && (
          <p className="text-gray-600">Bado hakuna malipo yaliyorekodiwa.</p>
        )}

        <div className="space-y-3">
          {rows.map((p) => (
            <a key={p.id} href={`/payments/${p.id}`} className="block bg-white p-4 rounded-xl shadow hover:bg-gray-50">
              <p className="font-medium text-gray-900">TZS {Number(p.amount).toLocaleString()}</p>
              <p className="text-sm text-gray-600">
                {p.payment_date} · {p.payment_method || '—'} · {p.status}
              </p>
            </a>
          ))}
        </div>
      </div>
    </div>
  )
}