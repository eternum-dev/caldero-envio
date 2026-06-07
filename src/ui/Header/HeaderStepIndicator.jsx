import Icon from '../atoms/Icon';

/**
 * Step indicator for onboarding wizard.
 *
 * @param {{ id: number|string, label: string }[]} steps - Array of step definitions
 * @param {number} currentStep - 1-based current step index
 */
export default function HeaderStepIndicator({ steps = [], currentStep = 1 }) {
  return (
    <div className="flex items-center justify-center gap-0 py-3">
      {steps.map((step, index) => {
        const stepNumber = index + 1;
        const isCompleted = stepNumber < currentStep;
        const isActive = stepNumber === currentStep;
        const isPending = stepNumber > currentStep;
        const isLast = index === steps.length - 1;

        return (
          <div key={step.id} className="flex items-center">
            <div className="flex flex-col items-center gap-1.5">
              {/* Circle */}
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center border transition-all duration-300 ${
                  isCompleted
                    ? 'bg-gold border-gold'
                    : isActive
                    ? 'bg-transparent border-2 border-gold'
                    : 'bg-transparent border border-muted/40'
                }`}
              >
                {isCompleted ? (
                  <Icon name="check" className="w-4 h-4 text-[#1a0f00]" />
                ) : (
                  <span
                    className={`font-sans text-xs font-medium ${
                      isActive ? 'text-gold' : 'text-muted'
                    }`}
                  >
                    {stepNumber}
                  </span>
                )}
              </div>
              {/* Label */}
              <span
                className={`text-[11px] font-sans whitespace-nowrap ${
                  isCompleted
                    ? 'text-gold-dim font-medium'
                    : isActive
                    ? 'text-ink font-semibold'
                    : 'text-muted'
                }`}
              >
                {step.label}
              </span>
            </div>
            {/* Connector line (not after last step) */}
            {!isLast && (
              <div
                className={`w-12 h-px mb-5 transition-colors duration-300 ${
                  isCompleted ? 'bg-gold' : 'bg-muted/30'
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
