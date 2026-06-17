import { Header, HeaderLogo } from '../Header';
import VideoPlayer from '../atoms/VideoPlayer';
import Mascot from '../atoms/Mascot';

export default function AuthLayout({ children }) {
  return (
    <div className="min-h-screen bg-bg bg-page-warm flex flex-col">
      <Header>
        <HeaderLogo />
      </Header>
      <main className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-4xl flex items-center gap-10">
          {/* Video del caldero conduciendo */}
          <div className="hidden lg:block flex-1">
            <VideoPlayer
              className="w-full rounded-sm"
              fallback={
                <div className="w-full aspect-video bg-surface border border-gold/18 flex flex-col items-center justify-center gap-3 p-8">
                  <Mascot className="w-32 h-32 opacity-30" />
                  <p className="font-sans text-xs text-muted">🎬 Video del caldero en acción — próximamente</p>
                </div>
              }
            />
          </div>

          {/* Formulario */}
          <div className="w-full max-w-sm flex flex-col items-center shrink-0">
            <Mascot className="w-20 h-20 mb-4 lg:hidden" />
            <div className="w-full bg-surface border border-gold/18 rounded-[14px] p-7">
              {children}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
