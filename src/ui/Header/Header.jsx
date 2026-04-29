import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ROUTES } from '../../utils/constants';
import { useAuth } from '../../contexts/AuthContext';
import Icon from '../atoms/Icon';
import Button from '../atoms/Button';

export default function Header({ variant = 'guest', user, currentStep, totalSteps }) {
  switch (variant) {
    case 'minimal':
      return <HeaderMinimal />
    case 'onboarding':
      return <HeaderOnboarding currentStep={currentStep} totalSteps={totalSteps} />
    case 'auth':
      return <HeaderAuth user={user} />
    default:
      return <HeaderGuest />
  }
}

function HeaderMinimal() {
  return (
    <header className="bg-surface-low">
      <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8 flex justify-center">
        <Link to={ROUTES.LANDING} className="text-2xl font-bold text-secondary">
          Caldero Envío
        </Link>
      </div>
    </header>
  )
}

function HeaderGuest() {
  return (
    <header className="bg-surface-low">
      <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8 flex justify-between items-center">
        <Link to={ROUTES.LANDING} className="text-2xl font-bold text-secondary">
          Caldero Envío
        </Link>
        <nav className="flex gap-4">
          <Link to={ROUTES.LOGIN}>
            <Button variant="ghost">Iniciar Sesión</Button>
          </Link>
          <Link to={ROUTES.REGISTER}>
            <Button variant="primary">Registrarse</Button>
          </Link>
        </nav>
      </div>
    </header>
  );
}

function HeaderAuth({ user }) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  const { signOut } = useAuth();

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSignOut = async () => {
    await signOut();
    navigate(ROUTES.LANDING);
  };

  return (
    <header className="bg-surface-low">
      <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8 flex justify-between items-center">
        <Link to={ROUTES.LANDING} className="text-2xl font-bold text-secondary">
          Caldero Envío
        </Link>
        <nav className="flex gap-6">
          <Link
            to={ROUTES.APP}
            className="text-on-surface-variant hover:text-secondary font-medium transition-colors"
          >
            Calcular
          </Link>
          <Link
            to={ROUTES.SETTINGS}
            className="text-on-surface-variant hover:text-secondary font-medium transition-colors"
          >
            Configuración
          </Link>
        </nav>
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center gap-2 text-on-surface-variant hover:text-on_surface transition-colors"
          >
            <span className="text-sm">{user?.email}</span>
            <Icon name="chevronDown" className="w-4 h-4" />
          </button>

          {isDropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-surface-medium rounded-md shadow-floating py-1 z-50">
              <button
                onClick={() => {
                  setIsDropdownOpen(false);
                  navigate(ROUTES.SETTINGS);
                }}
                className="w-full px-4 py-2 text-left text-sm text-on-surface-variant hover:bg-surface-high hover:text-on_surface flex items-center gap-2 transition-colors"
              >
                <Icon name="user" className="w-4 h-4" />
                Mi Perfil
              </button>
              <hr className="border-surface-high my-1" />
              <button
                onClick={handleSignOut}
                className="w-full px-4 py-2 text-left text-sm text-on-surface-variant hover:bg-surface-high hover:text-on_surface flex items-center gap-2 transition-colors"
              >
                <Icon name="signout" className="w-4 h-4" />
                Cerrar Sesión
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

function HeaderOnboarding({ currentStep, totalSteps }) {
  const progress = Math.round((currentStep / totalSteps) * 100);

  return (
    <header className="bg-surface-low">
      <div className="max-w-3xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-4">
          <Link to={ROUTES.LANDING} className="text-2xl font-bold text-secondary">
            Caldero Envío
          </Link>
          <span className="text-sm font-medium text-on-surface-variant">
            Paso {currentStep} de {totalSteps}
          </span>
        </div>
        <div className="bg-surface-medium rounded-full h-2">
          <div
            className="bg-primary-gradient h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </header>
  );
}