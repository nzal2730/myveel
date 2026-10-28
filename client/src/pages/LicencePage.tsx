import { useEffect, useState } from 'react';
import { CreditCard, Lock, Pencil, Save, ShieldCheck, Trash2 } from 'lucide-react';
import { useToast } from '../context/ToastContext';
import { api } from '../lib/api';
import { formatDate, getExpiryInfo, todayInput } from '../lib/format';
import type { DrivingLicence } from '../types';
import {
  Badge,
  Button,
  Card,
  CardHeader,
  ConfirmDialog,
  EmptyState,
  ErrorState,
  Field,
  InfoRow,
  Input,
  LoadingBlock,
  Modal,
  PageHeader,
  StatCard,
} from '../components/ui';

interface LicenceRow extends DrivingLicence {
  status?: string;
  daysUntilExpiry?: number;
}

interface LicenceForm {
  licenceNumber: string;
  vehicleClasses: string;
  issueDate: string;
  expiryDate: string;
  issuingAuthority: string;
  bloodGroup: string;
  documentUrl: string;
}

const emptyForm = (): LicenceForm => ({
  licenceNumber: '',
  vehicleClasses: 'LMV',
  issueDate: todayInput(),
  expiryDate: todayInput(),
  issuingAuthority: '',
  bloodGroup: '',
  documentUrl: '',
});

