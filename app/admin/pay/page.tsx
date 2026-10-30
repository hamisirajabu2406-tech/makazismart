'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function AdminPayPage() {
  const router = useRouter()
  const [price, setPrice] = useState('20000')
  const [phone, setPhone] = useState('')
  const [name, setName] = useState('MakaziSmart')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }
      const { data: me } = await supabase.from('profiles').select('role').eq('user_id', user.id).maybeSingle()
      if (me?.role !== 'admin') {
        router.push('/dashboard')
        return
      }
      const { data } = await supabase.rpc('platform_billing')
      const row = data?.[0]
      if (!row) return
      setPrice(String(row.price_tzs || 0))
      setPhone(row.pay_phone || '')
      setName(row.pay_name || 'MakaziSmart')
    }
    load()
  }, [router])

  const save = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    setMessage('')
    const { error: rpcError } = await supabase.rpc('admin_set_platform_billing', {
      p_price: Number(price),
      p_phone: phone,
      p_name: name,
    })
    if (rpcError) setError(rpcError.message)
    else setMessage('Maelekezo yamehifadhiwa.')
    setSaving(false)
  }

  return (
    <div className="min-h-screen bg-slate-100">
      <div className="max-w-xl mx-auto px-4 py-10">
        <a href="/admin" className="text-sm text-blue-600">← Admin</a>
        <h1 className="text-2xl font-bold text-slate-900 mt-4 mb-6">Malipo ya mfumo</h1>
        {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4 text-sm">{error}</div>}
        {message && <div className="bg-green-100 text-green-800 p-3 rounded mb-4 text-sm">{message}</div>}
        <form onSubmit={save} className="bg-white p-6 rounded-xl shadow space-y-4">
          <div>
            <label className="block text-sm mb-1 text-slate-700">Kiasi kwa mwezi (TZS)</label>
            <input required type="number" min="0" value={price} onChange={(e) => setPrice(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 text-slate-900" />
          </div>
          <div>
            <label className="block text-sm mb-1 text-slate-700">Jina la mpokeaji</label>
            <input required value={name} onChange={(e) => setName(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 text-slate-900" />
          </div>
          <div>
            <label className="block text-sm mb-1 text-slate-700">Namba ya simu</label>
            <input required value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="07xxxxxxxx"
              className="w-full border rounded-lg px-3 py-2 text-slate-900" />
          </div>
          <button disabled={saving} className="w-full bg-slate-900 text-white py-2.5 rounded-lg disabled:bg-slate-400">
            {saving ? 'Inahifadhi...' : 'Hifadhi'}
          </button>
        </form>
      </div>
    </div>
  )
}