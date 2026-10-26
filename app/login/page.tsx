'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { data, error: authError } = await supabase.auth.signInWithPassword({ email, password })
    if (authError || !data.user) {
      setError(authError?.message || 'Imeshindikana kuingia')
      setLoading(false)
      return
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('user_id', data.user.id)
      .maybeSingle()

    if (profile?.role === 'tenant') {
      await supabase.auth.signOut()
      setError('Akaunti hii ni ya mpangaji. Tumia Ingia kama mpangaji.')
      setLoading(false)
      return
    }

    router.push('/dashboard')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-xl shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6 text-center text-gray-900">Ingia - Mwenye nyumba</h1>
        {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4 text-sm">{error}</div>}
        <form onSubmit={handleLogin} className="space-y-4">
          <input required type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900" />
          <input required type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900" />
          <button disabled={loading} className="w-full bg-blue-600 text-white py-2.5 rounded-lg disabled:bg-blue-300">
            {loading ? 'Inaingia...' : 'Ingia'}
          </button>
        </form>
        <p className="mt-4 text-center text-sm text-gray-600">
          <a href="/register" className="text-blue-600">Jisajili</a>
          {' · '}
          <a href="/tenants/login" className="text-green-700">Mimi ni mpangaji</a>
        </p>
      </div>
    </div>
  )
}