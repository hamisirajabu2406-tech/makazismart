'use client'

import { useEffect, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

const openPaths = ['/', '/how', '/listings', '/login', '/register', '/forgot-password', '/reset-password', '/billing', '/tenants/login', '/tenants/register']

function isOpen(path: string) {
  return openPaths.includes(path) || path.startsWith('/listings/')
}

export default function TrialGate({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const [ready, setReady] = useState(isOpen(pathname))

  useEffect(() => {
    const check = async () => {
      if (isOpen(pathname)) {
        setReady(true)
        return
      }

      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setReady(true)
        return
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('role, billing_status, trial_started_at')
        .eq('user_id', user.id)
        .maybeSingle()

      if (!profile || profile.role === 'tenant' || profile.role === 'admin' || profile.billing_status === 'active') {
        setReady(true)
        return
      }

      const used = Math.max(
        0,
        Math.floor((Date.now() - new Date(profile.trial_started_at || Date.now()).getTime()) / 86400000)
      )

      if (used >= 30) {
        router.replace('/billing')
        return
      }

      setReady(true)
    }
    setReady(isOpen(pathname))
    check()
  }, [pathname, router])

  if (!ready) return <p className="p-8 text-gray-600">Inapakia...</p>
  return <>{children}</>
}