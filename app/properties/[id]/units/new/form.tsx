'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function NewUnitForm({ propertyId }: { propertyId: string }) {
  const router = useRouter()
  const [unitNumber, setUnitNumber] = useState('')
  const [rentAmount, setRentAmount] = useState('')
  const [depositAmount, setDepositAmount] = useState('')
  const [size, setSize] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { error: insertError } = await supabase.from('units').insert({
      property_id: propertyId,
      unit_number: unitNumber,
      rent_amount: Number(rentAmount),
      deposit_amount: depositAmount ? Number(depositAmount) : null,
      size: size || null,
      status: 'vacant',
    })

    if (insertError) {
      setError(insertError.message)
      setLoading(false)
      return
    }

    router.push(`/properties/${propertyId}`)
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-xl mx-auto px-4 py-10">
        <a href={`/properties/${propertyId}`} className="text-sm text-blue-600">← Rudi mali</a>
        <h1 className="text-2xl font-bold text-gray-900 mt-4 mb-6">Ongeza Chumba</h1>
        {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4 text-sm">{error}</div>}
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700">Namba ya chumba</label>
            <input required value={unitNumber} onChange={(e) => setUnitNumber(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900" placeholder="A1 au 4B" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700">Kodi kwa mwezi (TZS)</label>
            <input required type="number" min="0" value={rentAmount} onChange={(e) => setRentAmount(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700">Deposit (si lazima)</label>
            <input type="number" min="0" value={depositAmount} onChange={(e) => setDepositAmount(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700">Ukubwa (si lazima)</label>
            <input value={size} onChange={(e) => setSize(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900" placeholder="25 sqm" />
          </div>
          <button disabled={loading} className="w-full bg-blue-600 text-white py-2.5 rounded-lg disabled:bg-blue-300">
            {loading ? 'Inahifadhi...' : 'Hifadhi'}
          </button>
        </form>
      </div>
    </div>
  )
}