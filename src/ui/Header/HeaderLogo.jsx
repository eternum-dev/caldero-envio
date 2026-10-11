import { Link } from 'react-router-dom';
import { ROUTES } from '../../utils/constants';
import Mascot from '../atoms/Mascot';

export default function HeaderLogo({ to = ROUTES.APP, children }) {
  return (
    <Link to={to} className="flex items-center gap-2">
      <Mascot className="h-8 filter drop-shadow-[-2px_2px_6px_#ffffff]" />
      <span className="font-display text-xl text-gold">
        {children || 'Caldero Envío'}
      </span>
    </Link>
  );
}
