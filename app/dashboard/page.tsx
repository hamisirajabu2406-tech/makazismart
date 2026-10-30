'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

type Property = {
  id: string
  name: string
  type: string
  location: string
  status: string
}

function coversMonth(p: {
  status: string | null
  period_start: string | null
  period_end: string | null
  payment_date: string | null
}, monthKey: string) {
  if (p.status && p.status !== 'paid') return false
  if (p.period_start && p.period_end) {
    return p.period_start.slice(0, 7) <= monthKey && p.period_end.slice(0, 7) >= monthKey
  }
  return (p.payment_date || '').slice(0, 7) === monthKey
}

const money = (n: number) => `TZS ${Number(n || 0).toLocaleString()}`

export default function DashboardPage() {
  const router = useRouter()
  const [userEmail, setUserEmail] = useState('')
  const [fullName, setFullName] = useState('')
  const [properties, setProperties] = useState<Property[]>([])
  const [occupied, setOccupied] = useState(0)
  const [vacant, setVacant] = useState(0)
  const [pendingPayments, setPendingPayments] = useState(0)
  const [newInquiries, setNewInquiries] = useState(0)
  const [collected, setCollected] = useState(0)
  const [owed, setOwed] = useState(0)
  const [daysUsed, setDaysUsed] = useState(0)
  const [billingOn, setBillingOn] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }

      setUserEmail(user.email || '')

      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name, role, billing_status, trial_started_at')
        .eq('user_id', user.id)
        .maybeSingle()

      if (profile?.role === 'tenant') {
        router.push('/tenants/home')
        return
      }

      const used = Math.max(
        0,
        Math.floor((Date.now() - new Date(profile?.trial_started_at || Date.now()).getTime()) / 86400000)
      )
      setDaysUsed(used)
      const open = profile?.billing_status === 'active' || profile?.role === 'admin'
      setBillingOn(open)
      if (profile?.role !== 'admin' && profile?.billing_status !== 'active' && used >= 30) {
        router.push('/billing')
        return
      }

      setFullName(profile?.full_name || '')

      const { data } = await supabase
        .from('properties')
        .select('id, name, type, location, status')
        .eq('owner_id', user.id)
        .order('created_at', { ascending: false })

      const propertyRows = data || []
      setProperties(propertyRows)

      const propertyIds = propertyRows.map((p) => p.id)
      if (propertyIds.length === 0) {
        setLoading(false)
        return
      }

      const { data: units } = await supabase
        .from('units')
        .select('id, status, rent_amount')
        .in('property_id', propertyIds)

      const unitRows = units || []
      setOccupied(unitRows.filter((u) => u.status === 'occupied').length)
      setVacant(unitRows.filter((u) => u.status !== 'occupied').length)

      const unitIds = unitRows.map((u) => u.id)
      const rentByUnit = Object.fromEntries(unitRows.map((u) => [u.id, Number(u.rent_amount) || 0]))

      if (unitIds.length > 0) {
        const now = new Date()
        const monthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`

        const { data: tenants } = await supabase
          .from('tenants')
          .select('id, unit_id')
          .in('unit_id', unitIds)
          .eq('status', 'active')

        const { data: payments } = await supabase
          .from('payments')
          .select('tenant_id, amount, payment_date, period_start, period_end, status')
          .in('unit_id', unitIds)

        const paid = new Set(
          (payments || []).filter((p) => coversMonth(p, monthKey)).map((p) => p.tenant_id)
        )

        setCollected(
          (payments || []).filter((p) => coversMonth(p, monthKey)).reduce((sum, p) => sum + (Number(p.amount) || 0), 0)
        )
        setOwed(
          (tenants || []).filter((t) => !paid.has(t.id)).reduce((sum, t) => sum + (rentByUnit[t.unit_id] || 0), 0)
        )
        setPendingPayments((tenants || []).filter((t) => !paid.has(t.id)).length)

        const { data: inquiries } = await supabase
          .from('inquiries')
          .select('id, status')
          .in('unit_id', unitIds)

        setNewInquiries((inquiries || []).filter((i) => !i.status || i.status === 'new').length)
      }

      setLoading(false)
    }

    load()
  }, [router])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Inapakia...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold text-blue-600">MakaziSmart</h1>
          <div className="flex items-center gap-4">
            <span className="text-gray-700">Habari, {fullName || userEmail}</span>
            <button onClick={handleLogout} className="text-sm bg-red-500 text-white px-3 py-1.5 rounded hover:bg-red-600">
              Toka
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Dashboard</h2>
        {!billingOn && (
          <p className="mb-4 text-sm bg-amber-50 text-amber-800 border border-amber-200 rounded-lg px-3 py-2">
            Jaribio: umetumia siku {Math.min(daysUsed, 30)} kati ya 30. Zimebaki {Math.max(0, 30 - daysUsed)}.
          </p>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div className="bg-white p-5 rounded-xl shadow">
            <p className="text-sm text-gray-500">Imekusanywa mwezi huu</p>
            <p className="text-2xl font-bold text-green-600">{money(collected)}</p>
          </div>
          <div className="bg-white p-5 rounded-xl shadow">
            <p className="text-sm text-gray-500">Inadaiwa mwezi huu</p>
            <p className="text-2xl font-bold text-red-500">{money(owed)}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
          <div className="bg-white p-5 rounded-xl shadow">
            <p className="text-sm text-gray-500">Mali Zangu</p>
            <p className="text-2xl font-bold text-gray-800">{properties.length}</p>
          </div>
          <div className="bg-white p-5 rounded-xl shadow">
            <p className="text-sm text-gray-500">Vyumba Vilivyokaliwa</p>
            <p className="text-2xl font-bold text-green-600">{occupied}</p>
          </div>
          <div className="bg-white p-5 rounded-xl shadow">
            <p className="text-sm text-gray-500">Vyumba Tupu</p>
            <p className="text-2xl font-bold text-orange-500">{vacant}</p>
          </div>
          <div className="bg-white p-5 rounded-xl shadow">
            <p className="text-sm text-gray-500">Hawajalipa mwezi huu</p>
            <p className="text-2xl font-bold text-red-500">{pendingPayments}</p>
          </div>
          <a href="/inquiries" className="bg-white p-5 rounded-xl shadow block">
            <p className="text-sm text-gray-500">Nia mpya</p>
            <p className="text-2xl font-bold text-sky-600">{newInquiries}</p>
          </a>
        </div>

        <div className="bg-white p-6 rounded-xl shadow mb-6">
          <div className="flex flex-wrap gap-3 mb-4">
            <a href="/properties/new" className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm">+ Ongeza Mali</a>
            <a href="/inquiries" className="bg-sky-600 text-white px-4 py-2 rounded-lg text-sm">Nia za kupanga</a>
            <a href="/tenants/new" className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm">+ Ongeza Mpangaji</a>
            <a href="/tenants" className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm">Wapangaji</a>
            <a href="/payments" className="bg-gray-700 text-white px-4 py-2 rounded-lg text-sm">Angalia Malipo</a>
            <a href="/unpaid" className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm">Hawajalipa</a>
            <a href="/maintenance" className="bg-amber-600 text-white px-4 py-2 rounded-lg text-sm">Matengenezo</a>
            <a href="/listings" className="bg-gray-800 text-white px-4 py-2 rounded-lg text-sm">Vyumba wazi</a>
            <a href="/settings" className="bg-white text-gray-800 border px-4 py-2 rounded-lg text-sm">Wasifu</a>
            <a href="/admin" className="bg-black text-white px-4 py-2 rounded-lg text-sm">Admin</a>
          </div>

          {properties.length === 0 && <p className="text-gray-600">Bado huna mali.</p>}

          <div className="space-y-3">
            {properties.map((p) => (
              <a key={p.id} href={`/properties/${p.id}`} className="block border rounded-lg p-3 hover:bg-gray-50">
                <p className="font-medium text-gray-900">{p.name}</p>
                <p className="text-sm text-gray-600">{p.type} · {p.location || '—'} · {p.status}</p>
              </a>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}