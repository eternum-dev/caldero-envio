import Header from '../ui/Header/Header';

export default function OnboardingLayout({ children, currentStep, totalSteps }) {
  return (
    <>
      <Header variant="onboarding" currentStep={currentStep} totalSteps={totalSteps} />
      <div className="flex-1 py-8">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-surface-container rounded-md p-6">{children}</div>
        </div>
      </div>
    </>
  );
}