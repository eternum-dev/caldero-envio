import { Header, HeaderLogo } from '../Header';
import HeaderStepIndicator from '../Header/HeaderStepIndicator';

export default function OnboardingLayout({ children, currentStep, totalSteps }) {
  const steps = [
    { id: 1, label: 'Local' },
    { id: 2, label: 'Repartidores' },
    { id: 3, label: 'Tarifas' },
  ];

  return (
    <div className="min-h-screen bg-bg bg-page-warm flex flex-col">
      <Header>
        <HeaderLogo />
      </Header>
      <main className="flex-1 w-full max-w-7xl mx-auto px-7 py-6">
        <div className="w-full flex justify-center">
          {currentStep <= 3 && (
            <HeaderStepIndicator steps={steps} currentStep={currentStep} />
          )}
        </div>
        <div className="w-full max-w-5xl mx-auto mt-6 bg-surface border border-gold/18 rounded-[14px] p-6">
          {children}
        </div>
      </main>
    </div>
  );
}
