export default function AppLayout({ children }) {
  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-primary-600">
            Caldero Envío
          </h1>
          <nav className="flex gap-4">
            <a
              href="/app"
              className="text-gray-600 hover:text-primary-600 font-medium"
            >
              Calcular
            </a>
            <a
              href="/settings"
              className="text-gray-600 hover:text-primary-600 font-medium"
            >
              Configuración
            </a>
          </nav>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  )
}