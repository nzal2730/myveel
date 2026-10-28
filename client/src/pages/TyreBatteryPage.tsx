import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  BatteryCharging,
  CircleDot,
  Disc3,
  Pencil,
  Plus,
  RotateCw,
  SlidersHorizontal,
  Trash2,
} from 'lucide-react';
import { useVehicles } from '../context/VehicleContext';
import { useToast } from '../context/ToastContext';
import { api } from '../lib/api';
import { TYRE_POSITIONS } from '../lib/constants';
import { formatDate, formatNumber, todayInput } from '../lib/format';
import type { TyreBatteryRecord } from '../types';
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

interface ItemRow extends TyreBatteryRecord {
  ageMonths?: number;
  kmRun?: number;
  isDue?: boolean;
  dueReason?: string;
}

interface ItemForm {
  vehicleId: string;
  itemType: string;
  brand: string;
  model: string;
  position: string;
  sizeOrSerial: string;
  installedDate: string;
  installedOdometer: string;
  replacementDueAgeMonths: string;
  replacementDueKm: string;
  notes: string;
}

const emptyForm = (vehicleId = '', odometer = 0): ItemForm => ({
  vehicleId,
  itemType: 'TYRE',
  brand: '',
  model: '',
  position: 'Front Left',
  sizeOrSerial: '',
  installedDate: todayInput(),
  installedOdometer: String(odometer || ''),
  replacementDueAgeMonths: '',
  replacementDueKm: '',
  notes: '',
});

