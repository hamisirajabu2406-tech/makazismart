'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

type UserRow = {
  user_id: string
  full_name: string | null
  phone: string | null
  role: string
  email: string
  properties: number
  units: number
}

type PropertyRow = {
  property_id: string
  property_name: string
  property_type: string
  location: string | null
  owner_name: string | null
  owner_email: string | null
  units: number
  vacant: number
}

type InquiryRow = {
  inquiry_id: string
  sender_name: string
  sender_phone: string
  message: string | null
  status: string | null
  property_name: string
  unit_number: string
  owner_name: string | null
  created_at: string
}

export default function AdminPage() {
  const router = useRouter()
  const [users, setUsers] = useState<UserRow[]>([])
  const [properties, setProperties] = useState<PropertyRow[]>([])
  const [inquiries, setInquiries] = useState<InquiryRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }

      const { data: me } = await supabase
        .from('profiles')
        .select('role')
        .eq('user_id', user.id)
        .maybeSingle()

      if (me?.role !== 'admin') {
        router.push('/dashboard')
        return
      }

      const { data: userRows, error: userError } = await supabase.rpc('admin_overview')
      const { data: propertyRows, error: propertyError } = await supabase.rpc('admin_properties')
      const { data: inquiryRows, error: inquiryError } = await supabase.rpc('admin_inquiries')

      if (userError || propertyError || inquiryError) {
        setError(userError?.message || propertyError?.message || inquiryError?.message || 'Imeshindikana')
        setLoading(false)
        return
      }

      setUsers(userRows || [])
      setProperties(propertyRows || [])
      setInquiries(inquiryRows || [])
      setLoading(false)
    }
    load()
  }, [router])

  const landlords = users.filter((r) => r.role !== 'tenant')
  const tenants = users.filter((r) => r.role === 'tenant')

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-3xl mx-auto px-4 py-10">
        <a href="/dashboard" className="text-sm text-blue-600">← Dashboard</a>
        <h1 className="text-2xl font-bold text-gray-900 mt-4 mb-6">Admin</h1>
        {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4 text-sm">{error}</div>}
        {loading && <p className="text-gray-600">Inapakia...</p>}

        {!loading && (
          <>
          <h2 className="font-semibold text-gray-800 mb-2">Nia za kupanga ({inquiries.length})</h2>
<div className="space-y-3 mb-8">
  {inquiries.map((i) => (
    <div key={i.inquiry_id} className="bg-white p-4 rounded-xl shadow">
      <div className="flex justify-between gap-3">
        <p className="font-semibold text-gray-900">{i.sender_name} · {i.sender_phone}</p>
        <span className="text-sm text-sky-600">{i.status === 'contacted' ? 'Nimewasiliana' : 'Mpya'}</span>
      </div>
      <p className="text-sm text-gray-600">{i.property_name} · Chumba {i.unit_number}</p>
      <p className="text-sm text-gray-600">Mwenye nyumba: {i.owner_name || '—'}</p>
      {i.message && <p className="text-sm text-gray-800 mt-1">{i.message}</p>}
    </div>
  ))}
  {inquiries.length === 0 && <p className="text-gray-600">Bado hakuna nia.</p>}
</div>

            <h2 className="font-semibold text-gray-800 mb-2">Mali zote ({properties.length})</h2>
            <div className="space-y-3 mb-8">
              {properties.map((p) => (
                <div key={p.property_id} className="bg-white p-4 rounded-xl shadow">
                  <p className="font-semibold text-gray-900">{p.property_name}</p>
                  <p className="text-sm text-gray-600">
                    {p.property_type} · {p.location || '—'}
                  </p>
                  <p className="text-sm text-gray-600">
                    {p.owner_name || '—'} · {p.owner_email || '—'}
                  </p>
                  <p className="text-sm text-gray-600">
                    Vyumba {p.units} · Tupu {p.vacant}
                  </p>
                </div>
              ))}
              {properties.length === 0 && <p className="text-gray-600">Hakuna mali.</p>}
            </div>

            <h2 className="font-semibold text-gray-800 mb-2">Wenye nyumba ({landlords.length})</h2>
            <div className="space-y-3 mb-8">
              {landlords.map((r) => (
                <div key={r.user_id} className="bg-white p-4 rounded-xl shadow">
                  <p className="font-semibold text-gray-900">{r.full_name || '—'} · {r.role}</p>
                  <p className="text-sm text-gray-600">{r.email}</p>
                  <p className="text-sm text-gray-600">
                    {r.phone || 'Hakuna simu'} · Mali {r.properties} · Vyumba {r.units}
                  </p>
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