import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { BadgeCheck, Pencil, Plus, ShieldCheck, Trash2 } from 'lucide-react';
import { useVehicles } from '../context/VehicleContext';
import { useToast } from '../context/ToastContext';
import { api } from '../lib/api';
import { WARRANTY_TYPES } from '../lib/constants';
import { formatDate, formatNumber, getExpiryInfo, todayInput } from '../lib/format';
import type { Warranty } from '../types';
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

interface WarrantyRow extends Warranty {
  status?: string;
  daysUntilExpiry?: number;
  isOdometerExceeded?: boolean;
}

interface WarrantyForm {
  vehicleId: string;
  warrantyType: string;
  provider: string;
  coverageNotes: string;
  startDate: string;
  expiryDate: string;
  maxOdometer: string;
  documentUrl: string;
}

const emptyForm = (vehicleId = ''): WarrantyForm => ({
  vehicleId,
  warrantyType: 'Vehicle',
  provider: '',
  coverageNotes: '',
  startDate: todayInput(),
  expiryDate: todayInput(),
  maxOdometer: '',
  documentUrl: '',
});

export default function WarrantiesPage() {
  const { vehicles, activeVehicleId } = useVehicles();
  const { success } = useToast();
  const [warranties, setWarranties] = useState<WarrantyRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [vehicleFilter, setVehicleFilter] = useState(activeVehicleId || 'ALL');
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<WarrantyRow | null>(null);
  const [form, setForm] = useState<WarrantyForm>(emptyForm());
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');
  const [deleting, setDeleting] = useState<WarrantyRow | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await api.get<WarrantyRow[]>('/warranties', {
        vehicleId: vehicleFilter !== 'ALL' ? vehicleFilter : undefined,
      });
      setWarranties(data);
    } catch (err: any) {
      setError(err.message || 'Could not load warranties.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [vehicleFilter]);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm(vehicleFilter !== 'ALL' ? vehicleFilter : vehicles[0]?.id || ''));
    setFormError('');
    setOpen(true);
  };

  const openEdit = (warranty: WarrantyRow) => {
    setEditing(warranty);
    setForm({
      vehicleId: warranty.vehicleId,
      warrantyType: warranty.warrantyType,
      provider: warranty.provider,
      coverageNotes: warranty.coverageNotes || '',
      startDate: warranty.startDate?.slice(0, 10) || todayInput(),
      expiryDate: warranty.expiryDate?.slice(0, 10) || todayInput(),
      maxOdometer: warranty.maxOdometer ? String(warranty.maxOdometer) : '',
      documentUrl: warranty.documentUrl || '',
    });
    setFormError('');
    setOpen(true);
  };

  const update = (key: keyof WarrantyForm, value: string) =>
    setForm((current) => ({ ...current, [key]: value }));

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setFormError('');
    if (!form.vehicleId || !form.provider.trim()) {
      setFormError('Vehicle and provider are required.');
      return;
    }
    setSaving(true);
    try {
      const payload = {
        vehicleId: form.vehicleId,
        warrantyType: form.warrantyType,
        provider: form.provider,
        coverageNotes: form.coverageNotes,
        startDate: form.startDate,
        expiryDate: form.expiryDate,
        maxOdometer: form.maxOdometer ? Number(form.maxOdometer) : null,
        documentUrl: form.documentUrl || null,
      };
      if (editing) {
        await api.put(`/warranties/${editing.id}`, payload);
        success('Warranty updated.');
      } else {
        await api.post('/warranties', payload);
        success('Warranty recorded.');
      }
      setOpen(false);
      await load();
    } catch (err: any) {
      setFormError(err.message || 'Could not save warranty.');
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleting) return;
    setDeleteLoading(true);
    try {
      await api.delete(`/warranties/${deleting.id}`);
      success('Warranty removed.');
      setDeleting(null);
      await load();
    } catch (err: any) {
      setError(err.message || 'Could not delete warranty.');
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-[1440px]">
      <PageHeader
        title="Warranty Tracker"
        subtitle="Keep vehicle, battery and component warranties visible before they lapse."
        actions={<Button icon={<Plus className="h-4 w-4" />} onClick={openCreate} disabled={!vehicles.length}>Add warranty</Button>}
      />

      {!vehicles.length ? (
        <EmptyState
          icon={<BadgeCheck className="h-7 w-7" />}
          title="No vehicles yet"
          description="Warranties are linked to a vehicle in your garage."
          action={<Link to="/garage"><Button>Add vehicle</Button></Link>}
        />
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard label="Warranties" value={warranties.length} hint="Matching filters" icon={<BadgeCheck className="h-5 w-5" />} />
            <StatCard
              label="Active"
              value={warranties.filter((item) => getExpiryInfo(item.expiryDate).tone === 'success' && !item.isOdometerExceeded).length}
              hint="Not expired or mileage-capped"
              tone="success"
            />
            <StatCard
              label="Expiring soon"
              value={warranties.filter((item) => getExpiryInfo(item.expiryDate).tone === 'warning').length}
              hint="Within 30 days"
              tone="warning"
            />
            <StatCard
              label="Expired / capped"
              value={warranties.filter((item) => getExpiryInfo(item.expiryDate).tone === 'danger' || item.isOdometerExceeded).length}
              hint="No longer covered"
              tone="danger"
            />
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
            <LoadingBlock label="Loading warranties…" />
          ) : warranties.length ? (
            <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {warranties.map((warranty) => {
                const info = getExpiryInfo(warranty.expiryDate);
                const expired = info.tone === 'danger' || warranty.isOdometerExceeded;
                return (
                  <Card key={warranty.id}>
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-3">
                        <span className={`flex h-10 w-10 items-center justify-center rounded-xl ${expired ? 'bg-red-500/10 text-red-300' : 'bg-primary-yellow/10 text-primary-yellow'}`}>
                          <ShieldCheck className="h-5 w-5" />
                        </span>
                        <div>
                          <p className="text-sm font-semibold text-text-main">{warranty.warrantyType}</p>
                          <p className="text-[11px] text-text-secondary">{warranty.provider}</p>
                        </div>
                      </div>
                      <Badge tone={expired ? 'danger' : info.tone === 'warning' ? 'warning' : 'success'}>
                        {warranty.isOdometerExceeded ? 'Mileage exceeded' : info.label}
                      </Badge>
                    </div>
                    <p className="mt-3 text-xs text-text-secondary">{warranty.vehicle?.nickname}</p>
                    <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
                      <div className="rounded-lg border border-border-subtle bg-bg-elevated/40 px-2.5 py-2">
                        <p className="text-[10px] uppercase tracking-wider text-text-secondary">Start</p>
                        <p className="mt-0.5 text-text-main">{formatDate(warranty.startDate)}</p>
                      </div>
                      <div className="rounded-lg border border-border-subtle bg-bg-elevated/40 px-2.5 py-2">
                        <p className="text-[10px] uppercase tracking-wider text-text-secondary">Expiry</p>
                        <p className="mt-0.5 text-text-main">{formatDate(warranty.expiryDate)}</p>
                      </div>
                    </div>
                    {warranty.maxOdometer && (
                      <p className="mt-2 flex items-center gap-1 text-[11px] text-text-secondary">
                        <BadgeCheck className="h-3 w-3" /> Max {formatNumber(warranty.maxOdometer)} km
                        {warranty.isOdometerExceeded && <span className="text-red-300">· exceeded</span>}
                      </p>
                    )}
                    {warranty.coverageNotes && (
                      <p className="mt-2 line-clamp-2 text-xs text-text-secondary/80">{warranty.coverageNotes}</p>
                    )}
                    <div className="mt-3 flex items-center justify-between gap-2 border-t border-border-subtle pt-3">
                      {warranty.documentUrl ? (
                        <a href={warranty.documentUrl} target="_blank" rel="noreferrer" className="text-xs font-medium text-primary-yellow hover:text-primary-hover">
                          View document
                        </a>
                      ) : (
                        <span className="text-[11px] text-text-secondary/60">No document</span>
                      )}
                      <div className="flex gap-1">
                        <button onClick={() => openEdit(warranty)} className="rounded-lg p-1.5 text-text-secondary hover:bg-white/5 hover:text-text-main" aria-label="Edit warranty">
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                        <button onClick={() => setDeleting(warranty)} className="rounded-lg p-1.5 text-text-secondary hover:bg-red-500/10 hover:text-red-300" aria-label="Delete warranty">
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          ) : (
            <EmptyState
              icon={<BadgeCheck className="h-7 w-7" />}
              title="No warranties tracked"
              description="Add manufacturer or extended warranties to monitor expiry and mileage limits."
              action={<Button icon={<Plus className="h-4 w-4" />} onClick={openCreate}>Add warranty</Button>}
            />
          )}
        </>
      )}

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={editing ? 'Edit warranty' : 'Add warranty'}
        description="Warranty validity depends on both expiry date and odometer limits."
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
            <Field label="Warranty type" required>
              <Select value={form.warrantyType} onChange={(event) => update('warrantyType', event.target.value)}>
                {WARRANTY_TYPES.map((type) => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </Select>
            </Field>
            <Field label="Provider" required>
              <Input value={form.provider} onChange={(event) => update('provider', event.target.value)} placeholder="Hyundai India" />
            </Field>
            <Field label="Max odometer (km)">
              <Input type="number" min={0} value={form.maxOdometer} onChange={(event) => update('maxOdometer', event.target.value)} placeholder="e.g. 100000" />
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
            <Field label="Coverage notes" className="sm:col-span-2">
              <Textarea value={form.coverageNotes} onChange={(event) => update('coverageNotes', event.target.value)} rows={3} placeholder="What is covered, exclusions, claim process…" />
            </Field>
          </div>
          {formError && <p className="rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">{formError}</p>}
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button type="button" variant="secondary" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" loading={saving}>{editing ? 'Save changes' : 'Save warranty'}</Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={!!deleting}
        onCancel={() => setDeleting(null)}
        onConfirm={confirmDelete}
        loading={deleteLoading}
        title="Delete warranty?"
        message="This warranty record will be permanently removed."
        confirmLabel="Delete warranty"
      />
    </div>
  );
}