export default function TyreBatteryPage() {
  const { vehicles, activeVehicleId } = useVehicles();
  const { success } = useToast();
  const [items, setItems] = useState<ItemRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [vehicleFilter, setVehicleFilter] = useState(activeVehicleId || 'ALL');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<ItemRow | null>(null);
  const [form, setForm] = useState<ItemForm>(emptyForm());
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');
  const [deleting, setDeleting] = useState<ItemRow | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await api.get<ItemRow[]>('/tyre-battery', {
        vehicleId: vehicleFilter !== 'ALL' ? vehicleFilter : undefined,
        itemType: typeFilter !== 'ALL' ? typeFilter : undefined,
      });
      setItems(data);
    } catch (err: any) {
      setError(err.message || 'Could not load tyre and battery records.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [vehicleFilter, typeFilter]);

  const openCreate = (itemType = 'TYRE') => {
    const vehicle =
      vehicles.find((item) => item.id === vehicleFilter) ||
      vehicles.find((item) => item.id === activeVehicleId) ||
      vehicles[0];
    setEditing(null);
    setForm({ ...emptyForm(vehicle?.id || '', vehicle?.currentOdometer || 0), itemType });
    setFormError('');
    setOpen(true);
  };

  const openEdit = (item: ItemRow) => {
    setEditing(item);
    setForm({
      vehicleId: item.vehicleId,
      itemType: item.itemType,
      brand: item.brand,
      model: item.model,
      position: item.position || '',
      sizeOrSerial: item.sizeOrSerial || '',
      installedDate: item.installedDate?.slice(0, 10) || todayInput(),
      installedOdometer: String(item.installedOdometer ?? ''),
      replacementDueAgeMonths: item.replacementDueAgeMonths ? String(item.replacementDueAgeMonths) : '',
      replacementDueKm: item.replacementDueKm ? String(item.replacementDueKm) : '',
      notes: item.notes || '',
    });
    setFormError('');
    setOpen(true);
  };

  const update = (key: keyof ItemForm, value: string) =>
    setForm((current) => ({ ...current, [key]: value }));

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setFormError('');
    if (!form.vehicleId || !form.brand.trim() || !form.model.trim()) {
      setFormError('Vehicle, brand and model are required.');
      return;
    }
    setSaving(true);
    try {
      const payload = {
        vehicleId: form.vehicleId,
        itemType: form.itemType,
        brand: form.brand,
        model: form.model,
        position: form.itemType === 'TYRE' ? form.position : null,
        sizeOrSerial: form.sizeOrSerial || null,
        installedDate: form.installedDate,
        installedOdometer: Number(form.installedOdometer) || 0,
        replacementDueAgeMonths: form.replacementDueAgeMonths ? Number(form.replacementDueAgeMonths) : null,
        replacementDueKm: form.replacementDueKm ? Number(form.replacementDueKm) : null,
        notes: form.notes || null,
      };
      if (editing) {
        await api.put(`/tyre-battery/${editing.id}`, payload);
        success('Record updated.');
      } else {
        await api.post('/tyre-battery', payload);
        success(`${form.itemType === 'TYRE' ? 'Tyre' : 'Battery'} recorded.`);
      }
      setOpen(false);
      await load();
    } catch (err: any) {
      setFormError(err.message || 'Could not save record.');
    } finally {
      setSaving(false);
    }
  };

  const logAction = async (item: ItemRow, action: 'ROTATE' | 'ALIGN') => {
    try {
      await api.post(`/tyre-battery/${item.id}/action`, { action });
      success(action === 'ROTATE' ? 'Tyre rotation logged.' : 'Wheel alignment logged.');
      await load();
    } catch (err: any) {
      setError(err.message || 'Could not log action.');
    }
  };

  const confirmDelete = async () => {
    if (!deleting) return;
    setDeleteLoading(true);
    try {
      await api.delete(`/tyre-battery/${deleting.id}`);
      success('Record deleted.');
      setDeleting(null);
      await load();
    } catch (err: any) {
      setError(err.message || 'Could not delete record.');
    } finally {
      setDeleteLoading(false);
    }
  };

  const dueCount = items.filter((item) => item.isDue).length;

  return (
    <div className="mx-auto w-full max-w-[1440px]">
      <PageHeader
        title="Tyre & Battery"
        subtitle="Track installations, rotations, alignment and replacement thresholds."
        actions={
          <>
            <Button variant="secondary" icon={<BatteryCharging className="h-4 w-4" />} onClick={() => openCreate('BATTERY')} disabled={!vehicles.length}>
              Add battery
            </Button>
            <Button icon={<Plus className="h-4 w-4" />} onClick={() => openCreate('TYRE')} disabled={!vehicles.length}>
              Add tyre
            </Button>
          </>
        }
      />

      {!vehicles.length ? (
        <EmptyState
          icon={<Disc3 className="h-7 w-7" />}
          title="No vehicles yet"
          description="Tyres and batteries are tracked per vehicle."
          action={<Link to="/garage"><Button>Add vehicle</Button></Link>}
        />
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard label="Records" value={items.length} hint="Tyres and batteries" icon={<Disc3 className="h-5 w-5" />} />
            <StatCard label="Tyres" value={items.filter((item) => item.itemType === 'TYRE').length} hint="Installed tyres tracked" />
            <StatCard label="Batteries" value={items.filter((item) => item.itemType === 'BATTERY').length} hint="Installed batteries tracked" icon={<BatteryCharging className="h-5 w-5" />} />
            <StatCard label="Replacement due" value={dueCount} hint="Age or mileage threshold reached" tone={dueCount ? 'warning' : 'success'} />
          </div>

          <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:justify-end">
            <Select value={vehicleFilter} onChange={(event) => setVehicleFilter(event.target.value)} className="sm:w-48">
              <option value="ALL">All vehicles</option>
              {vehicles.map((vehicle) => (
                <option key={vehicle.id} value={vehicle.id}>{vehicle.nickname}</option>
              ))}
            </Select>
            <Select value={typeFilter} onChange={(event) => setTypeFilter(event.target.value)} className="sm:w-40">
              <option value="ALL">All types</option>
              <option value="TYRE">Tyres</option>
              <option value="BATTERY">Batteries</option>
            </Select>
          </div>

          {error && <div className="mt-4"><ErrorState message={error} onRetry={load} /></div>}

          {loading ? (
            <LoadingBlock label="Loading tyre and battery records…" />
          ) : items.length ? (
            <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {items.map((item) => (
                <Card key={item.id} className={item.isDue ? 'border-amber-500/30' : ''}>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <span className={`flex h-10 w-10 items-center justify-center rounded-xl ${item.itemType === 'BATTERY' ? 'bg-sky-500/10 text-sky-300' : 'bg-primary-yellow/10 text-primary-yellow'}`}>
                        {item.itemType === 'BATTERY' ? <BatteryCharging className="h-5 w-5" /> : <CircleDot className="h-5 w-5" />}
                      </span>
                      <div>
                        <p className="text-sm font-semibold text-text-main">{item.brand} {item.model}</p>
                        <p className="text-[11px] text-text-secondary">
                          {item.vehicle?.nickname}
                          {item.position ? ` · ${item.position}` : ''}
                        </p>
                      </div>
                    </div>
                    <Badge tone={item.isDue ? 'warning' : 'success'}>{item.isDue ? 'Replace' : 'OK'}</Badge>
                  </div>

                  <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                    <div className="rounded-lg border border-border-subtle bg-bg-elevated/40 px-2.5 py-2">
                      <p className="text-[10px] uppercase tracking-wider text-text-secondary">Installed</p>
                      <p className="mt-0.5 text-text-main">{formatDate(item.installedDate)}</p>
                    </div>
                    <div className="rounded-lg border border-border-subtle bg-bg-elevated/40 px-2.5 py-2">
                      <p className="text-[10px] uppercase tracking-wider text-text-secondary">Odometer</p>
                      <p className="mt-0.5 text-text-main">{formatNumber(item.installedOdometer)} km</p>
                    </div>
                    <div className="rounded-lg border border-border-subtle bg-bg-elevated/40 px-2.5 py-2">
                      <p className="text-[10px] uppercase tracking-wider text-text-secondary">Age</p>
                      <p className="mt-0.5 text-text-main">{item.ageMonths ?? 0} months</p>
                    </div>
                    <div className="rounded-lg border border-border-subtle bg-bg-elevated/40 px-2.5 py-2">
                      <p className="text-[10px] uppercase tracking-wider text-text-secondary">Distance run</p>
                      <p className="mt-0.5 text-text-main">{formatNumber(item.kmRun)} km</p>
                    </div>
                  </div>

                  {item.sizeOrSerial && (
                    <p className="mt-2 text-[11px] text-text-secondary">Size / serial: {item.sizeOrSerial}</p>
                  )}
                  {item.isDue && item.dueReason && (
                    <p className="mt-2 rounded-lg border border-amber-500/25 bg-amber-500/10 px-2.5 py-1.5 text-[11px] text-amber-300">
                      {item.dueReason}
                    </p>
                  )}
                  {item.notes && <p className="mt-2 line-clamp-2 text-xs text-text-secondary/80">{item.notes}</p>}

                  <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-border-subtle pt-3">
                    {item.itemType === 'TYRE' ? (
                      <div className="flex flex-wrap gap-1">
                        <Button size="sm" variant="ghost" onClick={() => logAction(item, 'ROTATE')} icon={<RotateCw className="h-3.5 w-3.5" />}>
                          Rotate
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => logAction(item, 'ALIGN')} icon={<SlidersHorizontal className="h-3.5 w-3.5" />}>
                          Align
                        </Button>
                      </div>
                    ) : (
                      <span className="text-[11px] text-text-secondary">
                        {item.lastRotatedDate ? `Rotated ${formatDate(item.lastRotatedDate)}` : 'Battery record'}
                      </span>
                    )}
                    <div className="flex gap-1">
                      <button onClick={() => openEdit(item)} className="rounded-lg p-1.5 text-text-secondary hover:bg-white/5 hover:text-text-main" aria-label="Edit record">
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <button onClick={() => setDeleting(item)} className="rounded-lg p-1.5 text-text-secondary hover:bg-red-500/10 hover:text-red-300" aria-label="Delete record">
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                  {(item.lastRotatedDate || item.lastAlignedDate) && item.itemType === 'TYRE' && (
                    <p className="mt-2 text-[10px] text-text-secondary/70">
                      {item.lastRotatedDate ? `Last rotation ${formatDate(item.lastRotatedDate)}` : ''}
                      {item.lastRotatedDate && item.lastAlignedDate ? ' · ' : ''}
                      {item.lastAlignedDate ? `Last alignment ${formatDate(item.lastAlignedDate)}` : ''}
                    </p>
                  )}
                </Card>
              ))}
            </div>
          ) : (
            <EmptyState
              icon={<Disc3 className="h-7 w-7" />}
              title="No tyre or battery records"
              description="Add tyres and batteries to track age, mileage and replacement thresholds."
              action={<Button icon={<Plus className="h-4 w-4" />} onClick={() => openCreate('TYRE')}>Add tyre</Button>}
            />
          )}
        </>
      )}

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={editing ? 'Edit tyre or battery' : `Add ${form.itemType === 'TYRE' ? 'tyre' : 'battery'}`}
        description="Age and mileage thresholds power replacement alerts."
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
            <Field label="Item type" required>
              <Select value={form.itemType} onChange={(event) => update('itemType', event.target.value)} disabled={!!editing}>
                <option value="TYRE">Tyre</option>
                <option value="BATTERY">Battery</option>
              </Select>
            </Field>
            <Field label="Brand" required>
              <Input value={form.brand} onChange={(event) => update('brand', event.target.value)} placeholder="MRF / Exide" />
            </Field>
            <Field label="Model" required>
              <Input value={form.model} onChange={(event) => update('model', event.target.value)} placeholder="ZLX / Mileage+" />
            </Field>
            {form.itemType === 'TYRE' && (
              <Field label="Position">
                <Select value={form.position} onChange={(event) => update('position', event.target.value)}>
                  {TYRE_POSITIONS.map((position) => (
                    <option key={position} value={position}>{position}</option>
                  ))}
                </Select>
              </Field>
            )}
            <Field label={form.itemType === 'TYRE' ? 'Size' : 'Serial number'}>
              <Input value={form.sizeOrSerial} onChange={(event) => update('sizeOrSerial', event.target.value)} placeholder={form.itemType === 'TYRE' ? '205/55 R16' : 'BAT-XXXX'} />
            </Field>
            <Field label="Installed date" required>
              <Input type="date" value={form.installedDate} onChange={(event) => update('installedDate', event.target.value)} />
            </Field>
            <Field label="Installed odometer (km)">
              <Input type="number" min={0} value={form.installedOdometer} onChange={(event) => update('installedOdometer', event.target.value)} />
            </Field>
            <Field label="Replace after (months)">
              <Input type="number" min={0} value={form.replacementDueAgeMonths} onChange={(event) => update('replacementDueAgeMonths', event.target.value)} placeholder="e.g. 60" />
            </Field>
            <Field label="Replace after (km)">
              <Input type="number" min={0} value={form.replacementDueKm} onChange={(event) => update('replacementDueKm', event.target.value)} placeholder="e.g. 40000" />
            </Field>
            <Field label="Notes" className="sm:col-span-2">
              <Textarea value={form.notes} onChange={(event) => update('notes', event.target.value)} rows={2} />
            </Field>
          </div>
          {formError && <p className="rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">{formError}</p>}
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button type="button" variant="secondary" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" loading={saving}>{editing ? 'Save changes' : 'Save record'}</Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={!!deleting}
        onCancel={() => setDeleting(null)}
        onConfirm={confirmDelete}
        loading={deleteLoading}
        title="Delete this record?"
        message="The tyre or battery record will be permanently removed."
        confirmLabel="Delete record"
      />
    </div>
  );
}
