import Header from '../Header/Header';

export default function OnboardingLayout({ children }) {
  return (
    <>
      <Header variant="minimal" />
      <div className="flex-1 py-8">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-surface-medium rounded-md p-6">{children}</div>
        </div>
      </div>
    </>
  );
}