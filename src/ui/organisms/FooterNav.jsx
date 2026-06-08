import { Link } from 'react-router-dom';
import { ROUTES } from '../../utils/constants';
import Icon from '../atoms/Icon';

export default function FooterNav() {
  return (
    <footer className="bg-surface border-t border-gold/18">
      <div className="max-w-7xl mx-auto px-7 h-14 flex items-center">
        <Link
          to={ROUTES.LANDING}
          className="flex items-center gap-2 text-muted hover:text-ink transition-colors text-sm font-sans"
        >
          <Icon name="home" className="w-5 h-5" />
          Inicio
        </Link>
      </div>
    </footer>
  );
}