import { Header, HeaderLogo } from '../Header';

export default function AuthLayout({ children }) {
  return (
    <div className="min-h-screen bg-bg bg-page-warm flex flex-col">
      <Header>
        <HeaderLogo />
      </Header>
      <main className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-sm bg-surface border border-gold/18 rounded-[14px] p-7">
          {children}
        </div>
      </main>
    </div>
  );
}
