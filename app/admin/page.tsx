'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

type Tab = 'soko' | 'matengenezo' | 'nia' | 'mali' | 'watu'

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
  billing_status: string
  days_used: number
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
  status: string | null
  property_name: string
  unit_number: string
  owner_name: string | null
}

function fixLabel(status: string | null) {
  if (status === 'done') return 'Imekamilika'
  if (status === 'assigned') return 'Fundi amepangwa'
  return 'Imepokelewa'
}

function hit(query: string, parts: Array<string | null | undefined>) {
  const q = query.trim().toLowerCase()
  if (!q) return true
  return parts.join(' ').toLowerCase().includes(q)
}

function billLabel(u: UserRow) {
  if (u.role === 'tenant') return '—'
  if (u.billing_status === 'active' || u.role === 'admin') return 'Imewashwa'
  if (u.days_used >= 30) return 'Imefungwa'
  return `Jaribio ${Math.min(u.days_used, 30)}/30`
}

export default function AdminPage() {
  const router = useRouter()
  const [tab, setTab] = useState<Tab>('soko')
  const [query, setQuery] = useState('')
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

  const unlock = async (userId: string) => {
    const { error: rpcError } = await supabase.rpc('admin_set_billing', {
      p_user_id: userId,
      p_status: 'active',
    })
    if (rpcError) {
      setError(rpcError.message)
      return
    }
    setUsers((list) => list.map((u) => (u.user_id === userId ? { ...u, billing_status: 'active' } : u)))
  }

  const tabs: { id: Tab; label: string; count: number }[] = [
    { id: 'soko', label: 'Soko', count: market.length },
    { id: 'matengenezo', label: 'Matengenezo', count: fixes.length },
    { id: 'nia', label: 'Nia', count: inquiries.length },
    { id: 'mali', label: 'Mali', count: properties.length },
    { id: 'watu', label: 'Watu', count: users.length },
  ]

  const marketRows = market.filter((m) => hit(query, [m.property_name, m.unit_number, m.location, m.owner_name]))
  const fixRows = fixes.filter((f) => hit(query, [f.title, f.property_name, f.unit_number, f.owner_name, fixLabel(f.status)]))
  const inquiryRows = inquiries.filter((i) => hit(query, [i.sender_name, i.sender_phone, i.property_name, i.owner_name, i.message]))
  const propertyRows = properties.filter((p) => hit(query, [p.property_name, p.location, p.owner_name, p.owner_email, p.property_type]))
  const userRows = users.filter((u) => hit(query, [u.full_name, u.email, u.phone, u.role, billLabel(u)]))

  return (
    <div className="min-h-screen bg-slate-100">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <a href="/dashboard" className="text-sm text-blue-600">← Dashboard</a>
        <h1 className="text-2xl font-bold text-slate-900 mt-3">Admin</h1>
        {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4 text-sm mt-4">{error}</div>}
        {loading && <p className="text-slate-600 mt-6">Inapakia...</p>}

        {!loading && (
          <>
            {money && (
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-6">
                <div className="bg-white rounded-xl p-4 shadow-sm">
                  <p className="text-xs text-slate-500">Imekusanywa</p>
                  <p className="text-lg font-semibold text-emerald-700">TZS {Number(money.collected).toLocaleString()}</p>
                </div>
                <div className="bg-white rounded-xl p-4 shadow-sm">
                  <p className="text-xs text-slate-500">Inadaiwa</p>
                  <p className="text-lg font-semibold text-red-600">TZS {Number(money.owed).toLocaleString()}</p>
                </div>
                <div className="bg-white rounded-xl p-4 shadow-sm">
                  <p className="text-xs text-slate-500">Hawajalipa</p>
                  <p className="text-lg font-semibold">{money.unpaid_tenants}</p>
                </div>
                <div className="bg-white rounded-xl p-4 shadow-sm">
                  <p className="text-xs text-slate-500">Wenye madai</p>
                  <p className="text-lg font-semibold">{money.landlords_waiting}</p>
                </div>
              </div>
            )}

            <div className="mt-6 flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
              <div className="flex gap-2 overflow-x-auto">
                {tabs.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setTab(t.id)}
                    className={`shrink-0 px-3 py-2 rounded-lg text-sm ${
                      tab === t.id ? 'bg-slate-900 text-white' : 'bg-white text-slate-700 border'
                    }`}
                  >
                    {t.label} {t.count}
                  </button>
                ))}
              </div>
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Tafuta jina, simu, mali..."
                className="w-full sm:w-64 border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-900 bg-white"
              />
            </div>

            <div className="mt-4 bg-white rounded-xl shadow-sm overflow-x-auto">
              {tab === 'soko' && (
                <table className="w-full text-sm">
                  <thead className="text-left text-slate-500 border-b">
                    <tr>
                      <th className="p-3 font-medium">Mali</th>
                      <th className="p-3 font-medium">Chumba</th>
                      <th className="p-3 font-medium">Eneo</th>
                      <th className="p-3 font-medium">Mwenye</th>
                      <th className="p-3 font-medium">Kodi</th>
                      <th className="p-3 font-medium">Hali</th>
                    </tr>
                  </thead>
                  <tbody>
                    {marketRows.map((m) => (
                      <tr key={m.unit_id} className="border-b last:border-0">
                        <td className="p-3">{m.property_name}</td>
                        <td className="p-3">{m.unit_number}</td>
                        <td className="p-3">{m.location || '—'}</td>
                        <td className="p-3">{m.owner_name || '—'}</td>
                        <td className="p-3">{Number(m.rent_amount).toLocaleString()}</td>
                        <td className={`p-3 ${m.listed ? 'text-emerald-700' : 'text-slate-400'}`}>
                          {m.listed ? 'Sokoni' : 'Imefichwa'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}

              {tab === 'matengenezo' && (
                <table className="w-full text-sm">
                  <thead className="text-left text-slate-500 border-b">
                    <tr>
                      <th className="p-3 font-medium">Ombi</th>
                      <th className="p-3 font-medium">Mali</th>
                      <th className="p-3 font-medium">Chumba</th>
                      <th className="p-3 font-medium">Mwenye</th>
                      <th className="p-3 font-medium">Hali</th>
                    </tr>
                  </thead>
                  <tbody>
                    {fixRows.map((f) => (
                      <tr key={f.request_id} className="border-b last:border-0">
                        <td className="p-3">{f.title}</td>
                        <td className="p-3">{f.property_name}</td>
                        <td className="p-3">{f.unit_number}</td>
                        <td className="p-3">{f.owner_name || '—'}</td>
                        <td className="p-3">{fixLabel(f.status)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}

              {tab === 'nia' && (
                <table className="w-full text-sm">
                  <thead className="text-left text-slate-500 border-b">
                    <tr>
                      <th className="p-3 font-medium">Mtu</th>
                      <th className="p-3 font-medium">Simu</th>
                      <th className="p-3 font-medium">Mali</th>
                      <th className="p-3 font-medium">Mwenye</th>
                      <th className="p-3 font-medium">Hali</th>
                    </tr>
                  </thead>
                  <tbody>
                    {inquiryRows.map((i) => (
                      <tr key={i.inquiry_id} className="border-b last:border-0">
                        <td className="p-3">{i.sender_name}</td>
                        <td className="p-3">{i.sender_phone}</td>
                        <td className="p-3">{i.property_name} · {i.unit_number}</td>
                        <td className="p-3">{i.owner_name || '—'}</td>
                        <td className="p-3">{i.status === 'contacted' ? 'Nimewasiliana' : 'Mpya'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}

              {tab === 'mali' && (
                <table className="w-full text-sm">
                  <thead className="text-left text-slate-500 border-b">
                    <tr>
                      <th className="p-3 font-medium">Mali</th>
                      <th className="p-3 font-medium">Aina</th>
                      <th className="p-3 font-medium">Eneo</th>
                      <th className="p-3 font-medium">Mwenye</th>
                      <th className="p-3 font-medium">Vyumba</th>
                      <th className="p-3 font-medium">Tupu</th>
                    </tr>
                  </thead>
                  <tbody>
                    {propertyRows.map((p) => (
                      <tr key={p.property_id} className="border-b last:border-0">
                        <td className="p-3">{p.property_name}</td>
                        <td className="p-3">{p.property_type}</td>
                        <td className="p-3">{p.location || '—'}</td>
                        <td className="p-3">{p.owner_name || p.owner_email || '—'}</td>
                        <td className="p-3">{p.units}</td>
                        <td className="p-3">{p.vacant}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}

              {tab === 'watu' && (
                <table className="w-full text-sm">
                  <thead className="text-left text-slate-500 border-b">
                    <tr>
                      <th className="p-3 font-medium">Jina</th>
                      <th className="p-3 font-medium">Email</th>
                      <th className="p-3 font-medium">Simu</th>
                      <th className="p-3 font-medium">Aina</th>
                      <th className="p-3 font-medium">Hali</th>
                      <th className="p-3 font-medium"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {userRows.map((u) => (
                      <tr key={u.user_id} className="border-b last:border-0">
                        <td className="p-3">{u.full_name || '—'}</td>
                        <td className="p-3">{u.email}</td>
                        <td className="p-3">{u.phone || '—'}</td>
                        <td className="p-3">{u.role === 'tenant' ? 'Mpangaji' : u.role === 'admin' ? 'Admin' : 'Mwenye nyumba'}</td>
                        <td className="p-3">{billLabel(u)}</td>
                        <td className="p-3">
                          {u.role !== 'tenant' && u.role !== 'admin' && u.billing_status !== 'active' && (
                            <button onClick={() => unlock(u.user_id)} className="text-sm bg-emerald-700 text-white px-3 py-1 rounded">
                              Washa
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}

              {((tab === 'soko' && marketRows.length === 0) ||
                (tab === 'matengenezo' && fixRows.length === 0) ||
                (tab === 'nia' && inquiryRows.length === 0) ||
                (tab === 'mali' && propertyRows.length === 0) ||
                (tab === 'watu' && userRows.length === 0)) && (
                <p className="p-4 text-sm text-slate-500">Hakuna kinachoendana na utafutaji.</p>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}