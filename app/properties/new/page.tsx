'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function NewPropertyPage() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [type, setType] = useState('nyumba')
  const [address, setAddress] = useState('')
  const [location, setLocation] = useState('')
  const [description, setDescription] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push('/login')
      return
    }

    const { error: insertError } = await supabase.from('properties').insert({
      owner_id: user.id,
      name,
      type,
      address,
      location,
      description,
      status: 'active',
    })

    if (insertError) {
      setError(insertError.message)
      setLoading(false)
      return
    }

    router.push('/properties')
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-xl mx-auto px-4 py-10">
        <a href="/dashboard" className="text-sm text-blue-600">← Rudi dashboard</a>
        <h1 className="text-2xl font-bold text-gray-900 mt-4 mb-6">Ongeza Mali</h1>

        {error && (
          <div className="bg-red-100 text-red-700 p-3 rounded mb-4 text-sm">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700">Jina la mali</label>
            <input required value={name} onChange={(e) => setName(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900"
              placeholder="Block A - Sinza" />
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
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900"
              placeholder="Sinza, Dar es Salaam" />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700">Maelezo</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900" rows={3} />
          </div>

          <button type="submit" disabled={loading}
            className="w-full bg-blue-600 text-white py-2.5 rounded-lg hover:bg-blue-700 disabled:bg-blue-300 font-medium">
            {loading ? 'Inahifadhi...' : 'Hifadhi'}
          </button>
        </form>
      </div>
    </div>
  )
}