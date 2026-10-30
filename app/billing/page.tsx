'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function BillingPage() {
  const router = useRouter()
  const [days, setDays] = useState(30)
  const [email, setEmail] = useState('')
  const [price, setPrice] = useState(0)
  const [phone, setPhone] = useState('')
  const [name, setName] = useState('')

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }
      setEmail(user.email || '')

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
        return
      }

      const { data: bill } = await supabase.rpc('platform_billing')
      const row = bill?.[0]
      setPrice(row?.price_tzs || 0)
      setPhone(row?.pay_phone || '')
      setName(row?.pay_name || '')
    }
    load()
  }, [router])

  const logout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center px-4">
      <div className="bg-white max-w-md w-full rounded-2xl shadow p-8">
        <p className="text-sm font-semibold text-emerald-700 text-center">MAKAZISMART</p>
        <h1 className="text-2xl font-bold text-slate-900 mt-2 text-center">Jaribio limeisha</h1>
        <p className="text-slate-600 mt-3 text-center">
          Umetumia siku {Math.min(days, 30)} kati ya 30. Mali na risiti bado viko salama.
        </p>

        <div className="mt-6 bg-slate-50 rounded-xl p-4 text-sm text-slate-800 space-y-2">
          <p>Lipa <b>TZS {Number(price).toLocaleString()}</b> kuendelea.</p>
          {phone ? (
            <>
              <p>Tuma kwa <b>{name || 'MakaziSmart'}</b></p>
              <p>Namba: <b>{phone}</b></p>
              <p>Kumbukumbu: <b>{email}</b></p>
            </>
          ) : (
            <p>Namba ya malipo bado haijawekwa. Wasiliana na msimamizi.</p>
          )}
          <p className="text-slate-500">Baada ya kutuma, msimamizi atabonyeza Washa.</p>
        </div>

        <button onClick={logout} className="mt-6 w-full text-sm bg-slate-900 text-white px-4 py-2 rounded-lg">
          Toka
        </button>
      </div>
    </div>
  )
}