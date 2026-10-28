import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { KeyRound, Send } from 'lucide-react';
import { api } from '../../lib/api';
import { useToast } from '../../context/ToastContext';
import { Badge, Button, Field, Input } from '../../components/ui';
import AuthShell from './AuthShell';

interface ForgotResponse {
  success: boolean;
  message: string;
  target?: string;
  devOtp?: string;
}

export default function ForgotPasswordPage() {
  const navigate = useNavigate();
  const toast = useToast();
  const [step, setStep] = useState<1 | 2>(1);
  const [target, setTarget] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [resolvedTarget, setResolvedTarget] = useState('');
  const [devOtp, setDevOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const requestCode = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    if (!target.trim()) {
      setError('Enter your registered email or mobile number.');
      return;
    }
    setLoading(true);
    try {
      const result = await api.post<ForgotResponse>('/auth/forgot-password', {
        target: target.trim(),
      });
      setResolvedTarget(result.target || target.trim());
      setDevOtp(result.devOtp || '');
      setStep(2);
      toast.success('If an account exists, a reset code has been generated.');
    } catch (err: any) {
      setError(err.message || 'Could not start password recovery.');
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    if (!otp.trim() || !newPassword) {
      setError('Enter the reset code and a new password.');
      return;
    }
    if (newPassword.length < 6) {
      setError('New password must be at least 6 characters.');
      return;
    }
    if (newPassword !== confirm) {
      setError('Passwords do not match.');
      return;
    }
    setLoading(true);
    try {
      await api.post('/auth/reset-password', {
        target: resolvedTarget,
        otp: otp.trim(),
        newPassword,
      });
      toast.success('Password reset successfully. You can sign in now.');
      navigate('/login');
    } catch (err: any) {
      setError(err.message || 'Password reset failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      title={step === 1 ? 'Recover your account' : 'Set a new password'}
      subtitle={
        step === 1
          ? 'We will generate a one-time reset code for your registered email.'
          : `Enter the code generated for ${resolvedTarget} and choose a new password.`
      }
      footer={
        <p>
          Remembered it?{' '}
          <Link to="/login" className="font-medium text-primary-yellow hover:text-primary-hover">
            Back to sign in
          </Link>
        </p>
      }
    >
      {step === 1 ? (
        <form onSubmit={requestCode} className="space-y-4">
          <Field label="Email or mobile" required>
            <Input
              value={target}
              onChange={(event) => setTarget(event.target.value)}
              placeholder="you@example.com or 9876543210"
              autoFocus
            />
          </Field>
          {error && (
            <p className="rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">
              {error}
            </p>
          )}
          <Button type="submit" loading={loading} className="w-full" icon={<Send className="h-4 w-4" />}>
            Send reset code
          </Button>
        </form>
      ) : (
        <form onSubmit={resetPassword} className="space-y-4">
          {devOtp && (
            <div className="flex items-center justify-between gap-3 rounded-xl border border-primary-yellow/25 bg-primary-yellow/5 px-3 py-2.5">
              <span className="text-xs text-text-secondary">Development reset code</span>
              <Badge tone="yellow">{devOtp}</Badge>
            </div>
          )}
          <Field label="Reset code" required>
            <Input
              value={otp}
              onChange={(event) => setOtp(event.target.value)}
              placeholder="Enter the one-time code"
              maxLength={6}
              autoFocus
            />
          </Field>
          <Field label="New password" required hint="Minimum 6 characters">
            <Input
              type="password"
              value={newPassword}
              onChange={(event) => setNewPassword(event.target.value)}
              placeholder="New password"
              autoComplete="new-password"
            />
          </Field>
          <Field label="Confirm new password" required>
            <Input
              type="password"
              value={confirm}
              onChange={(event) => setConfirm(event.target.value)}
              placeholder="Repeat new password"
              autoComplete="new-password"
            />
          </Field>
          {error && (
            <p className="rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">
              {error}
            </p>
          )}
          <Button type="submit" loading={loading} className="w-full" icon={<KeyRound className="h-4 w-4" />}>
            Reset my password
          </Button>
          <button
            type="button"
            className="w-full text-center text-xs text-text-secondary hover:text-primary-yellow"
            onClick={() => {
              setStep(1);
              setOtp('');
              setDevOtp('');
              setError('');
            }}
          >
            Use a different account
          </button>
        </form>
      )}
    </AuthShell>
  );
}
