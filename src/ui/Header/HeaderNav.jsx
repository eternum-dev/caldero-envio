import { Link } from 'react-router-dom';

export default function HeaderNav({ links, children }) {
  return (
    <nav className="flex gap-6">
      {links
        ? links.map(link => (
            <Link
              key={link.to}
              to={link.to}
              className="text-on-surface-variant hover:text-secondary font-medium transition-colors"
            >
              {link.label}
            </Link>
          ))
        : children}
    </nav>
  );
}