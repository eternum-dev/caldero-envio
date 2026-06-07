import { Link } from 'react-router-dom';
import { ROUTES } from '../../utils/constants';

export default function HeaderLogo({ to = ROUTES.LANDING, children }) {
  return (
    <Link to={to} className="font-display text-xl text-gold">
      {children || 'Caldero Envío'}
    </Link>
  );
}
