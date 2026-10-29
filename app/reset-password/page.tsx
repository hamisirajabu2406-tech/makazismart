'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function ResetPasswordPage() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [ready, setReady] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') setReady(true)
    })
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) setReady(true)
    })
    return () => sub.subscription.unsubscribe()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { error: updateError } = await supabase.auth.updateUser({ password })
    if (updateError) {
      setError(updateError.message)
      setLoading(false)
      return
    }

    const { data: { user } } = await supabase.auth.getUser()
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('user_id', user?.id || '')
      .maybeSingle()

    router.push(profile?.role === 'tenant' ? '/tenants/home' : '/dashboard')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="bg-white p-8 rounded-xl shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6 text-center text-gray-900">Password mpya</h1>
        {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4 text-sm">{error}</div>}
        {!ready && <p className="text-sm text-gray-600">Inathibitisha kiungo... Fungua kiungo kutoka kwenye email.</p>}
        {ready && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <input required type="password" minLength={6} placeholder="Password mpya, angalau herufi 6"
              value={password} onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900" />
            <button disabled={loading} className="w-full bg-blue-600 text-white py-2.5 rounded-lg disabled:bg-blue-300">
              {loading ? 'Inahifadhi...' : 'Hifadhi password'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}