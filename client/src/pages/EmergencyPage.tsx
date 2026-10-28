import { useEffect, useState } from 'react';
import {
  ArrowUpRight,
  Phone,
  Plus,
  ShieldAlert,
  Siren,
  Trash2,
  UserRound,
  Pencil,
} from 'lucide-react';
import { useToast } from '../context/ToastContext';
import { api } from '../lib/api';
import { CONTACT_TYPES } from '../lib/constants';
import { capitalise } from '../lib/format';
import type { EmergencyContact } from '../types';
import {
  Badge,
  Button,
  Card,
  CardHeader,
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

interface EmergencyResponse {
  userContacts: EmergencyContact[];
  publicHelplines: EmergencyContact[];
}

interface ContactForm {
  name: string;
  contactType: string;
  phone: string;
  altPhone: string;
  policyOrAccountNo: string;
  notes: string;
}

const emptyForm = (): ContactForm => ({
  name: '',
  contactType: 'PERSONAL',
  phone: '',
  altPhone: '',
  policyOrAccountNo: '',
  notes: '',
});

export default function EmergencyPage() {
  const { success } = useToast();
  const [data, setData] = useState<EmergencyResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<EmergencyContact | null>(null);
  const [form, setForm] = useState<ContactForm>(emptyForm());
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');
  const [deleting, setDeleting] = useState<EmergencyContact | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const result = await api.get<EmergencyResponse>('/emergency');
      setData(result);
    } catch (err: any) {
      setError(err.message || 'Could not load emergency contacts.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm());
    setFormError('');
    setOpen(true);
  };

  const openEdit = (contact: EmergencyContact) => {
    setEditing(contact);
    setForm({
      name: contact.name,
      contactType: contact.contactType,
      phone: contact.phone,
      altPhone: contact.altPhone || '',
      policyOrAccountNo: contact.policyOrAccountNo || '',
      notes: contact.notes || '',
    });
    setFormError('');
    setOpen(true);
  };

  const update = (key: keyof ContactForm, value: string) =>
    setForm((current) => ({ ...current, [key]: value }));

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setFormError('');
    if (!form.name.trim() || !form.phone.trim()) {
      setFormError('Name and phone number are required.');
      return;
    }
    setSaving(true);
    try {
      if (editing) {
        await api.put(`/emergency/${editing.id}`, form);
        success('Contact updated.');
      } else {
        await api.post('/emergency', form);
        success('Emergency contact added.');
      }
      setOpen(false);
      await load();
    } catch (err: any) {
      setFormError(err.message || 'Could not save contact.');
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleting) return;
    setDeleteLoading(true);
    try {
      await api.delete(`/emergency/${deleting.id}`);
      success('Contact removed.');
      setDeleting(null);
      await load();
    } catch (err: any) {
      setError(err.message || 'Could not delete contact.');
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-5xl">
      <PageHeader
        title="Emergency Help"
        subtitle="Your trusted contacts and essential helplines, always one tap away."
        actions={<Button icon={<Plus className="h-4 w-4" />} onClick={openCreate}>Add contact</Button>}
      />

      {error && <div className="mb-4"><ErrorState message={error} onRetry={load} /></div>}

      <div className="mb-5 overflow-hidden rounded-card border border-red-500/30 bg-gradient-to-br from-red-500/15 via-bg-card to-bg-card p-5">
        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <div className="flex items-center gap-4">
            <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-red-500/20 text-red-300">
              <Siren className="h-7 w-7" />
            </span>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-red-300">National emergency</p>
              <p className="font-display text-2xl font-bold text-white">112</p>
              <p className="text-xs text-text-secondary">Police · Fire · Ambulance — 24/7 toll-free</p>
            </div>
          </div>
          <a href="tel:112">
            <Button variant="danger" icon={<Phone className="h-4 w-4" />}>Call 112 now</Button>
          </a>
        </div>
      </div>

      {loading ? (
        <LoadingBlock label="Loading emergency contacts…" />
      ) : data ? (
        <>
          <div className="grid gap-4 sm:grid-cols-3">
            <StatCard label="Personal contacts" value={data.userContacts.length} hint="Saved by you" icon={<UserRound className="h-5 w-5" />} />
            <StatCard label="Public helplines" value={data.publicHelplines.length} hint="Government services" icon={<Siren className="h-5 w-5" />} />
            <StatCard label="Roadside ready" value={data.userContacts.filter((contact) => contact.contactType === 'ROADSIDE_ASSISTANCE').length} hint="Roadside assistance entries" tone="success" />
          </div>

          <div className="mt-5 grid gap-5 lg:grid-cols-2">
            <Card>
              <CardHeader title="My contacts" subtitle="People and services you trust" action={<Badge tone="yellow">{data.userContacts.length}</Badge>} />
              {data.userContacts.length ? (
                <div className="space-y-2">
                  {data.userContacts.map((contact) => (
                    <div key={contact.id} className="rounded-xl border border-border-subtle bg-bg-elevated/40 p-3.5">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="text-sm font-semibold text-text-main">{contact.name}</p>
                          <Badge tone="neutral" className="mt-1">{capitalise(contact.contactType)}</Badge>
                        </div>
                        <div className="flex gap-1">
                          <button onClick={() => openEdit(contact)} className="rounded-lg p-1.5 text-text-secondary hover:bg-white/5 hover:text-text-main" aria-label="Edit contact">
                            <Pencil className="h-3.5 w-3.5" />
                          </button>
                          <button onClick={() => setDeleting(contact)} className="rounded-lg p-1.5 text-text-secondary hover:bg-red-500/10 hover:text-red-300" aria-label="Delete contact">
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                      <div className="mt-2 flex flex-wrap gap-2">
                        <a href={`tel:${contact.phone.replace(/\s/g, '')}`}>
                          <Button size="sm" variant="secondary" icon={<Phone className="h-3.5 w-3.5" />}>{contact.phone}</Button>
                        </a>
                        {contact.altPhone && (
                          <a href={`tel:${contact.altPhone.replace(/\s/g, '')}`}>
                            <Button size="sm" variant="ghost">{contact.altPhone}</Button>
                          </a>
                        )}
                      </div>
                      {contact.policyOrAccountNo && (
                        <p className="mt-2 text-[11px] text-text-secondary">Policy / account: {contact.policyOrAccountNo}</p>
                      )}
                      {contact.notes && <p className="mt-1 text-xs text-text-secondary/80">{contact.notes}</p>}
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState
                  icon={<UserRound className="h-7 w-7" />}
                  title="No personal contacts"
                  description="Add family, your insurer, garage or roadside assistance numbers for quick access."
                  action={<Button icon={<Plus className="h-4 w-4" />} onClick={openCreate}>Add contact</Button>}
                />
              )}
            </Card>

            <Card>
              <CardHeader title="Public helplines" subtitle="Verified government services" action={<ShieldAlert className="h-4 w-4 text-primary-yellow" />} />
              <div className="space-y-2">
                {data.publicHelplines.map((helpline) => (
                  <div key={helpline.id} className="rounded-xl border border-border-subtle bg-bg-elevated/40 p-3.5">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-sm font-semibold text-text-main">{helpline.name}</p>
                        <p className="mt-0.5 text-[11px] text-text-secondary">{helpline.policyOrAccountNo}</p>
                      </div>
                      <Badge tone="info">{capitalise(helpline.contactType)}</Badge>
                    </div>
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      <a href={`tel:${helpline.phone}`}>
                        <Button size="sm" variant="secondary" icon={<Phone className="h-3.5 w-3.5" />}>{helpline.phone}</Button>
                      </a>
                      {helpline.altPhone && <span className="text-xs text-text-secondary">Alt: {helpline.altPhone}</span>}
                    </div>
                    {helpline.notes && <p className="mt-2 text-xs text-text-secondary/80">{helpline.notes}</p>}
                  </div>
                ))}
                <a
                  href="https://www.morth.nic.in/"
                  target="_blank"
                  rel="noreferrer"
                  className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-primary-yellow hover:text-primary-hover"
                >
                  Ministry of Road Transport & Highways <ArrowUpRight className="h-3.5 w-3.5" />
                </a>
              </div>
            </Card>
          </div>
        </>
      ) : null}

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={editing ? 'Edit emergency contact' : 'Add emergency contact'}
        description="These contacts are private to your account."
      >
        <form onSubmit={submit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Name" required>
              <Input value={form.name} onChange={(event) => update('name', event.target.value)} placeholder="Roadside assistance" autoFocus />
            </Field>
            <Field label="Contact type" required>
              <Select value={form.contactType} onChange={(event) => update('contactType', event.target.value)}>
                {CONTACT_TYPES.map((type) => (
                  <option key={type} value={type}>{capitalise(type)}</option>
                ))}
              </Select>
            </Field>
            <Field label="Phone" required>
              <Input value={form.phone} onChange={(event) => update('phone', event.target.value)} placeholder="+91 98450 12345" />
            </Field>
            <Field label="Alternate phone">
              <Input value={form.altPhone} onChange={(event) => update('altPhone', event.target.value)} />
            </Field>
            <Field label="Policy / account number" className="sm:col-span-2">
              <Input value={form.policyOrAccountNo} onChange={(event) => update('policyOrAccountNo', event.target.value)} placeholder="Policy, membership or customer ID" />
            </Field>
            <Field label="Notes" className="sm:col-span-2">
              <Textarea value={form.notes} onChange={(event) => update('notes', event.target.value)} rows={2} />
            </Field>
          </div>
          {formError && <p className="rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">{formError}</p>}
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button type="button" variant="secondary" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" loading={saving}>{editing ? 'Save changes' : 'Add contact'}</Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={!!deleting}
        onCancel={() => setDeleting(null)}
        onConfirm={confirmDelete}
        loading={deleteLoading}
        title={`Remove ${deleting?.name || 'contact'}?`}
        message="This contact will no longer appear in your emergency list."
        confirmLabel="Remove contact"
      />
    </div>
  );
}
