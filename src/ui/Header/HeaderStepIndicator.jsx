export default function HeaderStepIndicator({ currentStep, totalSteps }) {
  const progress = Math.round((currentStep / totalSteps) * 100);

  return (
    <div className="flex items-center gap-4">
      <span className="text-sm font-medium text-on-surface-variant">
        Paso {currentStep} de {totalSteps}
      </span>
      <div className="bg-surface-medium rounded-full h-2 flex-1 max-w-xs">
        <div
          className="bg-primary-gradient h-2 rounded-full transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}