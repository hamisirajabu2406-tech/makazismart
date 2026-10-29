'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setMessage('')

    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    })

    if (resetError) {
      setError(resetError.message)
      setLoading(false)
      return
    }

    setMessage('Tumetuma kiungo kwenye email. Fungua email kisha uweke password mpya.')
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="bg-white p-8 rounded-xl shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold mb-2 text-center text-gray-900">Umesahau password</h1>
        <p className="text-sm text-gray-500 text-center mb-6">Weka email uliyosajili nayo.</p>
        {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4 text-sm">{error}</div>}
        {message && <div className="bg-green-100 text-green-800 p-3 rounded mb-4 text-sm">{message}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <input required type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900" />
          <button disabled={loading} className="w-full bg-blue-600 text-white py-2.5 rounded-lg disabled:bg-blue-300">
            {loading ? 'Inatuma...' : 'Tuma kiungo'}
          </button>
        </form>
        <p className="mt-4 text-center text-sm">
          <a href="/login" className="text-blue-600">Mwenye nyumba</a>
          {' · '}
          <a href="/tenants/login" className="text-green-700">Mpangaji</a>
        </p>
      </div>
    </div>
  )
}