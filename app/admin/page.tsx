'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

type Row = {
  user_id: string
  full_name: string | null
  phone: string | null
  role: string
  email: string
  properties: number
  units: number
}

export default function AdminPage() {
  const router = useRouter()
  const [rows, setRows] = useState<Row[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }

      const { data, error: rpcError } = await supabase.rpc('admin_overview')
      if (rpcError) {
        setError(rpcError.message)
        setLoading(false)
        return
      }
      if (!data || data.length === 0) {
        const { data: me } = await supabase
          .from('profiles')
          .select('role')
          .eq('user_id', user.id)
          .maybeSingle()
        if (me?.role !== 'admin') {
          router.push('/dashboard')
          return
        }
      }
      setRows(data || [])
      setLoading(false)
    }
    load()
  }, [router])

  const landlords = rows.filter((r) => r.role !== 'tenant')
  const tenants = rows.filter((r) => r.role === 'tenant')

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-3xl mx-auto px-4 py-10">
        <a href="/dashboard" className="text-sm text-blue-600">← Dashboard</a>
        <h1 className="text-2xl font-bold text-gray-900 mt-4 mb-6">Admin</h1>
        {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4 text-sm">{error}</div>}
        {loading && <p className="text-gray-600">Inapakia...</p>}

        {!loading && (
          <>
            <h2 className="font-semibold text-gray-800 mb-2">Wenye nyumba ({landlords.length})</h2>
            <div className="space-y-3 mb-8">
              {landlords.map((r) => (
                <div key={r.user_id} className="bg-white p-4 rounded-xl shadow">
                  <p className="font-semibold text-gray-900">{r.full_name || '—'} · {r.role}</p>
                  <p className="text-sm text-gray-600">{r.email}</p>
                  <p className="text-sm text-gray-600">{r.phone || 'Hakuna simu'} · Mali {r.properties} · Vyumba {r.units}</p>
                </div>
              ))}
            </div>

            <h2 className="font-semibold text-gray-800 mb-2">Wapangaji ({tenants.length})</h2>
            <div className="space-y-3">
              {tenants.map((r) => (
                <div key={r.user_id} className="bg-white p-4 rounded-xl shadow">
                  <p className="font-semibold text-gray-900">{r.full_name || '—'}</p>
                  <p className="text-sm text-gray-600">{r.email}</p>
                  <p className="text-sm text-gray-600">{r.phone || 'Hakuna simu'}</p>
                </div>
              ))}
              {tenants.length === 0 && <p className="text-gray-600">Hakuna mpangaji aliyejisajili.</p>}
            </div>
          </>
        )}
      </div>
    </div>
  )
}