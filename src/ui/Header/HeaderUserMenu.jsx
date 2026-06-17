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
        className="flex items-center gap-2 text-muted hover:text-ink transition-colors"
      >
        <Icon name="user" className="w-4 h-4" />
        <Icon name="chevronDown" className="w-3 h-3" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-surface border border-gold/18 rounded-sm py-1 z-50">
          <button
            onClick={handleProfileClick}
            className="w-full px-4 py-2 text-left text-sm text-muted hover:bg-surface-tint hover:text-ink flex items-center gap-2 transition-colors"
          >
            <Icon name="user" className="w-4 h-4" />
            Mi Perfil
          </button>
          <hr className="border-gold/18 my-1" />
          <button
            onClick={handleSignOut}
            className="w-full px-4 py-2 text-left text-sm text-muted hover:bg-surface-tint hover:text-ink flex items-center gap-2 transition-colors"
          >
            <Icon name="signout" className="w-4 h-4" />
            Cerrar Sesión
          </button>
        </div>
      )}
    </div>
  );
}
