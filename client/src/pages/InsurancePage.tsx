import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { CircleDollarSign, Pencil, Plus, RefreshCw, ShieldCheck, Trash2 } from 'lucide-react';
import { useVehicles } from '../context/VehicleContext';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import { api } from '../lib/api';
import { COVER_TYPES } from '../lib/constants';
import { formatCurrency, formatDate, getExpiryInfo, todayInput } from '../lib/format';
import type { InsurancePolicy } from '../types';
import {
  Badge,
  Button,
  Card,
  ConfirmDialog,
  EmptyState,
  ErrorState,
  Field,
  Input,
  LoadingBlock,
  Modal,
  PageHeader,
  Select,
  StatCard,
  Textarea,
} from '../components/ui';

interface PolicyRow extends InsurancePolicy {
  status?: string;
  daysUntilExpiry?: number;
}

interface PolicyForm {
  vehicleId: string;
  insurer: string;
  policyNumber: string;
  coverType: string;
  premium: string;
  idv: string;
  startDate: string;
  expiryDate: string;
  documentUrl: string;
  notes: string;
}

const oneYearFrom = (dateStr: string) => {
  const date = new Date(dateStr || Date.now());
  date.setFullYear(date.getFullYear() + 1);
  return date.toISOString().slice(0, 10);
};

const emptyForm = (vehicleId = ''): PolicyForm => ({
  vehicleId,
  insurer: '',
  policyNumber: '',
  coverType: 'Comprehensive',
  premium: '',
  idv: '',
  startDate: todayInput(),
  expiryDate: oneYearFrom(todayInput()),
  documentUrl: '',
  notes: '',
});

