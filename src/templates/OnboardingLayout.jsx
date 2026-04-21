export default function OnboardingLayout({ children, currentStep, totalSteps }) {
  return (
    <div className="min-h-screen bg-surface flex flex-col">
      <header className="bg-surface-container_low">
        <div className="max-w-3xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <h1 className="text-2xl font-bold text-secondary">
            Caldero Envío
          </h1>
        </div>
      </header>

      <div className="flex-1 py-8">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-on-surface-variant">
                Paso {currentStep} de {totalSteps}
              </span>
              <span className="text-sm font-medium text-primary">
                {Math.round((currentStep / totalSteps) * 100)}%
              </span>
            </div>
            <div className="mt-2 bg-surface-container rounded-full h-2">
              <div
                className="bg-primary-gradient h-2 rounded-full transition-all duration-300"
                style={{ width: `${(currentStep / totalSteps) * 100}%` }}
              />
            </div>
          </div>

          <div className="bg-surface-container rounded-md p-6">
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}