'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

type Property = {
  id: string
  name: string
  type: string
  location: string
  address: string
}

type Unit = {
  id: string
  unit_number: string
  rent_amount: number
  status: string
}

export default function PropertyDetails({ propertyId }: { propertyId: string }) {
  const router = useRouter()
  const [property, setProperty] = useState<Property | null>(null)
  const [units, setUnits] = useState<Unit[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }

      const { data: prop } = await supabase
        .from('properties')
        .select('id, name, type, location, address')
        .eq('id', propertyId)
        .eq('owner_id', user.id)
        .single()

      setProperty(prop)

      const { data: unitRows } = await supabase
        .from('units')
        .select('id, unit_number, rent_amount, status')
        .eq('property_id', propertyId)
        .order('unit_number')

      setUnits(unitRows || [])
      setLoading(false)
    }
    load()
  }, [propertyId, router])

  if (loading) return <p className="p-8 text-gray-600">Inapakia...</p>
  if (!property) return <p className="p-8 text-gray-600">Mali haipatikani.</p>

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-3xl mx-auto px-4 py-10">
        <a href="/dashboard" className="text-sm text-blue-600">← Dashboard</a>
        <h1 className="text-2xl font-bold text-gray-900 mt-3">{property.name}</h1>
        <p className="text-gray-600 mb-6">
          {property.type} · {property.location || property.address || '—'}
        </p>

        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-800">Vyumba</h2>
          <a
            href={`/properties/${property.id}/units/new`}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm"
          >
            + Ongeza Chumba
          </a>
        </div>

        {units.length === 0 && <p className="text-gray-600">Bado hakuna vyumba.</p>}

        <div className="space-y-3">
          {units.map((u) => (
            <div key={u.id} className="bg-white p-4 rounded-xl shadow flex justify-between">
              <div>
                <p className="font-medium text-gray-900">{u.unit_number}</p>
                <p className="text-sm text-gray-600">
                  TZS {Number(u.rent_amount).toLocaleString()} / mwezi
                </p>
              </div>
              <span className={u.status === 'occupied' ? 'text-green-600' : 'text-orange-500'}>
                {u.status === 'occupied' ? 'Kimekaliwa' : 'Tupu'}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}