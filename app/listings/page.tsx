'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

type Listing = {
  unit_id: string
  unit_number: string
  rent_amount: number
  property_name: string
  property_type: string
  location: string | null
  description: string | null
  photo_url: string | null
  owner_phone: string | null
}

function waNumber(phone: string) {
  let n = phone.replace(/\D/g, '')
  if (n.startsWith('0')) n = '255' + n.slice(1)
  if (!n.startsWith('255')) n = '255' + n
  return n
}

function ContactLinks({ phone }: { phone: string | null }) {
  if (!phone) return <p className="text-sm text-gray-500 mt-2">Mwenye nyumba hajaweka simu.</p>
  const text = encodeURIComponent('Habari, nina nia ya kupanga. Naomba maelezo zaidi.')
  return (
    <div className="flex flex-wrap gap-2 mt-3">
      <a href={`tel:${phone}`} className="text-sm bg-gray-800 text-white px-3 py-1.5 rounded">Piga simu</a>
      <a href={`https://wa.me/${waNumber(phone)}?text=${text}`} className="text-sm bg-green-600 text-white px-3 py-1.5 rounded">WhatsApp</a>
      <a href={`sms:${phone}?body=${text}`} className="text-sm border border-gray-400 text-gray-800 px-3 py-1.5 rounded">SMS</a>
    </div>
  )
}

function InquiryForm({ unitId }: { unitId: string }) {
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [message, setMessage] = useState('')
  const [note, setNote] = useState('')
  const [open, setOpen] = useState(false)

  const send = async (e: React.FormEvent) => {
    e.preventDefault()
    const { error: rpcError } = await supabase.rpc('send_inquiry', {
      p_unit_id: unitId,
      p_name: name,
      p_phone: phone,
      p_message: message,
    })
    if (rpcError) {
      setNote(rpcError.message)
      return
    }
    setName('')
    setPhone('')
    setMessage('')
    setNote('Ujumbe umetumwa kwa mwenye nyumba.')
  }

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} className="mt-3 text-sm bg-blue-600 text-white px-3 py-1.5 rounded">
        Nia ya kupanga
      </button>
    )
  }

  return (
    <form onSubmit={send} className="mt-3 space-y-2">
      <input required placeholder="Jina lako" value={name} onChange={(e) => setName(e.target.value)}
        className="w-full border rounded px-2 py-1.5 text-sm text-gray-900" />
      <input required placeholder="Simu yako" value={phone} onChange={(e) => setPhone(e.target.value)}
        className="w-full border rounded px-2 py-1.5 text-sm text-gray-900" />
      <input placeholder="Ujumbe (si lazima)" value={message} onChange={(e) => setMessage(e.target.value)}
        className="w-full border rounded px-2 py-1.5 text-sm text-gray-900" />
      <button className="text-sm bg-blue-600 text-white px-3 py-1.5 rounded">Tuma</button>
      {note && <p className="text-sm text-gray-700">{note}</p>}
    </form>
  )
}

export default function ListingsPage() {
  const [rows, setRows] = useState<Listing[]>([])
  const [query, setQuery] = useState('')
  const [type, setType] = useState('zote')
  const [isOwner, setIsOwner] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('user_id', user.id)
          .maybeSingle()
        setIsOwner(profile?.role !== 'tenant')
      }

      const { data, error: rpcError } = await supabase.rpc('public_listings')
      if (rpcError) setError(rpcError.message)
      setRows(data || [])
      setLoading(false)
    }
    load()
  }, [])

  const filtered = rows.filter((r) => {
    const text = `${r.property_name} ${r.location || ''} ${r.description || ''} ${r.unit_number}`.toLowerCase()
    return text.includes(query.toLowerCase().trim()) && (type === 'zote' || r.property_type === type)
  })

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-3xl mx-auto px-4 py-10">
        <a href={isOwner ? '/dashboard' : '/'} className="text-sm text-blue-600">
          ← {isOwner ? 'Dashboard' : 'Mwanzo'}
        </a>
        <h1 className="text-2xl font-bold text-gray-900 mt-4">Vyumba vilivyo wazi</h1>
        <p className="text-gray-600 mb-6">
          {isOwner
            ? 'Unaangalia soko. Mawasiliano na nia ya kupanga ni kwa wageni tu.'
            : 'Orodha ya umma. Huna haja ya kuingia.'}
        </p>

        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Tafuta eneo au jina"
            className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-gray-900" />
          <select value={type} onChange={(e) => setType(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-gray-900">
            <option value="zote">Aina zote</option>
            <option value="nyumba">Nyumba</option>
            <option value="chumba">Chumba</option>
            <option value="duka">Duka</option>
            <option value="office">Office</option>
          </select>
        </div>

        {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4 text-sm">{error}</div>}
        {loading && <p className="text-gray-600">Inapakia...</p>}
        {!loading && filtered.length === 0 && <p className="text-gray-600">Hakuna chumba kinachoendana na utafutaji.</p>}

        <div className="space-y-3">
          {filtered.map((r) => (
            <div key={r.unit_id} className="bg-white p-4 rounded-xl shadow">
              {r.photo_url ? (
                <img src={r.photo_url} alt={r.property_name} className="h-48 w-full object-cover rounded-lg mb-3" />
              ) : (
                <div className="h-32 bg-gray-100 rounded-lg mb-3 flex items-center justify-center text-sm text-gray-500">
                  Hakuna picha bado
                </div>
              )}
              <p className="font-semibold text-gray-900">{r.property_name}</p>
              <p className="text-sm text-gray-600">
                {r.property_type} · Chumba {r.unit_number} · {r.location || '—'}
              </p>
              {r.description && (
                <p className="text-sm text-gray-700 mt-2">{r.description}</p>
              )}
              <p className="text-lg font-bold text-gray-900 mt-1">
                TZS {Number(r.rent_amount).toLocaleString()} / mwezi
              </p>
              {!isOwner && <ContactLinks phone={r.owner_phone} />}
              {!isOwner && r.photo_url && <InquiryForm unitId={r.unit_id} />}
              {!isOwner && !r.photo_url && (
                <p className="text-sm text-gray-500 mt-2">Nia ya kupanga itapatikana picha ikishawekwa.</p>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}