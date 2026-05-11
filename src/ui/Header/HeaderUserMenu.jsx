import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../../utils/constants';
import { useAuth } from '../../contexts/AuthContext';
import { useClickOutside } from './useClickOutside';
import Icon from '../atoms/Icon';

export default function HeaderUserMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  const { user, signOut } = useAuth();

  useClickOutside(dropdownRef, () => setIsOpen(false));

  if (!user) {
    return null;
  }

  const handleSignOut = async () => {
    await signOut();
    navigate(ROUTES.LANDING);
  };

  const handleProfileClick = () => {
    setIsOpen(false);
    navigate(ROUTES.SETTINGS);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 text-on-surface-variant hover:text-on_surface transition-colors"
      >
        <span className="text-sm">{user.email}</span>
        <Icon name="chevronDown" className="w-4 h-4" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-surface-medium rounded-md shadow-floating py-1 z-50 border border-surface-high">
          <button
            onClick={handleProfileClick}
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
  );
}