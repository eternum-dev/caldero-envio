import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { ROUTES } from '../utils/constants';
import AuthLayout from '../ui/templates/AuthLayout';
import FormField from '../ui/molecules/FormField';
import Button from '../ui/atoms/Button';

export default function Login() {
  const { signIn, signInWithGoogle } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const userData = await signIn(email, password);
      navigate(userData?.hasCompletedOnboarding ? ROUTES.APP : ROUTES.ONBOARDING);
    } catch (err) {
      setError(getErrorMessage(err.code));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError('');
    setLoading(true);

    try {
      const userData = await signInWithGoogle();
      navigate(userData?.hasCompletedOnboarding ? ROUTES.APP : ROUTES.ONBOARDING);
    } catch (err) {
      setError(getErrorMessage(err.code));
    } finally {
      setLoading(false);
    }
  };

  const getErrorMessage = code => {
    const messages = {
      'auth/user-not-found': 'No existe usuario con este email',
      'auth/wrong-password': 'Contraseña incorrecta',
      'auth/invalid-email': 'Email inválido',
      'auth/too-many-requests': 'Demasiados intentos. Intenta más tarde',
    };
    return messages[code] || 'Error al iniciar sesión';
  };

  return (
    <AuthLayout>
      <h1 className="font-display text-display-sm font-semibold text-center text-ink mb-8">
        Iniciar Sesión
      </h1>

      {error && (
        <div className="mb-4 p-3 bg-gold-bg border border-gold/25 rounded-sm text-gold-dim text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <FormField
          label="Email"
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="tu@email.com"
          required
        />

        <FormField
          label="Contraseña"
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          placeholder="••••••••"
          required
        />

        <Button type="submit" variant="primary" className="w-full" loading={loading}>
          Iniciar Sesión
        </Button>
      </form>

      <div className="mt-6">
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gold/18" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-3 bg-surface font-sans text-xs text-muted">
              O continúa con
            </span>
          </div>
        </div>

        <div className="mt-6">
          <Button
            type="button"
            variant="secondary"
            className="w-full"
            onClick={handleGoogleSignIn}
            disabled={loading}
          >
            Google
          </Button>
        </div>
      </div>

      <p className="mt-6 text-center font-sans text-xs text-muted">
        ¿No tienes cuenta?{' '}
        <Link to={ROUTES.REGISTER} className="font-sans text-xs text-gold-dim underline underline-offset-2">
          Regístrate
        </Link>
      </p>
    </AuthLayout>
  );
}
