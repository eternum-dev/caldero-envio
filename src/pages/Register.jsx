import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { ROUTES } from '../utils/constants';
import AuthLayout from '../templates/AuthLayout';
import FormField from '../ui/molecules/FormField';
import Button from '../ui/atoms/Button';

export default function Register() {
  const { createUser, signInWithGoogle } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    setLoading(true);

    try {
      await createUser(email, password, { name });
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
      await signInWithGoogle();
    } catch (err) {
      setError(getErrorMessage(err.code));
    } finally {
      setLoading(false);
    }
  };

  const getErrorMessage = code => {
    const messages = {
      'auth/email-already-in-use': 'Este email ya está registrado',
      'auth/invalid-email': 'Email inválido',
      'auth/weak-password': 'La contraseña es muy débil',
    };
    return messages[code] || 'Error al registrarse';
  };

  return (
    <AuthLayout>
      <h2 className="text-2xl font-bold text-center text-on_surface mb-8">Crear Cuenta</h2>

      {error && (
        <div className="mb-4 p-3 bg-error-container rounded-md text-secondary text-sm">{error}</div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <FormField
          label="Nombre"
          type="text"
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="Tu nombre"
          required
        />

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
          placeholder="Mínimo 6 caracteres"
          required
        />

        <FormField
          label="Confirmar Contraseña"
          type="password"
          value={confirmPassword}
          onChange={e => setConfirmPassword(e.target.value)}
          placeholder="Repite la contraseña"
          required
        />

        <Button type="submit" variant="primary" size="lg" className="w-full" loading={loading}>
          Crear Cuenta
        </Button>
      </form>

      <div className="mt-6">
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-surface-container_low" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-3 bg-surface-container text-on-surface-variant">
              O continúa con
            </span>
          </div>
        </div>

        <div className="mt-6">
          <Button
            type="button"
            variant="secondary"
            size="lg"
            className="w-full"
            onClick={handleGoogleSignIn}
            disabled={loading}
          >
            Google
          </Button>
        </div>
      </div>

      <p className="mt-6 text-center text-sm text-on-surface-variant">
        ¿Ya tienes cuenta?{' '}
        <Link to={ROUTES.LOGIN} className="text-secondary hover:underline">
          Inicia Sesión
        </Link>
      </p>
    </AuthLayout>
  );
}