export default function LicencePage() {
  const { success } = useToast();
  const [licence, setLicence] = useState<LicenceRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<LicenceForm>(emptyForm());
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await api.get<LicenceRow | null>('/licence');
      setLicence(data);
    } catch (err: any) {
      setError(err.message || 'Could not load driving licence.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const openForm = () => {
    setForm(
      licence
        ? {
            licenceNumber: licence.licenceNumber,
            vehicleClasses: licence.vehicleClasses,
            issueDate: licence.issueDate?.slice(0, 10) || todayInput(),
            expiryDate: licence.expiryDate?.slice(0, 10) || todayInput(),
            issuingAuthority: licence.issuingAuthority || '',
            bloodGroup: licence.bloodGroup || '',
            documentUrl: licence.documentUrl || '',
          }
        : emptyForm()
    );
    setFormError('');
    setOpen(true);
  };

  const update = (key: keyof LicenceForm, value: string) =>
    setForm((current) => ({ ...current, [key]: value }));

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setFormError('');
    if (!form.licenceNumber.trim() || !form.vehicleClasses.trim()) {
      setFormError('Licence number and vehicle classes are required.');
      return;
    }
    setSaving(true);
    try {
      const data = await api.post<LicenceRow>('/licence', form);
      setLicence(data);
      success('Driving licence saved securely.');
      setOpen(false);
    } catch (err: any) {
      setFormError(err.message || 'Could not save licence.');
    } finally {
      setSaving(false);
    }
  };

  const remove = async () => {
    setDeleteLoading(true);
    try {
      await api.delete('/licence');
      setLicence(null);
      setConfirmDelete(false);
      success('Driving licence removed.');
    } catch (err: any) {
      setError(err.message || 'Could not delete licence.');
    } finally {
      setDeleteLoading(false);
    }
  };

  if (loading) return <LoadingBlock label="Loading licence…" />;

  const info = licence ? getExpiryInfo(licence.expiryDate) : null;

  return (
    <div className="mx-auto w-full max-w-4xl">
      <PageHeader
        title="Driving Licence"
        subtitle="Store your licence securely — the number is encrypted at rest."
        actions={
          licence ? (
            <>
              <Button variant="secondary" icon={<Pencil className="h-4 w-4" />} onClick={openForm}>Edit licence</Button>
              <Button variant="danger" icon={<Trash2 className="h-4 w-4" />} onClick={() => setConfirmDelete(true)}>Remove</Button>
            </>
          ) : (
            <Button icon={<CreditCard className="h-4 w-4" />} onClick={openForm}>Add licence</Button>
          )
        }
      />

      {error && <div className="mb-4"><ErrorState message={error} onRetry={load} /></div>}

      {licence ? (
        <>
          <div className="grid gap-4 sm:grid-cols-3">
            <StatCard label="Status" value={info?.label || '—'} tone={info?.tone === 'danger' ? 'danger' : info?.tone === 'warning' ? 'warning' : 'success'} icon={<ShieldCheck className="h-5 w-5" />} />
            <StatCard label="Vehicle classes" value={licence.vehicleClasses} hint="Authorised categories" />
            <StatCard label="Valid until" value={formatDate(licence.expiryDate)} hint={`Issued ${formatDate(licence.issueDate)}`} />
          </div>

          <Card className="mt-5">
            <CardHeader
              title="Licence details"
              subtitle="Stored with encryption for the licence number"
              action={<Badge tone={info?.tone === 'danger' ? 'danger' : info?.tone === 'warning' ? 'warning' : 'success'}>{info?.label}</Badge>}
            />
            <div className="grid gap-x-8 sm:grid-cols-2">
              <div>
                <InfoRow label="Licence number" value={<span className="font-mono">{licence.licenceNumber}</span>} />
                <InfoRow label="Vehicle classes" value={licence.vehicleClasses} />
                <InfoRow label="Issuing authority" value={licence.issuingAuthority || '—'} />
              </div>
              <div>
                <InfoRow label="Issue date" value={formatDate(licence.issueDate)} />
                <InfoRow label="Expiry date" value={formatDate(licence.expiryDate)} />
                <InfoRow label="Blood group" value={licence.bloodGroup || '—'} />
              </div>
            </div>
            <div className="mt-4 flex flex-wrap items-center justify-between gap-2 rounded-xl border border-primary-yellow/20 bg-primary-yellow/5 px-3.5 py-3">
              <p className="flex items-center gap-2 text-xs text-text-secondary">
                <Lock className="h-3.5 w-3.5 text-primary-yellow" /> Licence numbers are encrypted before storage and decrypted only for you.
              </p>
              {licence.documentUrl && (
                <a href={licence.documentUrl} target="_blank" rel="noreferrer" className="text-xs font-medium text-primary-yellow hover:text-primary-hover">
                  View document
                </a>
              )}
            </div>
          </Card>
        </>
      ) : (
        <EmptyState
          icon={<CreditCard className="h-7 w-7" />}
          title="No driving licence saved"
          description="Add your licence to monitor expiry and keep the details handy during emergencies."
          action={<Button icon={<CreditCard className="h-4 w-4" />} onClick={openForm}>Add your licence</Button>}
        />
      )}

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={licence ? 'Edit driving licence' : 'Add driving licence'}
        description="Only the licence number is encrypted; other fields support expiry tracking."
        size="lg"
      >
        <form onSubmit={submit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Licence number" required>
              <Input value={form.licenceNumber} onChange={(event) => update('licenceNumber', event.target.value.toUpperCase())} placeholder="KA01 20200000000" />
            </Field>
            <Field label="Vehicle classes" required>
              <Input value={form.vehicleClasses} onChange={(event) => update('vehicleClasses', event.target.value)} placeholder="LMV, MCWG" />
            </Field>
            <Field label="Issue date" required>
              <Input type="date" value={form.issueDate} onChange={(event) => update('issueDate', event.target.value)} />
            </Field>
            <Field label="Expiry date" required>
              <Input type="date" value={form.expiryDate} onChange={(event) => update('expiryDate', event.target.value)} />
            </Field>
            <Field label="Issuing authority">
              <Input value={form.issuingAuthority} onChange={(event) => update('issuingAuthority', event.target.value)} placeholder="RTO Bangalore Central" />
            </Field>
            <Field label="Blood group">
              <Input value={form.bloodGroup} onChange={(event) => update('bloodGroup', event.target.value)} placeholder="O+" />
            </Field>
            <Field label="Document URL" className="sm:col-span-2">
              <Input value={form.documentUrl} onChange={(event) => update('documentUrl', event.target.value)} placeholder="https://…" />
            </Field>
          </div>
          {formError && <p className="rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">{formError}</p>}
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button type="button" variant="secondary" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" loading={saving} icon={<Save className="h-4 w-4" />}>Save licence</Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={confirmDelete}
        onCancel={() => setConfirmDelete(false)}
        onConfirm={remove}
        loading={deleteLoading}
        title="Remove driving licence?"
        message="The stored licence and its encrypted number will be deleted."
        confirmLabel="Remove licence"
      />
    </div>
  );
}
