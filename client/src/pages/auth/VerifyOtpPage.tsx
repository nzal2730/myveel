import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { CheckCircle2, Mail, MessageSquare, ShieldCheck } from 'lucide-react';
import { api } from '../../lib/api';
import { useToast } from '../../context/ToastContext';
import { Badge, Button, Field, Input } from '../../components/ui';
import AuthShell from './AuthShell';

interface OtpState {
  email?: string;
  mobile?: string;
  devOtps?: { emailOtp?: string; smsOtp?: string };
}

export default function VerifyOtpPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const toast = useToast();
  const state = (location.state as OtpState | null) || {};
  const [email, setEmail] = useState(state.email || '');
  const [mobile, setMobile] = useState(state.mobile || '');
  const [emailOtp, setEmailOtp] = useState('');
  const [mobileOtp, setMobileOtp] = useState('');
  const [emailVerified, setEmailVerified] = useState(false);
  const [mobileVerified, setMobileVerified] = useState(false);
  const [emailLoading, setEmailLoading] = useState(false);
  const [mobileLoading, setMobileLoading] = useState(false);
  const [emailDev, setEmailDev] = useState(state.devOtps?.emailOtp || '');
  const [mobileDev, setMobileDev] = useState(state.devOtps?.smsOtp || '');
  const [error, setError] = useState('');

  const verify = async (kind: 'email' | 'mobile') => {
    setError('');
    const target = kind === 'email' ? email.trim() : mobile.trim();
    const code = kind === 'email' ? emailOtp.trim() : mobileOtp.trim();
    if (!target) {
      setError(`Enter your ${kind === 'email' ? 'email address' : 'mobile number'} first.`);
      return;
    }
    if (!code) {
      setError('Enter the one-time code.');
      return;
    }
    const setLoading = kind === 'email' ? setEmailLoading : setMobileLoading;
    setLoading(true);
    try {
      await api.post('/auth/otp/verify', {
        target,
        type: kind === 'email' ? 'REGISTER_EMAIL' : 'REGISTER_SMS',
        otp: code,
      });
      if (kind === 'email') setEmailVerified(true);
      else setMobileVerified(true);
      toast.success(`${kind === 'email' ? 'Email' : 'Mobile'} verified successfully.`);
    } catch (err: any) {
      setError(err.message || 'OTP verification failed.');
    } finally {
      setLoading(false);
    }
  };

  const resend = async (kind: 'email' | 'mobile') => {
    setError('');
    const target = kind === 'email' ? email.trim() : mobile.trim();
    if (!target) {
      setError('Enter a target before requesting a new code.');
      return;
    }
    try {
      const result = await api.post<{ devOtp?: string }>('/auth/otp/send', {
        target,
        type: kind === 'email' ? 'REGISTER_EMAIL' : 'REGISTER_SMS',
      });
      if (result?.devOtp) {
        if (kind === 'email') setEmailDev(result.devOtp);
        else setMobileDev(result.devOtp);
      }
      toast.info('A new one-time code has been generated.');
    } catch (err: any) {
      setError(err.message || 'Could not resend the code.');
    }
  };

  return (
    <AuthShell
      title="Verify your account"
      subtitle="Enter the one-time codes sent to your email and mobile number."
      footer={
        <p>
          Already verified?{' '}
          <Link to="/login" className="font-medium text-primary-yellow hover:text-primary-hover">
            Sign in
          </Link>
        </p>
      }
    >
      <div className="space-y-4">
        <div className={`rounded-card border p-4 ${emailVerified ? 'border-emerald-500/30 bg-emerald-500/5' : 'border-border-subtle bg-bg-card'}`}>
          <div className="mb-3 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-sm font-semibold text-text-main">
              <Mail className="h-4 w-4 text-primary-yellow" /> Email verification
            </div>
            {emailVerified ? <Badge tone="success">Verified</Badge> : <Badge tone="warning">Pending</Badge>}
          </div>
          <div className="space-y-3">
            <Field label="Email address">
              <Input value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" />
            </Field>
            <div className="flex flex-col gap-2 sm:flex-row">
              <Input
                value={emailOtp}
                onChange={(event) => setEmailOtp(event.target.value)}
                placeholder="6-digit email code"
                maxLength={6}
                disabled={emailVerified}
              />
              <Button
                variant="secondary"
                onClick={() => verify('email')}
                loading={emailLoading}
                disabled={emailVerified}
                icon={<ShieldCheck className="h-4 w-4" />}
              >
                Verify
              </Button>
            </div>
            {emailDev && !emailVerified && (
              <p className="rounded-lg border border-primary-yellow/20 bg-primary-yellow/5 px-3 py-2 text-xs text-primary-yellow">
                Development code: <strong className="tracking-[0.2em]">{emailDev}</strong>
              </p>
            )}
            {!emailVerified && (
              <button
                type="button"
                onClick={() => resend('email')}
                className="text-xs text-text-secondary hover:text-primary-yellow"
              >
                Resend email code
              </button>
            )}
          </div>
        </div>

        <div className={`rounded-card border p-4 ${mobileVerified ? 'border-emerald-500/30 bg-emerald-500/5' : 'border-border-subtle bg-bg-card'}`}>
          <div className="mb-3 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-sm font-semibold text-text-main">
              <MessageSquare className="h-4 w-4 text-primary-yellow" /> Mobile verification
            </div>
            {mobileVerified ? <Badge tone="success">Verified</Badge> : <Badge tone="warning">Pending</Badge>}
          </div>
          <div className="space-y-3">
            <Field label="Mobile number">
              <Input value={mobile} onChange={(event) => setMobile(event.target.value)} placeholder="9876543210" />
            </Field>
            <div className="flex flex-col gap-2 sm:flex-row">
              <Input
                value={mobileOtp}
                onChange={(event) => setMobileOtp(event.target.value)}
                placeholder="6-digit SMS code"
                maxLength={6}
                disabled={mobileVerified}
              />
              <Button
                variant="secondary"
                onClick={() => verify('mobile')}
                loading={mobileLoading}
                disabled={mobileVerified}
                icon={<ShieldCheck className="h-4 w-4" />}
              >
                Verify
              </Button>
            </div>
            {mobileDev && !mobileVerified && (
              <p className="rounded-lg border border-primary-yellow/20 bg-primary-yellow/5 px-3 py-2 text-xs text-primary-yellow">
                Development code: <strong className="tracking-[0.2em]">{mobileDev}</strong>
              </p>
            )}
            {!mobileVerified && (
              <button
                type="button"
                onClick={() => resend('mobile')}
                className="text-xs text-text-secondary hover:text-primary-yellow"
              >
                Resend SMS code
              </button>
            )}
          </div>
        </div>

        {error && (
          <p className="rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">
            {error}
          </p>
        )}

        <Button
          className="w-full"
          variant={emailVerified && mobileVerified ? 'primary' : 'secondary'}
          onClick={() => navigate('/login')}
          icon={<CheckCircle2 className="h-4 w-4" />}
        >
          {emailVerified && mobileVerified ? 'Continue to sign in' : 'Verify later and sign in'}
        </Button>
      </div>
    </AuthShell>
  );
}
