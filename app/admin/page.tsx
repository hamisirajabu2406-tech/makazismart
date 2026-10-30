'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

type Money = {
  collected: number
  owed: number
  unpaid_tenants: number
  landlords_waiting: number
}

type MarketRow = {
  unit_id: string
  unit_number: string
  rent_amount: number
  listed: boolean
  photo_url: string | null
  property_name: string
  location: string | null
  owner_name: string | null
}

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
}

type FixRow = {
  request_id: string
  title: string
  description: string | null
  status: string | null
  photo_url: string | null
  property_name: string
  unit_number: string
  owner_name: string | null
}

function fixLabel(status: string | null) {
  if (status === 'done') return 'Imekamilika'
  if (status === 'assigned') return 'Fundi amepangwa'
  return 'Imepokelewa'
}

export default function AdminPage() {
  const router = useRouter()
  const [money, setMoney] = useState<Money | null>(null)
  const [market, setMarket] = useState<MarketRow[]>([])
  const [users, setUsers] = useState<UserRow[]>([])
  const [properties, setProperties] = useState<PropertyRow[]>([])
  const [inquiries, setInquiries] = useState<InquiryRow[]>([])
  const [fixes, setFixes] = useState<FixRow[]>([])
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

      const moneyQ = await supabase.rpc('admin_month_money')
      const marketQ = await supabase.rpc('admin_market')
      const usersQ = await supabase.rpc('admin_overview')
      const propsQ = await supabase.rpc('admin_properties')
      const inqQ = await supabase.rpc('admin_inquiries')
      const fixQ = await supabase.rpc('admin_maintenance')

      const failed = moneyQ.error || marketQ.error || usersQ.error || propsQ.error || inqQ.error || fixQ.error
      if (failed) {
        setError(failed.message)
        setLoading(false)
        return
      }

      setMoney(moneyQ.data?.[0] || null)
      setMarket(marketQ.data || [])
      setUsers(usersQ.data || [])
      setProperties(propsQ.data || [])
      setInquiries(inqQ.data || [])
      setFixes(fixQ.data || [])
      setLoading(false)
    }
    load()
  }, [router])

  const landlords = users.filter((r) => r.role !== 'tenant')
  const tenants = users.filter((r) => r.role === 'tenant')
  const onMarket = market.filter((m) => m.listed).length
  const hidden = market.filter((m) => !m.listed).length

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-3xl mx-auto px-4 py-10">
        <a href="/dashboard" className="text-sm text-blue-600">← Dashboard</a>
        <h1 className="text-2xl font-bold text-gray-900 mt-4 mb-6">Admin</h1>
        {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4 text-sm">{error}</div>}
        {loading && <p className="text-gray-600">Inapakia...</p>}

        {!loading && (
          <>
            {money && (
              <div className="grid grid-cols-2 gap-3 mb-8">
                <div className="bg-white p-4 rounded-xl shadow">
                  <p className="text-sm text-gray-500">Imekusanywa mwezi huu</p>
                  <p className="text-xl font-bold text-green-600">TZS {Number(money.collected).toLocaleString()}</p>
                </div>
                <div className="bg-white p-4 rounded-xl shadow">
                  <p className="text-sm text-gray-500">Inadaiwa mwezi huu</p>
                  <p className="text-xl font-bold text-red-500">TZS {Number(money.owed).toLocaleString()}</p>
                </div>
                <div className="bg-white p-4 rounded-xl shadow">
                  <p className="text-sm text-gray-500">Wapangaji hawajalipa</p>
                  <p className="text-xl font-bold text-gray-900">{money.unpaid_tenants}</p>
                </div>
                <div className="bg-white p-4 rounded-xl shadow">
                  <p className="text-sm text-gray-500">Wenye nyumba wenye madai</p>
                  <p className="text-xl font-bold text-gray-900">{money.landlords_waiting}</p>
                </div>
              </div>
            )}

            <h2 className="font-semibold text-gray-800 mb-2">
              Soko ({onMarket} wazi, {hidden} vimefichwa)
            </h2>
            <div className="space-y-3 mb-8">
              {market.map((m) => (
                <div key={m.unit_id} className="bg-white p-4 rounded-xl shadow">
                  <div className="flex justify-between gap-3">
                    <p className="font-semibold text-gray-900">{m.property_name} · {m.unit_number}</p>
                    <span className={m.listed ? 'text-emerald-700 text-sm' : 'text-gray-400 text-sm'}>
                      {m.listed ? 'Sokoni' : 'Imefichwa'}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">{m.location || '—'} · {m.owner_name || '—'}</p>
                  <p className="text-sm text-gray-800">TZS {Number(m.rent_amount).toLocaleString()} / mwezi</p>
                </div>
              ))}
              {market.length === 0 && <p className="text-gray-600">Hakuna chumba tupu.</p>}
            </div>

            <h2 className="font-semibold text-gray-800 mb-2">Matengenezo ({fixes.length})</h2>
            <div className="space-y-3 mb-8">
              {fixes.map((f) => (
                <div key={f.request_id} className="bg-white p-4 rounded-xl shadow">
                  <div className="flex justify-between gap-3">
                    <p className="font-semibold text-gray-900">{f.title}</p>
                    <span className={f.status === 'done' ? 'text-green-600 text-sm' : 'text-amber-600 text-sm'}>
                      {fixLabel(f.status)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">{f.property_name} · Chumba {f.unit_number}</p>
                  <p className="text-sm text-gray-600">Mwenye nyumba: {f.owner_name || '—'}</p>
                  {f.description && <p className="text-sm text-gray-800 mt-1">{f.description}</p>}
                  {f.photo_url && <img src={f.photo_url} alt="" className="mt-3 h-36 w-full object-cover rounded-lg" />}
                </div>
              ))}
              {fixes.length === 0 && <p className="text-gray-600">Hakuna maombi.</p>}
            </div>

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
                  <p className="text-sm text-gray-600">{p.property_type} · {p.location || '—'}</p>
                  <p className="text-sm text-gray-600">{p.owner_name || '—'} · {p.owner_email || '—'}</p>
                  <p className="text-sm text-gray-600">Vyumba {p.units} · Tupu {p.vacant}</p>
                </div>
              ))}
            </div>

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