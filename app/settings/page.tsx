'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function SettingsPage() {
  const router = useRouter()
  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [role, setRole] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }
      setEmail(user.email || '')

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('full_name, phone, role')
        .eq('user_id', user.id)
        .maybeSingle()

      if (profileError) {
        setError(profileError.message)
        setLoading(false)
        return
      }

      setFullName(profile?.full_name || '')
      setPhone(profile?.phone || '')
      setRole(profile?.role || '')
      setLoading(false)
    }
    load()
  }, [router])

  const save = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    setMessage('')

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push('/login')
      return
    }

    const { error: updateError } = await supabase
      .from('profiles')
      .update({ full_name: fullName, phone })
      .eq('user_id', user.id)

    if (updateError) {
      setError(updateError.message)
      setSaving(false)
      return
    }

    setMessage('Wasifu umehifadhiwa. Simu mpya ndiyo itatumika kwa WhatsApp na kupiga simu.')
    setSaving(false)
  }

  const back = role === 'tenant' ? '/tenants/home' : '/dashboard'

  if (loading) return <p className="p-8 text-gray-600">Inapakia...</p>

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-xl mx-auto px-4 py-10">
        <a href={back} className="text-sm text-blue-600">← Rudi</a>
        <h1 className="text-2xl font-bold text-gray-900 mt-4 mb-6">Wasifu</h1>
        {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4 text-sm">{error}</div>}
        {message && <div className="bg-green-100 text-green-800 p-3 rounded mb-4 text-sm">{message}</div>}
        <form onSubmit={save} className="bg-white p-6 rounded-xl shadow space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700">Email</label>
            <input value={email} disabled className="w-full border border-gray-200 rounded-lg px-3 py-2 text-gray-500 bg-gray-50" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700">Jina</label>
            <input required value={fullName} onChange={(e) => setFullName(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700">Simu</label>
            <input required value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="0745423403"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900" />
          </div>
          <button disabled={saving} className="w-full bg-blue-600 text-white py-2.5 rounded-lg disabled:bg-blue-300">
            {saving ? 'Inahifadhi...' : 'Hifadhi'}
          </button>
        </form>
      </div>
    </div>
  )
}