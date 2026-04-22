import Header from '../Header/Header';

export default function AuthLayout({ children }) {
  return (
    <>
      <Header variant="minimal" />
      <div className="min-h-screen bg-surface flex flex-col justify-center py-12 px-4">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-surface-container py-8 px-6 rounded-md">{children}</div>
        </div>
      </div>
    </>
  );
}