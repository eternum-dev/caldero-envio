export default function AppLayout({ children }) {
  return (
    <div className="min-h-screen bg-surface">
      <header className="bg-surface-container_low">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-secondary">
            Caldero Envío
          </h1>
          <nav className="flex gap-6">
            <a
              href="/app"
              className="text-on-surface-variant hover:text-secondary font-medium transition-colors"
            >
              Calcular
            </a>
            <a
              href="/settings"
              className="text-on-surface-variant hover:text-secondary font-medium transition-colors"
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