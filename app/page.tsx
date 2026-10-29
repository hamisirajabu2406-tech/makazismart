export default function HomePage() {
  return (
    <div className="min-h-screen bg-white text-slate-900">
      <header className="border-b border-slate-100">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <a href="/" className="text-lg font-semibold text-emerald-700">MakaziSmart</a>
          <div className="flex items-center gap-2">
            <a href="/login" className="text-sm text-slate-600 px-3 py-2">Ingia</a>
            <a href="/listings" className="text-sm bg-slate-900 text-white px-3 py-2 rounded-lg">
              Vyumba wazi
            </a>
          </div>
        </div>
      </header>

      <section className="bg-gradient-to-b from-emerald-800 to-emerald-700 text-white">
        <div className="max-w-3xl mx-auto px-4 py-20 text-center">
          <p className="inline-block text-xs tracking-widest bg-emerald-900/40 border border-emerald-500/40 rounded-full px-3 py-1">
            KODI, WAPANGAJI NA SOKO
          </p>
          <h1 className="text-4xl sm:text-5xl font-bold mt-6 leading-tight">
            Simamia nyumba yako bila daftari
          </h1>
          <p className="text-emerald-100 mt-4 text-lg">
            Rekodi kodi, toa risiti, ukumbushe mpangaji kwa WhatsApp, na uonyeshe chumba tupu kwa wapangaji wapya.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center mt-8">
            <a href="/dashboard" className="bg-emerald-300 text-emerald-950 font-medium px-5 py-3 rounded-lg">
              Dashibodi ya mwenye nyumba
            </a>
            <a href="/listings" className="border border-emerald-200/50 text-white px-5 py-3 rounded-lg">
              Tazama vyumba
            </a>
          </div>
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-4 py-16">
        <h2 className="text-2xl font-bold text-center">MakaziSmart inakusaidia vipi</h2>
        <p className="text-center text-slate-500 mt-2 mb-10">
          Kazi za kila mwezi, mahali pamoja.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <article className="border border-slate-200 rounded-2xl p-5 shadow-sm">
            <p className="font-semibold">Kodi na risiti</p>
            <p className="text-sm text-slate-600 mt-2">
              Rekodi M-Pesa, Mixx, Airtel au pesa taslimu. Pakua risiti ya PDF yenye mwezi wa kodi.
            </p>
          </article>
          <article className="border border-slate-200 rounded-2xl p-5 shadow-sm">
            <p className="font-semibold">Ukumbusho</p>
            <p className="text-sm text-slate-600 mt-2">
              Ona nani hajalipa mwezi huu, kisha tuma ujumbe wa WhatsApp ulioandikwa tayari.
            </p>
          </article>
          <article className="border border-slate-200 rounded-2xl p-5 shadow-sm">
            <p className="font-semibold">Chumba tupu</p>
            <p className="text-sm text-slate-600 mt-2">
              Weka picha na maelezo. Mgeni anakupigia au anakutumia nia ya kupanga.
            </p>
          </article>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center mt-12">
          <a href="/register" className="text-center bg-emerald-700 text-white px-5 py-3 rounded-lg">
            Sajili mali yako
          </a>
          <a href="/tenants/login" className="text-center border border-slate-300 px-5 py-3 rounded-lg">
            Ingia kama mpangaji
          </a>
        </div>
        <p className="text-center text-xs text-slate-400 mt-8">
          Kumbukumbu ya kodi tu. Si risiti ya serikali na si mkataba wa kupangisha.
        </p>
      </section>
    </div>
  )
}