import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Car,
  Check,
  ChevronRight,
  Gauge,
  ImagePlus,
  Pencil,
  Plus,
  Search,
  Star,
  Trash2,
  Wrench,
} from 'lucide-react';
import { useVehicles } from '../context/VehicleContext';
import { useToast } from '../context/ToastContext';
import { api, uploadVehiclePhoto } from '../lib/api';
import { FUEL_TYPES, VEHICLE_TYPES } from '../lib/constants';
import { formatDate, formatNumber, getExpiryInfo } from '../lib/format';
import type { Vehicle } from '../types';
import {
  Badge,
  Button,
  ConfirmDialog,
  EmptyState,
  Field,
  Input,
  LoadingBlock,
  Modal,
  PageHeader,
  SearchInput,
  Select,
  Textarea,
} from '../components/ui';

interface VehicleForm {
  nickname: string;
  make: string;
  model: string;
  year: string;
  registrationNumber: string;
  vehicleType: string;
  fuelType: string;
  photo: string;
  notes: string;
}

const emptyForm = (): VehicleForm => ({
  nickname: '',
  make: '',
  model: '',
  year: String(new Date().getFullYear()),
  registrationNumber: '',
  vehicleType: 'Car',
  fuelType: 'Petrol',
  photo: '',
  notes: '',
});

