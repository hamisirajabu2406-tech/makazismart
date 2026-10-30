'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function BillingPage() {
  const router = useRouter()
  const [days, setDays] = useState(30)

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }
      const { data: profile } = await supabase
        .from('profiles')
        .select('role, billing_status, trial_started_at')
        .eq('user_id', user.id)
        .maybeSingle()

      if (!profile || profile.role === 'tenant') {
        router.push('/tenants/home')
        return
      }
      const used = Math.max(
        0,
        Math.floor((Date.now() - new Date(profile.trial_started_at).getTime()) / 86400000)
      )
      setDays(used)
      if (profile.role === 'admin' || profile.billing_status === 'active' || used < 30) {
        router.push('/dashboard')
      }
    }
    load()
  }, [router])

  const logout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center px-4">
      <div className="bg-white max-w-md w-full rounded-2xl shadow p-8 text-center">
        <p className="text-sm font-semibold text-emerald-700">MAKAZISMART</p>
        <h1 className="text-2xl font-bold text-slate-900 mt-2">Jaribio limeisha</h1>
        <p className="text-slate-600 mt-3">
          Umetumia siku {Math.min(days, 30)} kati ya 30. Akaunti imefungwa yenyewe.
          Mali, wapangaji na risiti bado viko salama.
        </p>
        <p className="text-sm text-slate-500 mt-4">
          Lipa ili uendelee. Msimamizi atabonyeza Washa, kisha utaingia tena.
        </p>
        <button onClick={logout} className="mt-6 text-sm bg-slate-900 text-white px-4 py-2 rounded-lg">
          Toka
        </button>
      </div>
    </div>
  )
}