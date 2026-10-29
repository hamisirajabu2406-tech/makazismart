const steps = [
  {
    n: '1',
    title: 'Sajili mali',
    text: 'Weka nyumba, chumba, duka au ofisi. Kisha ongeza vyumba na kodi ya kila kimoja.',
  },
  {
    n: '2',
    title: 'Weka mpangaji',
    text: 'Andika jina na simu. Mpangaji anajisajili kwa simu hiyo hiyo na anaona kodi yake.',
  },
  {
    n: '3',
    title: 'Rekodi malipo',
    text: 'Ukishapokea pesa, rekodi kiasi na mwezi. Risiti inapakuliwa kama PDF.',
  },
  {
    n: '4',
    title: 'Onyesha chumba tupu',
    text: 'Weka picha na maelezo. Mgeni anaona soko, anakupigia, au anatuma nia ya kupanga.',
  },
]

export default function HowPage() {
  return (
    <div className="min-h-screen bg-white text-slate-900">
      <header className="border-b border-slate-100">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <a href="/" className="text-lg font-semibold text-emerald-700">MakaziSmart</a>
          <a href="/login" className="text-sm bg-slate-900 text-white px-3 py-2 rounded-lg">Ingia</a>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-14">
        <p className="text-sm font-semibold text-emerald-700">JINSI INAVYOFANYA KAZI</p>
        <h1 className="text-3xl font-bold mt-2">Hatua nne, kutoka chumba tupu hadi risiti</h1>
        <p className="text-slate-600 mt-3 mb-10">
          Huna haja ya daftari wala Excel. Kila hatua inafanyika kwenye simu au kompyuta.
        </p>

        <div className="space-y-4">
          {steps.map((s) => (
            <article key={s.n} className="border border-slate-200 rounded-2xl p-5 flex gap-4">
              <div className="h-10 w-10 shrink-0 rounded-full bg-emerald-700 text-white flex items-center justify-center font-semibold">
                {s.n}
              </div>
              <div>
                <h2 className="font-semibold">{s.title}</h2>
                <p className="text-sm text-slate-600 mt-1">{s.text}</p>
              </div>
            </article>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row gap-3 mt-10">
          <a href="/register" className="text-center bg-emerald-700 text-white px-5 py-3 rounded-lg">
            Anza bure
          </a>
          <a href="/listings" className="text-center border border-slate-300 px-5 py-3 rounded-lg">
            Tazama vyumba
          </a>
        </div>
      </main>
    </div>
  )
}