export default function GaragePage() {
  const { vehicles, loading, refreshVehicles, activeVehicleId, setActiveVehicleId } = useVehicles();
  const { success } = useToast();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Vehicle | null>(null);
  const [form, setForm] = useState<VehicleForm>(emptyForm());
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [formError, setFormError] = useState('');
  const [deleting, setDeleting] = useState<Vehicle | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return vehicles.filter((vehicle) => {
      const matchesType = typeFilter === 'ALL' || vehicle.vehicleType === typeFilter;
      const matchesTerm =
        !term ||
        [vehicle.nickname, vehicle.make, vehicle.model, vehicle.registrationNumber]
          .join(' ')
          .toLowerCase()
          .includes(term);
      return matchesType && matchesTerm;
    });
  }, [vehicles, search, typeFilter]);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm());
    setFormError('');
    setFormOpen(true);
  };

  const openEdit = (vehicle: Vehicle) => {
    setEditing(vehicle);
    setForm({
      nickname: vehicle.nickname || '',
      make: vehicle.make || '',
      model: vehicle.model || '',
      year: String(vehicle.year || ''),
      registrationNumber: vehicle.registrationNumber || '',
      vehicleType: vehicle.vehicleType || 'Car',
      fuelType: vehicle.fuelType || 'Petrol',
      photo: vehicle.photo || '',
      notes: vehicle.notes || '',
    });
    setFormError('');
    setFormOpen(true);
  };

  const update = (key: keyof VehicleForm, value: string) =>
    setForm((current) => ({ ...current, [key]: value }));

  const handlePhoto = async (file?: File) => {
    if (!file) return;
    setUploading(true);
    setFormError('');
    try {
      const url = await uploadVehiclePhoto(file);
      update('photo', url);
      success('Photo uploaded.');
    } catch (err: any) {
      setFormError(err.message || 'Photo upload failed.');
    } finally {
      setUploading(false);
    }
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setFormError('');
    if (!form.nickname.trim() || !form.make.trim() || !form.model.trim()) {
      setFormError('Nickname, make and model are required.');
      return;
    }
    if (!form.registrationNumber.trim()) {
      setFormError('Registration number is required.');
      return;
    }
    setSaving(true);
    try {
      const payload = {
        nickname: form.nickname.trim(),
        make: form.make.trim(),
        model: form.model.trim(),
        year: Number(form.year) || new Date().getFullYear(),
        registrationNumber: form.registrationNumber.trim().toUpperCase(),
        vehicleType: form.vehicleType,
        fuelType: form.fuelType,
        photo: form.photo || null,
        notes: form.notes.trim() || null,
      };
      if (editing) {
        await api.put(`/vehicles/${editing.id}`, payload);
        success('Vehicle updated.');
      } else {
        const created = await api.post<Vehicle>('/vehicles', payload);
        success('Vehicle added to your garage.');
        if (created?.id) setActiveVehicleId(created.id);
      }
      await refreshVehicles();
      setFormOpen(false);
    } catch (err: any) {
      setFormError(err.message || 'Could not save vehicle.');
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleting) return;
    setDeleteLoading(true);
    try {
      await api.delete(`/vehicles/${deleting.id}`);
      success('Vehicle deleted along with its records.');
      await refreshVehicles();
      setDeleting(null);
    } catch (err: any) {
      setFormError(err.message || 'Could not delete vehicle.');
    } finally {
      setDeleteLoading(false);
    }
  };

  if (loading) return <LoadingBlock label="Loading your garage…" />;

  return (
    <div className="mx-auto w-full max-w-[1440px]">
      <PageHeader
        title="My Garage"
        subtitle="Manage every vehicle, its photo and active status in one place."
        actions={<Button icon={<Plus className="h-4 w-4" />} onClick={openCreate}>Add vehicle</Button>}
      />

      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="w-full sm:max-w-sm">
          <SearchInput value={search} onChange={setSearch} placeholder="Search nickname, model or registration…" />
        </div>
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {['ALL', ...VEHICLE_TYPES].map((type) => (
            <button
              key={type}
              onClick={() => setTypeFilter(type)}
              className={`whitespace-nowrap rounded-full border px-3 py-1.5 text-xs font-medium transition ${
                typeFilter === type
                  ? 'border-primary-yellow/40 bg-primary-yellow/10 text-primary-yellow'
                  : 'border-border-subtle bg-bg-card text-text-secondary hover:text-text-main'
              }`}
            >
              {type === 'ALL' ? 'All vehicles' : type}
            </button>
          ))}
        </div>
      </div>

      {vehicles.length === 0 ? (
        <EmptyState
          icon={<Car className="h-7 w-7" />}
          title="No vehicles yet"
          description="Add a car, bike or scooter to start tracking services, insurance, fuel and documents."
          action={<Button icon={<Plus className="h-4 w-4" />} onClick={openCreate}>Add your first vehicle</Button>}
        />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={<Search className="h-7 w-7" />}
          title="No matching vehicles"
          description="Try a different search term or vehicle type."
          action={<Button variant="secondary" onClick={() => { setSearch(''); setTypeFilter('ALL'); }}>Clear filters</Button>}
        />
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((vehicle) => {
            const isActive = vehicle.id === activeVehicleId;
            const insuranceInfo = vehicle.activeInsurance
              ? getExpiryInfo(vehicle.activeInsurance.expiryDate)
              : null;
            return (
              <div
                key={vehicle.id}
                className={`group relative overflow-hidden rounded-card border bg-bg-card shadow-[0_18px_50px_rgba(0,0,0,0.25)] ${
                  isActive ? 'border-primary-yellow/40 ring-1 ring-primary-yellow/30' : 'border-border-subtle'
                }`}
              >
                <div className="relative h-44 overflow-hidden bg-gradient-to-br from-bg-elevated to-bg-main">
                  {vehicle.photo ? (
                    <img
                      src={vehicle.photo}
                      alt={`${vehicle.make} ${vehicle.model}`}
                      className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.04]"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-primary-yellow/30">
                      <Car className="h-16 w-16" />
                    </div>
                  )}
                  <div className="absolute inset-x-0 top-0 flex items-start justify-between gap-2 bg-gradient-to-b from-black/60 to-transparent p-3">
                    <div className="flex flex-wrap gap-1.5">
                      <Badge tone="yellow">{vehicle.vehicleType}</Badge>
                      <Badge tone="neutral">{vehicle.fuelType}</Badge>
                      {isActive && <Badge tone="success">Active</Badge>}
                    </div>
                    <div className="flex gap-1">
                      <button
                        onClick={() => openEdit(vehicle)}
                        className="rounded-lg border border-white/15 bg-black/40 p-1.5 text-text-main backdrop-blur transition hover:border-primary-yellow/40 hover:text-primary-yellow"
                        aria-label="Edit vehicle"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => setDeleting(vehicle)}
                        className="rounded-lg border border-white/15 bg-black/40 p-1.5 text-text-main backdrop-blur transition hover:border-red-400/40 hover:text-red-300"
                        aria-label="Delete vehicle"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-3 pt-8">
                    <p className="font-display text-lg font-semibold text-white">{vehicle.nickname}</p>
                    <p className="text-xs text-white/70">
                      {vehicle.make} {vehicle.model} · {vehicle.year}
                    </p>
                  </div>
                </div>

                <div className="p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="rounded-md border border-border-subtle bg-bg-elevated px-2 py-1 text-[11px] font-semibold tracking-wider text-text-main">
                      {vehicle.registrationNumber}
                    </span>
                    <span className="flex items-center gap-1.5 text-xs text-text-secondary">
                      <Gauge className="h-3.5 w-3.5" /> {formatNumber(vehicle.currentOdometer)} km
                    </span>
                  </div>

                  <div className="mt-3 grid grid-cols-2 gap-2">
                    <div className="rounded-lg border border-border-subtle bg-bg-elevated/40 px-2.5 py-2">
                      <p className="text-[10px] uppercase tracking-wider text-text-secondary">Insurance</p>
                      <p className={`mt-0.5 text-xs font-medium ${
                        !insuranceInfo
                          ? 'text-text-secondary'
                          : insuranceInfo.tone === 'danger'
                          ? 'text-red-300'
                          : insuranceInfo.tone === 'warning'
                          ? 'text-amber-300'
                          : 'text-emerald-300'
                      }`}>
                        {insuranceInfo ? insuranceInfo.label : 'Not tracked'}
                      </p>
                    </div>
                    <div className="rounded-lg border border-border-subtle bg-bg-elevated/40 px-2.5 py-2">
                      <p className="text-[10px] uppercase tracking-wider text-text-secondary">Last service</p>
                      <p className="mt-0.5 text-xs font-medium text-text-main">
                        {vehicle.latestService ? formatDate(vehicle.latestService.serviceDate) : 'No record'}
                      </p>
                    </div>
                  </div>

                  <div className="mt-3 flex items-center justify-between gap-2 border-t border-border-subtle pt-3">
                    <div className="flex gap-1.5">
                      <span className="flex items-center gap-1 text-[11px] text-text-secondary">
                        <Wrench className="h-3 w-3" /> {vehicle.pendingRemindersCount || 0}
                      </span>
                      <span className="flex items-center gap-1 text-[11px] text-text-secondary">
                        <Star className="h-3 w-3" /> {vehicle.expiredDocsCount || 0} expired
                      </span>
                    </div>
                    <div className="flex gap-1.5">
                      {!isActive && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setActiveVehicleId(vehicle.id)}
                          icon={<Check className="h-3.5 w-3.5" />}
                        >
                          Set active
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => navigate(`/garage/${vehicle.id}`)}
                        icon={<ChevronRight className="h-3.5 w-3.5" />}
                      >
                        Open
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Modal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        title={editing ? 'Edit vehicle' : 'Add a vehicle'}
        description={
          editing
            ? 'Update the vehicle profile details.'
            : 'Keep the basics accurate — reminders and reports build on this data.'
        }
        size="lg"
      >
        <form onSubmit={submit} className="space-y-4">
          <div className="flex flex-col gap-4 sm:flex-row">
            <div className="relative h-32 w-full shrink-0 overflow-hidden rounded-xl border border-border-subtle bg-bg-elevated sm:w-48">
              {form.photo ? (
                <img src={form.photo} alt="Vehicle preview" className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full flex-col items-center justify-center gap-1 text-text-secondary">
                  <ImagePlus className="h-7 w-7" />
                  <span className="text-[11px]">No photo yet</span>
                </div>
              )}
              {uploading && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/60 text-xs text-white">
                  Uploading…
                </div>
              )}
            </div>
            <div className="flex-1 space-y-2">
              <Field label="Vehicle photo" hint="JPG, PNG or WEBP up to 5 MB">
                <Input
                  type="file"
                  accept="image/*"
                  onChange={(event) => handlePhoto(event.target.files?.[0])}
                  disabled={uploading}
                />
              </Field>
              {form.photo && (
                <button
                  type="button"
                  onClick={() => update('photo', '')}
                  className="text-xs text-text-secondary hover:text-red-300"
                >
                  Remove photo
                </button>
              )}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Nickname" required>
              <Input
                value={form.nickname}
                onChange={(event) => update('nickname', event.target.value)}
                placeholder="e.g. Blue Beast"
                autoFocus
              />
            </Field>
            <Field label="Registration number" required>
              <Input
                value={form.registrationNumber}
                onChange={(event) => update('registrationNumber', event.target.value.toUpperCase())}
                placeholder="KA 01 AB 1234"
              />
            </Field>
            <Field label="Make" required>
              <Input value={form.make} onChange={(event) => update('make', event.target.value)} placeholder="Hyundai" />
            </Field>
            <Field label="Model" required>
              <Input value={form.model} onChange={(event) => update('model', event.target.value)} placeholder="Creta SX" />
            </Field>
            <Field label="Year">
              <Input
                type="number"
                min={1950}
                max={new Date().getFullYear() + 1}
                value={form.year}
                onChange={(event) => update('year', event.target.value)}
              />
            </Field>
            <Field label="Vehicle type">
              <Select value={form.vehicleType} onChange={(event) => update('vehicleType', event.target.value)}>
                {VEHICLE_TYPES.map((type) => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </Select>
            </Field>
            <Field label="Fuel type">
              <Select value={form.fuelType} onChange={(event) => update('fuelType', event.target.value)}>
                {FUEL_TYPES.map((type) => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </Select>
            </Field>
            <Field label="Notes" className="sm:col-span-2">
              <Textarea
                value={form.notes}
                onChange={(event) => update('notes', event.target.value)}
                placeholder="Colour, variant, parking location, anything useful…"
                rows={3}
              />
            </Field>
          </div>

          {formError && (
            <p className="rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">
              {formError}
            </p>
          )}

          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button type="button" variant="secondary" onClick={() => setFormOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" loading={saving} icon={<Check className="h-4 w-4" />}>
              {editing ? 'Save changes' : 'Add vehicle'}
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={!!deleting}
        onCancel={() => setDeleting(null)}
        onConfirm={confirmDelete}
        loading={deleteLoading}
        title={`Delete ${deleting?.nickname || 'vehicle'}?`}
        message="This permanently removes the vehicle and all related services, documents, insurance, fuel logs and expenses. This cannot be undone."
        confirmLabel="Delete vehicle"
      />
    </div>
  );
}
