import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { FileText, FolderLock, Pencil, Plus, Trash2 } from 'lucide-react';
import { useVehicles } from '../context/VehicleContext';
import { useToast } from '../context/ToastContext';
import { api } from '../lib/api';
import { DOCUMENT_TYPES } from '../lib/constants';
import { formatDate, getExpiryInfo, todayInput } from '../lib/format';
import type { VehicleDocument } from '../types';
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
  SearchInput,
  Select,
  StatCard,
  Textarea,
} from '../components/ui';

interface DocRow extends VehicleDocument {
  status?: string;
  daysUntilExpiry?: number;
}

interface DocForm {
  vehicleId: string;
  documentType: string;
  documentNumber: string;
  issueDate: string;
  expiryDate: string;
  fileUrl: string;
  notes: string;
}

const emptyForm = (vehicleId = ''): DocForm => ({
  vehicleId,
  documentType: 'RC',
  documentNumber: '',
  issueDate: todayInput(),
  expiryDate: todayInput(),
  fileUrl: '',
  notes: '',
});

export default function DocumentsPage() {
  const { vehicles, activeVehicleId } = useVehicles();
  const { success } = useToast();
  const [docs, setDocs] = useState<DocRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [vehicleFilter, setVehicleFilter] = useState(activeVehicleId || 'ALL');
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<DocRow | null>(null);
  const [form, setForm] = useState<DocForm>(emptyForm());
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');
  const [deleting, setDeleting] = useState<DocRow | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await api.get<DocRow[]>('/documents', {
        vehicleId: vehicleFilter !== 'ALL' ? vehicleFilter : undefined,
        documentType: typeFilter !== 'ALL' ? typeFilter : undefined,
      });
      setDocs(data);
    } catch (err: any) {
      setError(err.message || 'Could not load documents.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [vehicleFilter, typeFilter]);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return docs;
    return docs.filter((doc) =>
      [doc.documentType, doc.documentNumber, doc.vehicle?.nickname, doc.notes]
        .join(' ')
        .toLowerCase()
        .includes(term)
    );
  }, [docs, search]);

  const expiredCount = docs.filter((doc) => getExpiryInfo(doc.expiryDate).tone === 'danger').length;
  const expiringCount = docs.filter((doc) => getExpiryInfo(doc.expiryDate).tone === 'warning').length;

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm(vehicleFilter !== 'ALL' ? vehicleFilter : vehicles[0]?.id || ''));
    setFormError('');
    setOpen(true);
  };

  const openEdit = (doc: DocRow) => {
    setEditing(doc);
    setForm({
      vehicleId: doc.vehicleId,
      documentType: doc.documentType,
      documentNumber: doc.documentNumber,
      issueDate: doc.issueDate?.slice(0, 10) || todayInput(),
      expiryDate: doc.expiryDate?.slice(0, 10) || todayInput(),
      fileUrl: doc.fileUrl || '',
      notes: doc.notes || '',
    });
    setFormError('');
    setOpen(true);
  };

  const update = (key: keyof DocForm, value: string) =>
    setForm((current) => ({ ...current, [key]: value }));

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setFormError('');
    if (!form.vehicleId || !form.documentNumber.trim()) {
      setFormError('Vehicle and document number are required.');
      return;
    }
    setSaving(true);
    try {
      const payload = {
        vehicleId: form.vehicleId,
        documentType: form.documentType,
        documentNumber: form.documentNumber,
        issueDate: form.issueDate,
        expiryDate: form.expiryDate,
        fileUrl: form.fileUrl || null,
        notes: form.notes || null,
      };
      if (editing) {
        await api.put(`/documents/${editing.id}`, payload);
        success('Document updated.');
      } else {
        await api.post('/documents', payload);
        success('Document stored in your vault.');
      }
      setOpen(false);
      await load();
    } catch (err: any) {
      setFormError(err.message || 'Could not save document.');
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleting) return;
    setDeleteLoading(true);
    try {
      await api.delete(`/documents/${deleting.id}`);
      success('Document removed from vault.');
      setDeleting(null);
      await load();
    } catch (err: any) {
      setError(err.message || 'Could not delete document.');
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-[1440px]">
      <PageHeader
        title="Documents Vault"
        subtitle="Keep RC, PUC, permits and fitness certificates expiry-aware."
        actions={<Button icon={<Plus className="h-4 w-4" />} onClick={openCreate} disabled={!vehicles.length}>Add document</Button>}
      />

      {!vehicles.length ? (
        <EmptyState
          icon={<FolderLock className="h-7 w-7" />}
          title="No vehicles yet"
          description="Documents are stored per vehicle. Add one to get started."
          action={<Link to="/garage"><Button>Add vehicle</Button></Link>}
        />
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-3">
            <StatCard label="Documents" value={docs.length} hint="Matching filters" icon={<FileText className="h-5 w-5" />} />
            <StatCard label="Expiring soon" value={expiringCount} hint="Within 30 days" tone={expiringCount ? 'warning' : 'success'} />
            <StatCard label="Expired" value={expiredCount} hint="Renew to avoid fines" tone={expiredCount ? 'danger' : 'success'} />
          </div>

          <div className="mt-5 flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
            <div className="w-full lg:max-w-sm">
              <SearchInput value={search} onChange={setSearch} placeholder="Search documents…" />
            </div>
            <div className="flex flex-col gap-2 sm:flex-row">
              <Select value={vehicleFilter} onChange={(event) => setVehicleFilter(event.target.value)} className="sm:w-48">
                <option value="ALL">All vehicles</option>
                {vehicles.map((vehicle) => (
                  <option key={vehicle.id} value={vehicle.id}>{vehicle.nickname}</option>
                ))}
              </Select>
              <Select value={typeFilter} onChange={(event) => setTypeFilter(event.target.value)} className="sm:w-40">
                <option value="ALL">All types</option>
                {DOCUMENT_TYPES.map((type) => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </Select>
            </div>
          </div>

          {error && <div className="mt-4"><ErrorState message={error} onRetry={load} /></div>}

          {loading ? (
            <LoadingBlock label="Opening document vault…" />
          ) : (
            <Card className="mt-4">
              {filtered.length ? (
                <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                  {filtered.map((doc) => {
                    const info = getExpiryInfo(doc.expiryDate);
                    return (
                      <div key={doc.id} className="flex flex-col rounded-xl border border-border-subtle bg-bg-elevated/40 p-4">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-yellow/10 text-primary-yellow">
                              <FileText className="h-5 w-5" />
                            </span>
                            <div>
                              <p className="text-sm font-semibold text-text-main">{doc.documentType}</p>
                              <p className="text-[11px] text-text-secondary">{doc.vehicle?.nickname}</p>
                            </div>
                          </div>
                          <Badge tone={info.tone === 'danger' ? 'danger' : info.tone === 'warning' ? 'warning' : 'success'}>
                            {info.tone === 'danger' ? 'Expired' : info.tone === 'warning' ? 'Expiring' : 'Valid'}
                          </Badge>
                        </div>
                        <p className="mt-3 rounded-lg border border-border-subtle bg-bg-main/50 px-2.5 py-1.5 font-mono text-xs tracking-wide text-text-main">
                          {doc.documentNumber}
                        </p>
                        <div className="mt-2 flex items-center justify-between text-[11px] text-text-secondary">
                          <span>Issued {formatDate(doc.issueDate)}</span>
                          <span>Expires {formatDate(doc.expiryDate)}</span>
                        </div>
                        <p className={`mt-2 text-xs font-medium ${
                          info.tone === 'danger' ? 'text-red-300' : info.tone === 'warning' ? 'text-amber-300' : 'text-emerald-300'
                        }`}>
                          {info.label}
                        </p>
                        {doc.notes && <p className="mt-2 line-clamp-2 text-xs text-text-secondary/80">{doc.notes}</p>}
                        <div className="mt-auto flex items-center justify-between gap-2 pt-3">
                          {doc.fileUrl ? (
                            <a
                              href={doc.fileUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="text-xs font-medium text-primary-yellow hover:text-primary-hover"
                            >
                              Open file
                            </a>
                          ) : (
                            <span className="text-[11px] text-text-secondary/60">No file attached</span>
                          )}
                          <div className="flex gap-1">
                            <button onClick={() => openEdit(doc)} className="rounded-lg p-1.5 text-text-secondary hover:bg-white/5 hover:text-text-main" aria-label="Edit document">
                              <Pencil className="h-3.5 w-3.5" />
                            </button>
                            <button onClick={() => setDeleting(doc)} className="rounded-lg p-1.5 text-text-secondary hover:bg-red-500/10 hover:text-red-300" aria-label="Delete document">
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <EmptyState
                  icon={<FolderLock className="h-7 w-7" />}
                  title="No documents found"
                  description="Add RC, PUC, insurance or permits to track expiry dates automatically."
                  action={<Button icon={<Plus className="h-4 w-4" />} onClick={openCreate}>Add document</Button>}
                />
              )}
            </Card>
          )}
        </>
      )}

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={editing ? 'Edit document' : 'Add document'}
        description="Expiry dates drive reminders in your notification centre."
        size="lg"
      >
        <form onSubmit={submit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Vehicle" required>
              <Select value={form.vehicleId} onChange={(event) => update('vehicleId', event.target.value)} disabled={!!editing}>
                <option value="">Select vehicle</option>
                {vehicles.map((vehicle) => (
                  <option key={vehicle.id} value={vehicle.id}>{vehicle.nickname} · {vehicle.registrationNumber}</option>
                ))}
              </Select>
            </Field>
            <Field label="Document type" required>
              <Select value={form.documentType} onChange={(event) => update('documentType', event.target.value)}>
                {DOCUMENT_TYPES.map((type) => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </Select>
            </Field>
            <Field label="Document number" required className="sm:col-span-2">
              <Input value={form.documentNumber} onChange={(event) => update('documentNumber', event.target.value)} placeholder="KA01AB1234 / PUC number" />
            </Field>
            <Field label="Issue date" required>
              <Input type="date" value={form.issueDate} onChange={(event) => update('issueDate', event.target.value)} />
            </Field>
            <Field label="Expiry date" required>
              <Input type="date" value={form.expiryDate} onChange={(event) => update('expiryDate', event.target.value)} />
            </Field>
            <Field label="File URL" className="sm:col-span-2" hint="Link to a scanned copy or cloud document">
              <Input value={form.fileUrl} onChange={(event) => update('fileUrl', event.target.value)} placeholder="https://…" />
            </Field>
            <Field label="Notes" className="sm:col-span-2">
              <Textarea value={form.notes} onChange={(event) => update('notes', event.target.value)} rows={2} placeholder="Optional notes…" />
            </Field>
          </div>
          {formError && <p className="rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">{formError}</p>}
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button type="button" variant="secondary" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" loading={saving}>{editing ? 'Save changes' : 'Save document'}</Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={!!deleting}
        onCancel={() => setDeleting(null)}
        onConfirm={confirmDelete}
        loading={deleteLoading}
        title={`Delete ${deleting?.documentType || 'document'}?`}
        message="This removes the document from your vault. This cannot be undone."
        confirmLabel="Delete document"
      />
    </div>
  );
}
