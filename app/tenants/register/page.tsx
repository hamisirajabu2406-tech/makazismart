'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function TenantRegisterPage() {
  const router = useRouter()
  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { data, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName, phone, role: 'tenant' } },
    })

    if (authError) {
      setError(authError.message)
      setLoading(false)
      return
    }

    if (!data.session) {
      setError('Angalia email kuthibitisha akaunti, kisha ingia.')
      setLoading(false)
      return
    }

    const { data: linked, error: linkError } = await supabase.rpc('link_tenant_account', {
      p_phone: phone,
    })

    if (linkError) {
      setError(linkError.message)
      setLoading(false)
      return
    }

    if (!linked) {
      setError('Simu haipo kwa mpangaji haiyeunganishwa. Landlord aweke simu ile ile.')
      setLoading(false)
      return
    }

    router.push('/tenants/home')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-xl shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold mb-2 text-center text-gray-900">Akaunti ya Mpangaji</h1>
        <p className="text-sm text-gray-500 text-center mb-6">Tumia simu ile ile aliyoweka mwenye nyumba.</p>
        {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4 text-sm">{error}</div>}
        <form onSubmit={handleRegister} className="space-y-4">
          <input required placeholder="Jina" value={fullName} onChange={(e) => setFullName(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900" />
          <input required placeholder="Simu mfano 0745423403" value={phone} onChange={(e) => setPhone(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900" />
          <input required type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900" />
          <input required type="password" minLength={6} placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900" />
          <button disabled={loading} className="w-full bg-green-600 text-white py-2.5 rounded-lg disabled:bg-green-300">
            {loading ? 'Inasajili...' : 'Jisajili'}
          </button>
        </form>
        <p className="mt-4 text-center text-sm text-gray-600">
          Tayari una akaunti? <a href="/tenants/login" className="text-blue-600">Ingia</a>
        </p>
      </div>
    </div>
  )
}