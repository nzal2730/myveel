import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, UserPlus } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Button, Field, Input } from '../../components/ui';
import AuthShell from './AuthShell';

export default function RegisterPage() {
  const { register } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', mobile: '', password: '', confirm: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const update = (key: keyof typeof form) => (event: React.ChangeEvent<HTMLInputElement>) =>
    setForm((current) => ({ ...current, [key]: event.target.value }));

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    if (!form.name.trim() || !form.email.trim() || !form.mobile.trim() || !form.password) {
      setError('All fields are required.');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      setError('Enter a valid email address.');
      return;
    }
    if (form.mobile.replace(/\D/g, '').length < 10) {
      setError('Enter a valid mobile number.');
      return;
    }
    if (form.password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    if (form.password !== form.confirm) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      const result = await register({
        name: form.name.trim(),
        email: form.email.trim(),
        mobile: form.mobile.trim(),
        password: form.password,
      });
      toast.success('Account created. Verify your email and mobile to continue.');
      navigate('/verify-otp', {
        state: {
          email: result.user.email,
          mobile: result.user.mobile,
          devOtps: result.devOtps,
        },
      });
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      title="Create your garage"
      subtitle="Set up a secure MyVeel account in under a minute."
      footer={
        <p>
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-primary-yellow hover:text-primary-hover">
            Sign in
          </Link>
        </p>
      }
    >
      <form onSubmit={submit} className="space-y-4">
        <Field label="Full name" required>
          <Input value={form.name} onChange={update('name')} placeholder="Aarav Sharma" autoComplete="name" autoFocus />
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Email address" required>
            <Input
              type="email"
              value={form.email}
              onChange={update('email')}
              placeholder="you@example.com"
              autoComplete="email"
            />
          </Field>
          <Field label="Mobile number" required>
            <Input
              value={form.mobile}
              onChange={update('mobile')}
              placeholder="9876543210"
              autoComplete="tel"
            />
          </Field>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Password" required hint="Minimum 6 characters">
            <div className="relative">
              <Input
                type={showPassword ? 'text' : 'password'}
                value={form.password}
                onChange={update('password')}
                placeholder="Create password"
                autoComplete="new-password"
                className="pr-11"
              />
              <button
                type="button"
                onClick={() => setShowPassword((value) => !value)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary hover:text-text-main"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </Field>
          <Field label="Confirm password" required>
            <Input
              type={showPassword ? 'text' : 'password'}
              value={form.confirm}
              onChange={update('confirm')}
              placeholder="Repeat password"
              autoComplete="new-password"
            />
          </Field>
        </div>

        {error && (
          <p className="rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">
            {error}
          </p>
        )}

        <Button type="submit" loading={loading} className="w-full" icon={<UserPlus className="h-4 w-4" />}>
          Create my account
        </Button>
        <p className="text-center text-[11px] leading-relaxed text-text-secondary/80">
          Registration generates one-time codes for email and mobile verification. In development,
          the codes are shown on the next screen.
        </p>
      </form>
    </AuthShell>
  );
}
