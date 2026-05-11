import { Link } from 'react-router-dom';
import { ROUTES } from '../../utils/constants';
import Button from '../atoms/Button';

export default function HeaderActions({ children }) {
  return <div className="flex gap-4">{children || null}</div>;
}