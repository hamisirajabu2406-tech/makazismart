'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function EditPropertyPage() {
  const router = useRouter()
  const [propertyId, setPropertyId] = useState('')
  const [name, setName] = useState('')
  const [type, setType] = useState('nyumba')
  const [address, setAddress] = useState('')
  const [location, setLocation] = useState('')
  const [description, setDescription] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const load = async () => {
      const id = window.location.pathname.split('/')[2] || ''
      setPropertyId(id)

      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }

      const { data, error: loadError } = await supabase
        .from('properties')
        .select('name, type, address, location, description')
        .eq('id', id)
        .eq('owner_id', user.id)
        .single()

      if (loadError || !data) {
        setError(loadError?.message || 'Mali haipatikani.')
        setLoading(false)
        return
      }

      setName(data.name || '')
      setType(data.type || 'nyumba')
      setAddress(data.address || '')
      setLocation(data.location || '')
      setDescription(data.description || '')
      setLoading(false)
    }
    load()
  }, [router])

  const save = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError('')

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push('/login')
      return
    }

    const { error: updateError } = await supabase
      .from('properties')
      .update({ name, type, address, location, description })
      .eq('id', propertyId)
      .eq('owner_id', user.id)

    if (updateError) {
      setError(updateError.message)
      setSaving(false)
      return
    }

    router.push(`/properties/${propertyId}`)
  }

  if (loading) return <p className="p-8 text-gray-600">Inapakia...</p>

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-xl mx-auto px-4 py-10">
        <a href={propertyId ? `/properties/${propertyId}` : '/dashboard'} className="text-sm text-blue-600">
          ← Rudi mali
        </a>
        <h1 className="text-2xl font-bold text-gray-900 mt-4 mb-6">Hariri mali</h1>
        {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4 text-sm">{error}</div>}
        <form onSubmit={save} className="bg-white p-6 rounded-xl shadow space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700">Jina</label>
            <input required value={name} onChange={(e) => setName(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700">Aina</label>
            <select value={type} onChange={(e) => setType(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900">
              <option value="nyumba">Nyumba</option>
              <option value="chumba">Chumba</option>
              <option value="duka">Duka</option>
              <option value="office">Office</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700">Anwani</label>
            <input value={address} onChange={(e) => setAddress(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700">Eneo</label>
            <input value={location} onChange={(e) => setLocation(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700">Maelezo</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3}
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