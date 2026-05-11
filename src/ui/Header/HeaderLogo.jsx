import { Link } from 'react-router-dom';
import { ROUTES } from '../../utils/constants';

export default function HeaderLogo({ to = ROUTES.LANDING, children }) {
  return (
    <Link to={to} className="text-2xl font-bold text-secondary">
      {children || 'Caldero Envío'}
    </Link>
  );
}