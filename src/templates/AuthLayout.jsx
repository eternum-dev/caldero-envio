export default function AuthLayout({ children }) {
  return (
    <div className="min-h-screen bg-surface flex flex-col justify-center py-12 px-4">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h1 className="text-center text-4xl font-bold text-secondary">
          Caldero Envío
        </h1>
        <p className="mt-3 text-center text-on-surface-variant">
          Cálculo de envíos rápido y consistente
        </p>
      </div>
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-surface-container py-8 px-6 rounded-md">
          {children}
        </div>
      </div>
    </div>
  )
}