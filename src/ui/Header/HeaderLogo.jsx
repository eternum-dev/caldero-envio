import { Link } from 'react-router-dom';
import { ROUTES } from '../../utils/constants';
import Mascot from '../atoms/Mascot';

export default function HeaderLogo({ to = ROUTES.app, children }) {
  return (
    <Link to={to} className="flex items-center gap-2">
      <Mascot className="w-7 h-7" badge />
      <span className="font-display text-xl text-gold">
        {children || 'Caldero Envío'}
      </span>
    </Link>
  );
}
