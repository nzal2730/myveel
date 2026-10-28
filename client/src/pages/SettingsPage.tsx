import { useEffect, useState } from 'react';
import {
  BadgeCheck,
  Database,
  KeyRound,
  Mail,
  Save,
  Settings2,
  Sparkles,
  Trash2,
  UserRound,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useVehicles } from '../context/VehicleContext';
import { useToast } from '../context/ToastContext';
import { api } from '../lib/api';
import { initials } from '../lib/format';
import type { SettingsResponse, UserSettings } from '../types';
import {
  Badge,
  Button,
  Card,
  CardHeader,
  ConfirmDialog,
  ErrorState,
  Field,
  Input,
  LoadingBlock,
  Modal,
  PageHeader,
  Select,
  Tabs,
  Toggle,
} from '../components/ui';

interface ProfileForm {
  name: string;
  mobile: string;
  avatar: string;
}

const CURRENCIES = [
  { value: '₹', label: 'Indian Rupee (₹)' },
  { value: '$', label: 'US Dollar ($)' },
  { value: '€', label: 'Euro (€)' },
  { value: '£', label: 'Pound Sterling (£)' },
  { value: 'AED', label: 'UAE Dirham (AED)' },
];

export default function SettingsPage() {
  const { user, refreshUser, logout } = useAuth();
  const { refreshVehicles, setActiveVehicleId } = useVehicles();
  const { success } = useToast();
  const [data, setData] = useState<SettingsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tab, setTab] = useState('profile');

  const [profile, setProfile] = useState<ProfileForm>({ name: '', mobile: '', avatar: '' });
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileError, setProfileError] = useState('');

  const [preferences, setPreferences] = useState<UserSettings>({
    emailAlerts: true,
    smsAlerts: false,
    distanceUnit: 'km',
    currency: '₹',
    reminderDaysBefore: '30,15,7',
  });
  const [prefSaving, setPrefSaving] = useState(false);

  const [passwordOpen, setPasswordOpen] = useState(false);
  const [passwords, setPasswords] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordError, setPasswordError] = useState('');

  const [seedLoading, setSeedLoading] = useState(false);
  const [clearLoading, setClearLoading] = useState(false);
  const [seedOpen, setSeedOpen] = useState(false);
  const [clearOpen, setClearOpen] = useState(false);

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const result = await api.get<SettingsResponse>('/settings');
      setData(result);
      setProfile({
        name: result.profile.name || '',
        mobile: result.profile.mobile || '',
        avatar: result.profile.avatar || '',
      });
      setPreferences({
        emailAlerts: result.preferences?.emailAlerts ?? true,
        smsAlerts: result.preferences?.smsAlerts ?? false,
        distanceUnit: result.preferences?.distanceUnit || 'km',
        currency: result.preferences?.currency || '₹',
        reminderDaysBefore: result.preferences?.reminderDaysBefore || '30,15,7',
      });
    } catch (err: any) {
      setError(err.message || 'Could not load settings.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const saveProfile = async (event: React.FormEvent) => {
    event.preventDefault();
    setProfileError('');
    if (!profile.name.trim()) {
      setProfileError('Name is required.');
      return;
    }
    if (!profile.mobile.trim()) {
      setProfileError('Mobile number is required.');
      return;
    }
    setProfileSaving(true);
    try {
      await api.put('/settings/profile', {
        name: profile.name.trim(),
        mobile: profile.mobile.trim(),
        avatar: profile.avatar.trim() || null,
      });
      await refreshUser();
      success('Profile updated.');
      await load();
    } catch (err: any) {
      setProfileError(err.message || 'Could not update profile.');
    } finally {
      setProfileSaving(false);
    }
  };

  const savePreferences = async (event: React.FormEvent) => {
    event.preventDefault();
    setPrefSaving(true);
    try {
      await api.put('/settings/preferences', preferences);
      success('Preferences saved.');
      await load();
    } catch (err: any) {
      setError(err.message || 'Could not save preferences.');
    } finally {
      setPrefSaving(false);
    }
  };

  const changePassword = async (event: React.FormEvent) => {
    event.preventDefault();
    setPasswordError('');
    if (passwords.newPassword !== passwords.confirmPassword) {
      setPasswordError('New password and confirmation do not match.');
      return;
    }
    if (passwords.newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters.');
      return;
    }
    setPasswordSaving(true);
    try {
      await api.put('/settings/password', {
        currentPassword: passwords.currentPassword,
        newPassword: passwords.newPassword,
      });
      success('Password changed successfully.');
      setPasswordOpen(false);
      setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err: any) {
      setPasswordError(err.message || 'Could not change password.');
    } finally {
      setPasswordSaving(false);
    }
  };

  const seedDemo = async () => {
    setSeedLoading(true);
    try {
      await api.post('/seed/sample-garage');
      const vehicles = await refreshVehicles();
      if (vehicles[0]) setActiveVehicleId(vehicles[0].id);
      success('Sample garage loaded with vehicles, records and reminders.');
      setSeedOpen(false);
    } catch (err: any) {
      setError(err.message || 'Could not load sample garage.');
    } finally {
      setSeedLoading(false);
    }
  };

  const clearGarage = async () => {
    setClearLoading(true);
    try {
      await api.post('/seed/clear-garage');
      await refreshVehicles();
      success('All garage data cleared.');
      setClearOpen(false);
    } catch (err: any) {
      setError(err.message || 'Could not clear garage data.');
    } finally {
      setClearLoading(false);
    }
  };

  const profileInfo = data?.profile;

  return (
    <div className="mx-auto w-full max-w-4xl">
      <PageHeader
        title="Settings"
        subtitle="Manage your profile, notification preferences and garage data."
      />

      <div className="mb-5">
        <Tabs
          tabs={[
            { key: 'profile', label: 'Profile' },
            { key: 'preferences', label: 'Preferences' },
            { key: 'data', label: 'Data & account' },
          ]}
          active={tab}
          onChange={setTab}
        />
      </div>

      {error && <div className="mb-4"><ErrorState message={error} onRetry={load} /></div>}

      {loading ? (
        <LoadingBlock label="Loading settings…" />
      ) : tab === 'profile' ? (
        <div className="grid gap-5 lg:grid-cols-[1fr_1.4fr]">
          <Card>
            <CardHeader title="Your account" subtitle="Profile at a glance" />
            <div className="flex items-center gap-4">
              {profileInfo?.avatar ? (
                <img src={profileInfo.avatar} alt={profileInfo.name} className="h-16 w-16 rounded-2xl object-cover" />
              ) : (
                <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-yellow/15 font-display text-xl font-bold text-primary-yellow">
                  {initials(profileInfo?.name || user?.name || 'MyVeel')}
                </span>
              )}
              <div className="min-w-0">
                <p className="truncate font-display text-lg font-semibold text-text-main">{profileInfo?.name || user?.name}</p>
                <p className="truncate text-xs text-text-secondary">{profileInfo?.email || user?.email}</p>
                <Badge tone="yellow" className="mt-1.5">MyVeel member</Badge>
              </div>
            </div>
            <div className="mt-5 space-y-2 text-sm">
              <div className="flex items-center justify-between rounded-lg border border-border-subtle bg-bg-elevated/40 px-3 py-2.5">
                <span className="flex items-center gap-2 text-text-secondary"><Mail className="h-4 w-4" /> Email</span>
                {profileInfo?.isEmailVerified ? (
                  <Badge tone="success"><BadgeCheck className="h-3 w-3" /> Verified</Badge>
                ) : (
                  <Badge tone="warning">Unverified</Badge>
                )}
              </div>
              <div className="flex items-center justify-between rounded-lg border border-border-subtle bg-bg-elevated/40 px-3 py-2.5">
                <span className="flex items-center gap-2 text-text-secondary"><UserRound className="h-4 w-4" /> Mobile</span>
                {profileInfo?.isMobileVerified ? (
                  <Badge tone="success"><BadgeCheck className="h-3 w-3" /> Verified</Badge>
                ) : (
                  <Badge tone="warning">Unverified</Badge>
                )}
              </div>
            </div>
            <Button
              className="mt-4 w-full"
              variant="secondary"
              icon={<KeyRound className="h-4 w-4" />}
              onClick={() => {
                setPasswordError('');
                setPasswordOpen(true);
              }}
            >
              Change password
            </Button>
          </Card>

          <Card>
            <CardHeader title="Edit profile" subtitle="Keep your contact details current" />
            <form onSubmit={saveProfile} className="space-y-4">
              <Field label="Full name" required>
                <Input value={profile.name} onChange={(event) => setProfile({ ...profile, name: event.target.value })} />
              </Field>
              <Field label="Email" hint="Email cannot be changed. Contact support if required.">
                <Input value={profileInfo?.email || user?.email || ''} disabled />
              </Field>
              <Field label="Mobile number" required>
                <Input value={profile.mobile} onChange={(event) => setProfile({ ...profile, mobile: event.target.value })} placeholder="+91 98450 12345" />
              </Field>
              <Field label="Avatar URL" hint="Optional link to a profile image.">
                <Input value={profile.avatar} onChange={(event) => setProfile({ ...profile, avatar: event.target.value })} placeholder="https://…" />
              </Field>
              {profileError && <p className="rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">{profileError}</p>}
              <div className="flex justify-end">
                <Button type="submit" loading={profileSaving} icon={<Save className="h-4 w-4" />}>Save profile</Button>
              </div>
            </form>
          </Card>
        </div>
      ) : tab === 'preferences' ? (
        <Card>
          <CardHeader title="Garage preferences" subtitle="Control reminders and how values are displayed" action={<Settings2 className="h-4 w-4 text-primary-yellow" />} />
          <form onSubmit={savePreferences} className="space-y-5">
            <div className="grid gap-3 sm:grid-cols-2">
              <Toggle
                checked={preferences.emailAlerts}
                onChange={(value) => setPreferences({ ...preferences, emailAlerts: value })}
                label="Email alerts"
                description="Receive expiry and service reminders by email."
              />
              <Toggle
                checked={preferences.smsAlerts}
                onChange={(value) => setPreferences({ ...preferences, smsAlerts: value })}
                label="SMS alerts"
                description="Get urgent reminders on your mobile."
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <Field label="Distance unit">
                <Select value={preferences.distanceUnit} onChange={(event) => setPreferences({ ...preferences, distanceUnit: event.target.value })}>
                  <option value="km">Kilometres (km)</option>
                  <option value="miles">Miles (mi)</option>
                </Select>
              </Field>
              <Field label="Currency">
                <Select value={preferences.currency} onChange={(event) => setPreferences({ ...preferences, currency: event.target.value })}>
                  {CURRENCIES.map((currency) => (
                    <option key={currency.value} value={currency.value}>{currency.label}</option>
                  ))}
                </Select>
              </Field>
              <Field label="Reminder days before" hint="Comma-separated days">
                <Input
                  value={preferences.reminderDaysBefore}
                  onChange={(event) => setPreferences({ ...preferences, reminderDaysBefore: event.target.value })}
                  placeholder="30,15,7"
                />
              </Field>
            </div>
            <div className="flex justify-end">
              <Button type="submit" loading={prefSaving} icon={<Save className="h-4 w-4" />}>Save preferences</Button>
            </div>
          </form>
        </Card>
      ) : (
        <div className="space-y-5">
          <Card>
            <CardHeader
              title="Sample garage"
              subtitle="Load a fully populated demo garage to explore every feature."
              action={<Sparkles className="h-4 w-4 text-primary-yellow" />}
            />
            <p className="text-sm text-text-secondary">
              Adds vehicles, service history, insurance, documents, odometer readings, fuel logs, care tasks and emergency contacts.
              Existing vehicles are kept.
            </p>
            <Button className="mt-4" onClick={() => setSeedOpen(true)} icon={<Database className="h-4 w-4" />}>
              Load sample garage
            </Button>
          </Card>

          <Card className="border-red-500/25">
            <CardHeader title="Danger zone" subtitle="Destructive actions cannot be undone." action={<Trash2 className="h-4 w-4 text-red-300" />} />
            <p className="text-sm text-text-secondary">
              Clear every vehicle and all related records, care tasks, notifications and emergency contacts from your account. Your profile and login stay intact.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Button variant="danger" onClick={() => setClearOpen(true)} icon={<Trash2 className="h-4 w-4" />}>
                Clear garage data
              </Button>
              <Button variant="ghost" onClick={logout}>Sign out</Button>
            </div>
          </Card>
        </div>
      )}

      <Modal
        open={passwordOpen}
        onClose={() => setPasswordOpen(false)}
        title="Change password"
        description="Use at least 6 characters."
        size="sm"
      >
        <form onSubmit={changePassword} className="space-y-4">
          <Field label="Current password" required>
            <Input
              type="password"
              value={passwords.currentPassword}
              onChange={(event) => setPasswords({ ...passwords, currentPassword: event.target.value })}
              autoComplete="current-password"
            />
          </Field>
          <Field label="New password" required>
            <Input
              type="password"
              value={passwords.newPassword}
              onChange={(event) => setPasswords({ ...passwords, newPassword: event.target.value })}
              autoComplete="new-password"
            />
          </Field>
          <Field label="Confirm new password" required>
            <Input
              type="password"
              value={passwords.confirmPassword}
              onChange={(event) => setPasswords({ ...passwords, confirmPassword: event.target.value })}
              autoComplete="new-password"
            />
          </Field>
          {passwordError && <p className="rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">{passwordError}</p>}
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button type="button" variant="secondary" onClick={() => setPasswordOpen(false)}>Cancel</Button>
            <Button type="submit" loading={passwordSaving}>Update password</Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={seedOpen}
        onCancel={() => setSeedOpen(false)}
        onConfirm={seedDemo}
        loading={seedLoading}
        title="Load sample garage?"
        message="Demo vehicles, records and reminders will be added to your account. You can clear them later."
        confirmLabel="Load sample data"
      />
      <ConfirmDialog
        open={clearOpen}
        onCancel={() => setClearOpen(false)}
        onConfirm={clearGarage}
        loading={clearLoading}
        title="Clear all garage data?"
        message="Every vehicle, record, reminder and contact will be permanently deleted. This cannot be undone."
        confirmLabel="Delete everything"
      />
    </div>
  );
}