export default function InsurancePage() {
  const { vehicles, activeVehicleId } = useVehicles();
  const { user } = useAuth();
  const { success } = useToast();
  const [policies, setPolicies] = useState<PolicyRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [vehicleFilter, setVehicleFilter] = useState(activeVehicleId || 'ALL');
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<PolicyRow | null>(null);
  const [renewing, setRenewing] = useState<PolicyRow | null>(null);
  const [form, setForm] = useState<PolicyForm>(emptyForm());
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');
  const [deleting, setDeleting] = useState<PolicyRow | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await api.get<PolicyRow[]>('/insurance', {
        vehicleId: vehicleFilter !== 'ALL' ? vehicleFilter : undefined,
      });
      setPolicies(data);
    } catch (err: any) {
      setError(err.message || 'Could not load insurance policies.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [vehicleFilter]);

  const activePolicies = useMemo(() => policies.filter((policy) => policy.isActive), [policies]);
  const premiumTotal = useMemo(
    () => activePolicies.reduce((sum, policy) => sum + Number(policy.premium || 0), 0),
    [activePolicies]
  );
  const expiring = policies.filter((policy) => getExpiryInfo(policy.expiryDate).tone !== 'success').length;

  const openCreate = () => {
    setEditing(null);
    setRenewing(null);
    setForm(emptyForm(vehicleFilter !== 'ALL' ? vehicleFilter : vehicles[0]?.id || ''));
    setFormError('');
    setOpen(true);
  };

  const openEdit = (policy: PolicyRow) => {
    setEditing(policy);
    setRenewing(null);
    setForm({
      vehicleId: policy.vehicleId,
      insurer: policy.insurer,
      policyNumber: policy.policyNumber,
      coverType: policy.coverType,
      premium: String(policy.premium ?? ''),
      idv: policy.idv ? String(policy.idv) : '',
      startDate: policy.startDate?.slice(0, 10) || todayInput(),
      expiryDate: policy.expiryDate?.slice(0, 10) || todayInput(),
      documentUrl: policy.documentUrl || '',
      notes: policy.notes || '',
    });
    setFormError('');
    setOpen(true);
  };

  const openRenew = (policy: PolicyRow) => {
    setEditing(null);
    setRenewing(policy);
    const start = todayInput();
    setForm({
      vehicleId: policy.vehicleId,
      insurer: policy.insurer,
      policyNumber: '',
      coverType: policy.coverType,
      premium: String(policy.premium ?? ''),
      idv: policy.idv ? String(policy.idv) : '',
      startDate: start,
      expiryDate: oneYearFrom(start),
      documentUrl: '',
      notes: `Renewal of policy ${policy.policyNumber}`,
    });
    setFormError('');
    setOpen(true);
  };

  const update = (key: keyof PolicyForm, value: string) =>
    setForm((current) => {
      const next = { ...current, [key]: value };
      if (key === 'startDate' && (!current.expiryDate || current.expiryDate <= value)) {
        next.expiryDate = oneYearFrom(value);
      }
      return next;
    });

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setFormError('');
    if (!form.vehicleId || !form.insurer.trim() || !form.policyNumber.trim()) {
      setFormError('Vehicle, insurer and policy number are required.');
      return;
    }
    setSaving(true);
    try {
      const payload = {
        vehicleId: form.vehicleId,
        insurer: form.insurer,
        policyNumber: form.policyNumber,
        coverType: form.coverType,
        premium: Number(form.premium) || 0,
        idv: form.idv ? Number(form.idv) : null,
        startDate: form.startDate,
        expiryDate: form.expiryDate,
        documentUrl: form.documentUrl || null,
        notes: form.notes || null,
        isActive: true,
      };
      if (renewing) {
        await api.post(`/insurance/${renewing.id}/renew`, payload);
        success('Policy renewed. The previous policy was archived.');
      } else if (editing) {
        await api.put(`/insurance/${editing.id}`, payload);
        success('Policy updated.');
      } else {
        await api.post('/insurance', payload);
        success('Policy saved and premium synced to expenses.');
      }
      setOpen(false);
      await load();
    } catch (err: any) {
      setFormError(err.message || 'Could not save policy.');
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleting) return;
    setDeleteLoading(true);
    try {
      await api.delete(`/insurance/${deleting.id}`);
      success('Policy removed.');
      setDeleting(null);
      await load();
    } catch (err: any) {
      setError(err.message || 'Could not delete policy.');
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-[1440px]">
      <PageHeader
        title="Insurance"
        subtitle="Keep active cover visible, archive renewals and compare premiums over time."
        actions={<Button icon={<Plus className="h-4 w-4" />} onClick={openCreate} disabled={!vehicles.length}>Add policy</Button>}
      />

      {!vehicles.length ? (
        <EmptyState
          icon={<ShieldCheck className="h-7 w-7" />}
          title="No vehicles yet"
          description="Add a vehicle before recording insurance cover."
          action={<Link to="/garage"><Button>Add vehicle</Button></Link>}
        />
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard label="Policies" value={policies.length} hint="Including archived renewals" icon={<ShieldCheck className="h-5 w-5" />} />
            <StatCard label="Active cover" value={activePolicies.length} hint="Currently marked active" tone="success" />
            <StatCard label="Active premium" value={formatCurrency(premiumTotal, user?.settings?.currency)} hint="Sum of active policies" icon={<CircleDollarSign className="h-5 w-5" />} />
            <StatCard label="Needs attention" value={expiring} hint="Expired or expiring within 30 days" tone={expiring ? 'warning' : 'success'} />
          </div>

          <div className="mt-5 flex justify-end">
            <Select value={vehicleFilter} onChange={(event) => setVehicleFilter(event.target.value)} className="sm:w-56">
              <option value="ALL">All vehicles</option>
              {vehicles.map((vehicle) => (
                <option key={vehicle.id} value={vehicle.id}>{vehicle.nickname}</option>
              ))}
            </Select>
          </div>

          {error && <div className="mt-4"><ErrorState message={error} onRetry={load} /></div>}

          {loading ? (
            <LoadingBlock label="Loading policies…" />
          ) : (
            <div className="mt-4 grid gap-4 lg:grid-cols-2">
              {policies.map((policy) => {
                const info = getExpiryInfo(policy.expiryDate);
                return (
                  <Card key={policy.id} className={policy.isActive ? 'border-primary-yellow/25' : ''}>
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <span className={`flex h-11 w-11 items-center justify-center rounded-xl ${policy.isActive ? 'bg-primary-yellow/10 text-primary-yellow' : 'bg-white/5 text-text-secondary'}`}>
                          <ShieldCheck className="h-5 w-5" />
                        </span>
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="font-display text-base font-semibold text-text-main">{policy.insurer}</p>
                            {policy.isActive ? <Badge tone="success">Active</Badge> : <Badge tone="neutral">Archived</Badge>}
                          </div>
                          <p className="text-xs text-text-secondary">
                            {policy.vehicle?.nickname} · {policy.coverType}
                          </p>
                        </div>
                      </div>
                      <Badge tone={info.tone === 'danger' ? 'danger' : info.tone === 'warning' ? 'warning' : 'success'}>
                        {info.label}
                      </Badge>
                    </div>

                    <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
                      <div className="rounded-lg border border-border-subtle bg-bg-elevated/40 px-3 py-2">
                        <p className="text-[10px] uppercase tracking-wider text-text-secondary">Policy number</p>
                        <p className="mt-0.5 font-medium text-text-main">{policy.policyNumber}</p>
                      </div>
                      <div className="rounded-lg border border-border-subtle bg-bg-elevated/40 px-3 py-2">
                        <p className="text-[10px] uppercase tracking-wider text-text-secondary">Premium</p>
                        <p className="mt-0.5 font-medium text-text-main">{formatCurrency(policy.premium, user?.settings?.currency)}</p>
                      </div>
                      <div className="rounded-lg border border-border-subtle bg-bg-elevated/40 px-3 py-2">
                        <p className="text-[10px] uppercase tracking-wider text-text-secondary">Valid from</p>
                        <p className="mt-0.5 text-text-main">{formatDate(policy.startDate)}</p>
                      </div>
                      <div className="rounded-lg border border-border-subtle bg-bg-elevated/40 px-3 py-2">
                        <p className="text-[10px] uppercase tracking-wider text-text-secondary">Expires</p>
                        <p className="mt-0.5 text-text-main">{formatDate(policy.expiryDate)}</p>
                      </div>
                    </div>

                    {(policy.idv || policy.notes) && (
                      <p className="mt-2 text-xs text-text-secondary">
                        {policy.idv ? `IDV ${formatCurrency(policy.idv, user?.settings?.currency)}` : ''}
                        {policy.idv && policy.notes ? ' · ' : ''}
                        {policy.notes || ''}
                      </p>
                    )}

                    <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-border-subtle pt-3">
                      <div className="flex gap-1.5">
                        {policy.isActive && (
                          <Button size="sm" variant="secondary" onClick={() => openRenew(policy)} icon={<RefreshCw className="h-3.5 w-3.5" />}>
                            Renew
                          </Button>
                        )}
                        {policy.documentUrl && (
                          <a href={policy.documentUrl} target="_blank" rel="noreferrer">
                            <Button size="sm" variant="ghost">Document</Button>
                          </a>
                        )}
                      </div>
                      <div className="flex gap-1">
                        <button onClick={() => openEdit(policy)} className="rounded-lg p-2 text-text-secondary hover:bg-white/5 hover:text-text-main" aria-label="Edit policy">
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button onClick={() => setDeleting(policy)} className="rounded-lg p-2 text-text-secondary hover:bg-red-500/10 hover:text-red-300" aria-label="Delete policy">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </Card>
                );
              })}
              {!policies.length && (
                <div className="lg:col-span-2">
                  <EmptyState
                    icon={<ShieldCheck className="h-7 w-7" />}
                    title="No insurance policies"
                    description="Add your current policy to receive renewal reminders before it expires."
                    action={<Button icon={<Plus className="h-4 w-4" />} onClick={openCreate}>Add policy</Button>}
                  />
                </div>
              )}
            </div>
          )}
        </>
      )}

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={renewing ? 'Renew policy' : editing ? 'Edit policy' : 'Add insurance policy'}
        description={
          renewing
            ? 'A new active policy will be created and the old one archived.'
            : 'Premiums are synced into your expense tracker.'
        }
        size="lg"
      >
        <form onSubmit={submit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Vehicle" required>
              <Select value={form.vehicleId} onChange={(event) => update('vehicleId', event.target.value)} disabled={!!editing || !!renewing}>
                <option value="">Select vehicle</option>
                {vehicles.map((vehicle) => (
                  <option key={vehicle.id} value={vehicle.id}>{vehicle.nickname} · {vehicle.registrationNumber}</option>
                ))}
              </Select>
            </Field>
            <Field label="Insurer" required>
              <Input value={form.insurer} onChange={(event) => update('insurer', event.target.value)} placeholder="ICICI Lombard" />
            </Field>
            <Field label="Policy number" required>
              <Input value={form.policyNumber} onChange={(event) => update('policyNumber', event.target.value)} placeholder="POL-2026-XXXX" />
            </Field>
            <Field label="Cover type" required>
              <Select value={form.coverType} onChange={(event) => update('coverType', event.target.value)}>
                {COVER_TYPES.map((type) => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </Select>
            </Field>
            <Field label="Premium">
              <Input type="number" min={0} step="0.01" value={form.premium} onChange={(event) => update('premium', event.target.value)} />
            </Field>
            <Field label="IDV">
              <Input type="number" min={0} step="0.01" value={form.idv} onChange={(event) => update('idv', event.target.value)} />
            </Field>
            <Field label="Start date" required>
              <Input type="date" value={form.startDate} onChange={(event) => update('startDate', event.target.value)} />
            </Field>
            <Field label="Expiry date" required>
              <Input type="date" value={form.expiryDate} onChange={(event) => update('expiryDate', event.target.value)} />
            </Field>
            <Field label="Document URL" className="sm:col-span-2">
              <Input value={form.documentUrl} onChange={(event) => update('documentUrl', event.target.value)} placeholder="https://…" />
            </Field>
            <Field label="Notes" className="sm:col-span-2">
              <Textarea value={form.notes} onChange={(event) => update('notes', event.target.value)} rows={2} />
            </Field>
          </div>
          {formError && <p className="rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">{formError}</p>}
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button type="button" variant="secondary" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" loading={saving}>{renewing ? 'Renew policy' : editing ? 'Save changes' : 'Save policy'}</Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={!!deleting}
        onCancel={() => setDeleting(null)}
        onConfirm={confirmDelete}
        loading={deleteLoading}
        title="Delete insurance policy?"
        message="The policy and its linked premium expense will be removed. This cannot be undone."
        confirmLabel="Delete policy"
      />
    </div>
  );
}
