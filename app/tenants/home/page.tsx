'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

type PaymentRow = {
  id: string
  amount: number
  payment_date: string
  payment_method: string | null
  period_start: string | null
  period_end: string | null
  status: string | null
}

type RequestRow = {
  id: string
  title: string
  status: string
  description: string | null
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

function coversMonth(p: PaymentRow, monthKey: string) {
  if (p.status && p.status !== 'paid') return false
  if (p.period_start && p.period_end) {
    return p.period_start.slice(0, 7) <= monthKey && p.period_end.slice(0, 7) >= monthKey
  }
  return (p.payment_date || '').slice(0, 7) === monthKey
}

function waNumber(phone: string) {
  let n = phone.replace(/\D/g, '')
  if (n.startsWith('0')) n = '255' + n.slice(1)
  if (!n.startsWith('255')) n = '255' + n
  return n
}

export default function TenantHomePage() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [unit, setUnit] = useState('')
  const [property, setProperty] = useState('')
  const [rent, setRent] = useState(0)
  const [unitId, setUnitId] = useState('')
  const [tenantId, setTenantId] = useState('')
  const [landlordPhone, setLandlordPhone] = useState('')
  const [payments, setPayments] = useState<PaymentRow[]>([])
  const [requests, setRequests] = useState<RequestRow[]>([])
  const [paidThisMonth, setPaidThisMonth] = useState(false)
  const [thisMonth, setThisMonth] = useState('')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  const loadRequests = async (id: string) => {
    const { data } = await supabase
      .from('maintenance_requests')
      .select('id, title, status, description')
      .eq('unit_id', id)
      .order('created_at', { ascending: false })
    setRequests(data || [])
  }

  useEffect(() => {
    const load = async () => {
      const now = new Date()
      const monthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
      setThisMonth(`${months[now.getMonth()]} ${now.getFullYear()}`)

      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/tenants/login')
        return
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('user_id', user.id)
        .maybeSingle()

      if (profile?.role && profile.role !== 'tenant') {
        router.push('/dashboard')
        return
      }

      const { data: tenant } = await supabase
        .from('tenants')
        .select('id, full_name, unit_id')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .maybeSingle()

      if (!tenant) {
        setError('Akaunti haijaunganishwa na chumba. Simu kwenye usajili lazima ilingane na ile ya mwenye nyumba.')
        setLoading(false)
        return
      }

      const { data: phone } = await supabase.rpc('my_landlord_phone')
      setLandlordPhone(phone || '')

      const { data: unitRow } = await supabase
        .from('units')
        .select('id, unit_number, rent_amount, property_id')
        .eq('id', tenant.unit_id)
        .single()

      let propertyName = ''
      if (unitRow?.property_id) {
        const { data: prop } = await supabase
          .from('properties')
          .select('name')
          .eq('id', unitRow.property_id)
          .single()
        propertyName = prop?.name || ''
      }

      const { data: paymentRows } = await supabase
        .from('payments')
        .select('id, amount, payment_date, payment_method, period_start, period_end, status')
        .eq('tenant_id', tenant.id)
        .order('payment_date', { ascending: false })

      const list = paymentRows || []
      setPaidThisMonth(list.some((p) => coversMonth(p, monthKey)))
      setName(tenant.full_name)
      setTenantId(tenant.id)
      setUnit(unitRow?.unit_number || '')
      setRent(unitRow?.rent_amount || 0)
      setProperty(propertyName)
      setUnitId(unitRow?.id || '')
      setPayments(list)
      if (unitRow?.id) await loadRequests(unitRow.id)
      setLoading(false)
    }
    load()
  }, [router])

  const sendRequest = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage('')
    const { error: insertError } = await supabase.from('maintenance_requests').insert({
      unit_id: unitId,
      tenant_id: tenantId || null,
      title,
      description,
      status: 'pending',
    })
    if (insertError) {
      setMessage(insertError.message)
      return
    }
    setTitle('')
    setDescription('')
    setMessage('Ombi limetumwa kwa mwenye nyumba.')
    await loadRequests(unitId)
  }

  const logout = async () => {
    await supabase.auth.signOut()
    router.push('/tenants/login')
  }

  if (loading) return <p className="p-8 text-gray-600">Inapakia...</p>

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-xl mx-auto px-4 py-10">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Habari, {name || 'Mpangaji'}</h1>
          <button onClick={logout} className="text-sm bg-red-500 text-white px-3 py-1.5 rounded">Toka</button>
        </div>

        {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4 text-sm">{error}</div>}

        {!error && (
          <>
            <div className="bg-white p-5 rounded-xl shadow mb-6">
              <div className="flex justify-between gap-3">
                <div>
                  <p className="text-gray-800">{property} · Chumba {unit}</p>
                  <p className="text-gray-600">Kodi: TZS {Number(rent).toLocaleString()} / mwezi</p>
                  <p className="text-sm text-gray-500 mt-1">{thisMonth}</p>
                </div>
                <span className={paidThisMonth ? 'text-green-600 font-semibold' : 'text-red-600 font-semibold'}>
                  {paidThisMonth ? 'Umelipa' : 'Bado hujalipa'}
                </span>
              </div>
            </div>

            <div className="bg-white p-5 rounded-xl shadow mb-6">
              <h2 className="font-semibold text-gray-900 mb-3">Wasiliana na mwenye nyumba</h2>
              {landlordPhone ? (
                <div className="flex flex-wrap gap-2">
                  <a href={`tel:${landlordPhone}`} className="text-sm bg-gray-800 text-white px-3 py-1.5 rounded">Piga simu</a>
                  <a href={`https://wa.me/${waNumber(landlordPhone)}`} className="text-sm bg-green-600 text-white px-3 py-1.5 rounded">WhatsApp</a>
                  <a href={`sms:${landlordPhone}`} className="text-sm border border-gray-400 px-3 py-1.5 rounded text-gray-800">SMS</a>
                </div>
              ) : (
                <p className="text-sm text-gray-500">Simu ya mwenye nyumba haipatikani.</p>
              )}
            </div>

            <div className="bg-white p-5 rounded-xl shadow mb-6">
              <h2 className="font-semibold text-gray-900 mb-3">Malipo yangu</h2>
              {payments.length === 0 && <p className="text-sm text-gray-600">Bado hakuna malipo.</p>}
              <div className="space-y-2">
                {payments.map((p) => (
                  <a key={p.id} href={`/payments/${p.id}`} className="block border rounded-lg p-3 hover:bg-gray-50">
                    <p className="font-medium text-gray-900">TZS {Number(p.amount).toLocaleString()}</p>
                    <p className="text-sm text-gray-600">
                      {p.payment_date} · {p.payment_method || '—'}
                      {p.period_start ? ` · ${monthLabel(p.period_start)} mpaka ${monthLabel(p.period_end)}` : ''}
                    </p>
                  </a>
                ))}
              </div>
            </div>

            <div className="bg-white p-5 rounded-xl shadow mb-6">
              <h2 className="font-semibold text-gray-900 mb-3">Maombi yangu</h2>
              {requests.length === 0 && <p className="text-sm text-gray-600">Bado hukutuma ombi.</p>}
              <div className="space-y-2">
                {requests.map((r) => (
                  <div key={r.id} className="border rounded-lg p-3">
                    <div className="flex justify-between gap-3">
                      <p className="font-medium text-gray-900">{r.title}</p>
                      <span className={r.status === 'done' ? 'text-green-600 text-sm' : 'text-amber-600 text-sm'}>
                        {r.status === 'done' ? 'Imekamilika' : 'Inasubiri'}
                      </span>
                    </div>
                    {r.description && <p className="text-sm text-gray-600 mt-1">{r.description}</p>}
                  </div>
                ))}
              </div>
            </div>

            <form onSubmit={sendRequest} className="bg-white p-5 rounded-xl shadow space-y-3">
              <h2 className="font-semibold text-gray-900">Tuma ombi la matengenezo</h2>
              <input required value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Kichwa"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900" />
              <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Maelezo" rows={3}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900" />
              <button className="bg-amber-600 text-white px-4 py-2 rounded-lg">Tuma</button>
              {message && <p className="text-sm text-gray-700">{message}</p>}
            </form>
          </>
        )}
      </div>
    </div>
  )
}