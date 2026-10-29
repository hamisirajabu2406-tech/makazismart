export default function HomePage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <header className="max-w-3xl mx-auto px-4 pt-10 pb-6">
        <p className="text-sm font-semibold tracking-wide text-blue-600">MAKAZISMART</p>
        <h1 className="text-3xl font-bold text-slate-900 mt-2">
          Simamia kodi, wapangaji na matengenezo mahali pamoja.
        </h1>
        <p className="text-slate-600 mt-3">
          Kwa wenye nyumba na wapangaji Dar es Salaam na Tanzania. Risiti, ukumbusho wa WhatsApp, na vyumba vilivyo wazi.
        </p>
      </header>

      <main className="max-w-3xl mx-auto px-4 pb-12">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-8">
          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <p className="font-semibold text-slate-900">Kodi</p>
            <p className="text-sm text-slate-600 mt-1">Rekodi malipo na upakue risiti ya PDF.</p>
          </div>
          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <p className="font-semibold text-slate-900">Ukumbusho</p>
            <p className="text-sm text-slate-600 mt-1">Tuma WhatsApp kwa aliyechelewa kulipa.</p>
          </div>
          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <p className="font-semibold text-slate-900">Soko</p>
            <p className="text-sm text-slate-600 mt-1">Onyesha chumba tupu pamoja na picha na simu yako.</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-6 space-y-3">
          <a href="/login" className="block bg-blue-600 text-white text-center py-3 rounded-xl font-medium">
            Ingia kama mwenye nyumba
          </a>
          <a href="/register" className="block border border-blue-600 text-blue-600 text-center py-3 rounded-xl font-medium">
            Sajili mali yako
          </a>
          <a href="/tenants/login" className="block bg-green-600 text-white text-center py-3 rounded-xl font-medium">
            Ingia kama mpangaji
          </a>
          <a href="/tenants/register" className="block border border-green-600 text-green-700 text-center py-3 rounded-xl font-medium">
            Sajili akaunti ya mpangaji
          </a>
          <a href="/listings" className="block bg-slate-900 text-white text-center py-3 rounded-xl font-medium">
            Tazama vyumba vilivyo wazi
          </a>
          <a href="/forgot-password" className="block text-center text-sm text-slate-500 pt-2">
            Umesahau password?
          </a>
        </div>

        <p className="text-xs text-slate-400 mt-6">
          MakaziSmart inasaidia kumbukumbu za kodi. Si risiti ya kodi ya serikali na si mkataba wa kupangisha.
        </p>
      </main>
    </div>
  )
}