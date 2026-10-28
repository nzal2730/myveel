import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, LogIn } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Button, Field, Input } from '../../components/ui';
import AuthShell from './AuthShell';

export default function LoginPage() {
  const { login } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const from = (location.state as { from?: string } | null)?.from || '/';

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    if (!identifier.trim() || !password) {
      setError('Enter your email/mobile and password.');
      return;
    }
    setLoading(true);
    try {
      const result = await login(identifier.trim(), password);
      toast.success(`Welcome back, ${result.user.name.split(' ')[0]}!`);
      navigate(result.user.role === 'ADMIN' ? '/admin' : from, { replace: true });
    } catch (err: any) {
      setError(err.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      title="Welcome back"
      subtitle="Sign in to access your garage command centre."
      footer={
        <div className="space-y-2">
          <p>
            New to MyVeel?{' '}
            <Link to="/register" className="font-medium text-primary-yellow hover:text-primary-hover">
              Create an account
            </Link>
          </p>
          <p className="text-xs text-text-secondary/80">
            Demo account: <span className="text-text-main">demo@myveel.dev</span> /{' '}
            <span className="text-text-main">Demo1234</span>
          </p>
        </div>
      }
    >
      <form onSubmit={submit} className="space-y-4">
        <Field label="Email or mobile" required>
          <Input
            value={identifier}
            onChange={(event) => setIdentifier(event.target.value)}
            placeholder="you@example.com or 9876543210"
            autoComplete="username"
            autoFocus
          />
        </Field>
        <Field label="Password" required>
          <div className="relative">
            <Input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Enter your password"
              autoComplete="current-password"
              className="pr-11"
            />
            <button
              type="button"
              onClick={() => setShowPassword((value) => !value)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary transition hover:text-text-main"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </Field>

        <div className="flex justify-end">
          <Link to="/forgot-password" className="text-xs text-text-secondary hover:text-primary-yellow">
            Forgot password?
          </Link>
        </div>

        {error && (
          <p className="rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">
            {error}
          </p>
        )}

        <Button type="submit" loading={loading} className="w-full" icon={<LogIn className="h-4 w-4" />}>
          Sign in to MyVeel
        </Button>
      </form>
    </AuthShell>
  );
}
