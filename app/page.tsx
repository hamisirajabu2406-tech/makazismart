export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
      <div className="max-w-lg w-full bg-white rounded-2xl shadow p-8 text-center">
        <h1 className="text-3xl font-bold text-blue-600">MakaziSmart</h1>
        <p className="text-gray-600 mt-2 mb-8">
          Simamia mali, wapangaji, kodi na matengenezo.
        </p>

        <div className="space-y-3">
          <a href="/login" className="block bg-blue-600 text-white py-3 rounded-lg font-medium">
            Ingia kama mwenye nyumba
          </a>
          <a href="/register" className="block border border-blue-600 text-blue-600 py-3 rounded-lg font-medium">
            Sajili mali yako
          </a>
          <a href="/tenants/login" className="block bg-green-600 text-white py-3 rounded-lg font-medium">
            Ingia kama mpangaji
          </a>
          <a href="/tenants/register" className="block border border-green-600 text-green-700 py-3 rounded-lg font-medium">
            Sajili akaunti ya mpangaji
          </a>
        </div>
      </div>
    </div>
  )
}