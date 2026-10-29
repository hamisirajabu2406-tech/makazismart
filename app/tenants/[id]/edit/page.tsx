'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function EditTenantPage() {
  const router = useRouter()
  const [tenantId, setTenantId] = useState('')
  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const load = async () => {
      const id = window.location.pathname.split('/')[2] || ''
      setTenantId(id)

      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }

      const { data, error: loadError } = await supabase
        .from('tenants')
        .select('full_name, phone')
        .eq('id', id)
        .single()

      if (loadError || !data) {
        setError(loadError?.message || 'Mpangaji haipatikani.')
        setLoading(false)
        return
      }

      setFullName(data.full_name || '')
      setPhone(data.phone || '')
      setLoading(false)
    }
    load()
  }, [router])

  const save = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError('')

    const { error: updateError } = await supabase
      .from('tenants')
      .update({ full_name: fullName, phone })
      .eq('id', tenantId)

    if (updateError) {
      setError(updateError.message)
      setSaving(false)
      return
    }

    router.push('/tenants')
  }

  if (loading) return <p className="p-8 text-gray-600">Inapakia...</p>

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-xl mx-auto px-4 py-10">
        <a href="/tenants" className="text-sm text-blue-600">← Wapangaji</a>
        <h1 className="text-2xl font-bold text-gray-900 mt-4 mb-6">Hariri mpangaji</h1>
        {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4 text-sm">{error}</div>}
        <form onSubmit={save} className="bg-white p-6 rounded-xl shadow space-y-4">
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
          <button disabled={saving} className="w-full bg-green-600 text-white py-2.5 rounded-lg disabled:bg-green-300">
            {saving ? 'Inahifadhi...' : 'Hifadhi'}
          </button>
        </form>
      </div>
    </div>
  )
}