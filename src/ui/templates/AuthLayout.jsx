import { Header, HeaderLogo } from '../Header';

export default function AuthLayout({ children }) {
  return (
    <>
      <Header>
        <HeaderLogo />
      </Header>
      <div className="min-h-screen bg-surface flex flex-col justify-center py-12 px-4">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-surface-medium py-8 px-6 rounded-md">{children}</div>
        </div>
      </div>
    </>
  );
}