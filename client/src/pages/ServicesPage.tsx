import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  CalendarCheck,
  CheckCircle2,
  ClipboardList,
  Clock,
  Plus,
  Trash2,
  Wrench,
} from 'lucide-react';
import { useVehicles } from '../context/VehicleContext';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import { api } from '../lib/api';
import { SERVICE_TYPES } from '../lib/constants';
import { formatCurrency, formatDate, formatNumber, todayInput } from '../lib/format';
import type { ServiceRecord, ServiceReminder, Vehicle } from '../types';
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
  Tabs,
  Textarea,
} from '../components/ui';

interface ServiceForm {
  vehicleId: string;
  serviceDate: string;
  serviceType: string;
  workshopName: string;
  description: string;
  partsReplaced: string;
  cost: string;
  odometer: string;
  nextDueMonths: string;
  nextDueKm: string;
}

const emptyForm = (vehicle?: Vehicle | null): ServiceForm => ({
  vehicleId: vehicle?.id || '',
  serviceDate: todayInput(),
  serviceType: SERVICE_TYPES[0],
  workshopName: '',
  description: '',
  partsReplaced: '',
  cost: '',
  odometer: String(vehicle?.currentOdometer || ''),
  nextDueMonths: '',
  nextDueKm: '',
});

export default function ServicesPage() {
  const { vehicles, activeVehicle, activeVehicleId, refreshVehicles } = useVehicles();
  const { user } = useAuth();
  const { success } = useToast();
  const [services, setServices] = useState<ServiceRecord[]>([]);
  const [reminders, setReminders] = useState<ServiceReminder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tab, setTab] = useState('history');
  const [vehicleFilter, setVehicleFilter] = useState(activeVehicleId || 'ALL');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<ServiceRecord | null>(null);
  const [form, setForm] = useState<ServiceForm>(emptyForm(activeVehicle));
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');
  const [deleting, setDeleting] = useState<ServiceRecord | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const params = {
        vehicleId: vehicleFilter !== 'ALL' ? vehicleFilter : undefined,
        serviceType: typeFilter !== 'ALL' ? typeFilter : undefined,
      };
      const [serviceData, reminderData] = await Promise.all([
        api.get<ServiceRecord[]>('/services', params),
        api.get<ServiceReminder[]>('/services/reminders', params),
      ]);
      setServices(serviceData);
      setReminders(reminderData);
    } catch (err: any) {
      setError(err.message || 'Could not load service records.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [vehicleFilter, typeFilter]);

  useEffect(() => {
    if (activeVehicleId && vehicleFilter === 'ALL') setVehicleFilter(activeVehicleId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeVehicleId]);

  const totalSpend = useMemo(
    () => services.reduce((sum, service) => sum + Number(service.cost || 0), 0),
    [services]
  );

  const openCreate = () => {
    const vehicle = vehicles.find((item) => item.id === vehicleFilter) || activeVehicle || vehicles[0];
    setEditing(null);
    setForm(emptyForm(vehicle));
    setFormError('');
    setFormOpen(true);
  };

  const openEdit = (service: ServiceRecord) => {
    setEditing(service);
    setForm({
      vehicleId: service.vehicleId,
      serviceDate: service.serviceDate?.slice(0, 10) || todayInput(),
      serviceType: service.serviceType,
      workshopName: service.workshopName,
      description: service.description || '',
      partsReplaced: service.partsReplaced || '',
      cost: String(service.cost ?? ''),
      odometer: String(service.odometer ?? ''),
      nextDueMonths: service.nextDueMonths ? String(service.nextDueMonths) : '',
      nextDueKm: service.nextDueKm ? String(service.nextDueKm) : '',
    });
    setFormError('');
    setFormOpen(true);
  };

  const update = (key: keyof ServiceForm, value: string) =>
    setForm((current) => {
      const next = { ...current, [key]: value };
      if (key === 'vehicleId') {
        const vehicle = vehicles.find((item) => item.id === value);
        if (vehicle && !editing) next.odometer = String(vehicle.currentOdometer || '');
      }
      return next;
    });

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setFormError('');
    if (!form.vehicleId || !form.workshopName.trim()) {
      setFormError('Vehicle and workshop name are required.');
      return;
    }
    setSaving(true);
    try {
      const payload = {
        vehicleId: form.vehicleId,
        serviceDate: form.serviceDate,
        serviceType: form.serviceType,
        workshopName: form.workshopName,
        description: form.description,
        partsReplaced: form.partsReplaced || null,
        cost: Number(form.cost) || 0,
        odometer: Number(form.odometer) || 0,
        nextDueMonths: form.nextDueMonths ? Number(form.nextDueMonths) : null,
        nextDueKm: form.nextDueKm ? Number(form.nextDueKm) : null,
      };
      if (editing) {
        await api.put(`/services/${editing.id}`, payload);
        success('Service record updated.');
      } else {
        await api.post('/services', payload);
        success('Service logged and expense synced.');
      }
      await refreshVehicles();
      setFormOpen(false);
      await load();
    } catch (err: any) {
      setFormError(err.message || 'Could not save service record.');
    } finally {
      setSaving(false);
    }
  };

  const completeReminder = async (reminder: ServiceReminder) => {
    try {
      await api.patch(`/services/reminders/${reminder.id}/complete`);
      success('Reminder completed.');
      setReminders((current) => current.filter((item) => item.id !== reminder.id));
    } catch (err: any) {
      setError(err.message || 'Could not complete reminder.');
    }
  };

  const confirmDelete = async () => {
    if (!deleting) return;
    setDeleteLoading(true);
    try {
      await api.delete(`/services/${deleting.id}`);
      success('Service record removed.');
      setDeleting(null);
      await refreshVehicles();
      await load();
    } catch (err: any) {
      setFormError(err.message || 'Could not delete service record.');
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-[1440px]">
      <PageHeader
        title="Service & Maintenance"
        subtitle="Log every workshop visit, track costs and never miss the next interval."
        actions={<Button icon={<Plus className="h-4 w-4" />} onClick={openCreate} disabled={!vehicles.length}>Log service</Button>}
      />

      {!vehicles.length ? (
        <EmptyState
          icon={<Wrench className="h-7 w-7" />}
          title="Add a vehicle first"
          description="Service records are tied to a vehicle in your garage."
          action={<Link to="/garage"><Button>Go to garage</Button></Link>}
        />
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard label="Records" value={formatNumber(services.length)} hint="Matching your filters" icon={<ClipboardList className="h-5 w-5" />} />
            <StatCard label="Service spend" value={formatCurrency(totalSpend, user?.settings?.currency)} hint="Across matching records" icon={<Wrench className="h-5 w-5" />} />
            <StatCard label="Open reminders" value={formatNumber(reminders.length)} hint="Upcoming maintenance" tone={reminders.length ? 'warning' : 'success'} icon={<Clock className="h-5 w-5" />} />
            <StatCard
              label="Last service"
              value={services[0] ? formatDate(services[0].serviceDate) : '—'}
              hint={services[0]?.serviceType || 'No records yet'}
              icon={<CalendarCheck className="h-5 w-5" />}
            />
          </div>

          <div className="mt-5 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <Tabs
              tabs={[
                { key: 'history', label: 'Service history', count: services.length },
                { key: 'reminders', label: 'Reminders', count: reminders.length },
              ]}
              active={tab}
              onChange={setTab}
            />
            <div className="flex flex-col gap-2 sm:flex-row">
              <Select value={vehicleFilter} onChange={(event) => setVehicleFilter(event.target.value)} className="sm:w-52">
                <option value="ALL">All vehicles</option>
                {vehicles.map((vehicle) => (
                  <option key={vehicle.id} value={vehicle.id}>{vehicle.nickname}</option>
                ))}
              </Select>
              <Select value={typeFilter} onChange={(event) => setTypeFilter(event.target.value)} className="sm:w-48">
                <option value="ALL">All service types</option>
                {SERVICE_TYPES.map((type) => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </Select>
            </div>
          </div>

          {error && <div className="mt-4"><ErrorState message={error} onRetry={load} /></div>}

          {loading ? (
            <LoadingBlock label="Loading service records…" />
          ) : tab === 'history' ? (
            <Card className="mt-4">
              {services.length ? (
                <div className="space-y-2">
                  {services.map((service) => (
                    <div
                      key={service.id}
                      className="flex flex-col gap-3 rounded-xl border border-border-subtle bg-bg-elevated/40 p-3.5 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div className="flex min-w-0 items-start gap-3">
                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-yellow/10 text-primary-yellow">
                          <Wrench className="h-4 w-4" />
                        </span>
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="text-sm font-semibold text-text-main">{service.serviceType}</p>
                            <Badge tone="neutral">{service.vehicle?.nickname || 'Vehicle'}</Badge>
                          </div>
                          <p className="mt-0.5 text-xs text-text-secondary">
                            {formatDate(service.serviceDate)} · {service.workshopName} · {formatNumber(service.odometer)} km
                          </p>
                          {service.description && (
                            <p className="mt-1 line-clamp-2 text-xs text-text-secondary/80">{service.description}</p>
                          )}
                          {service.partsReplaced && (
                            <p className="mt-1 text-[11px] text-text-secondary/70">Parts: {service.partsReplaced}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center justify-between gap-2 sm:justify-end">
                        <div className="text-left sm:text-right">
                          <p className="text-sm font-semibold text-text-main">
                            {formatCurrency(service.cost, user?.settings?.currency)}
                          </p>
                          <button
                            onClick={() => openEdit(service)}
                            className="text-[11px] text-primary-yellow hover:text-primary-hover"
                          >
                            Edit record
                          </button>
                        </div>
                        <Button size="icon" variant="ghost" onClick={() => setDeleting(service)} aria-label="Delete service">
                          <Trash2 className="h-4 w-4 text-red-300" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState
                  icon={<Wrench className="h-7 w-7" />}
                  title="No service records"
                  description="Log your first service to start tracking maintenance costs and intervals."
                  action={<Button icon={<Plus className="h-4 w-4" />} onClick={openCreate}>Log service</Button>}
                />
              )}
            </Card>
          ) : (
            <Card className="mt-4">
              {reminders.length ? (
                <div className="space-y-2">
                  {reminders.map((reminder) => (
                    <div key={reminder.id} className="flex flex-col gap-2 rounded-xl border border-border-subtle bg-bg-elevated/40 p-3.5 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="text-sm font-semibold text-text-main">{reminder.title}</p>
                          <Badge tone="warning">{reminder.serviceType}</Badge>
                        </div>
                        <p className="mt-0.5 text-xs text-text-secondary">
                          {reminder.vehicle?.nickname || 'Vehicle'}
                          {reminder.dueDate ? ` · Due ${formatDate(reminder.dueDate)}` : ''}
                          {reminder.dueOdometer ? ` · Due at ${formatNumber(reminder.dueOdometer)} km` : ''}
                        </p>
                      </div>
                      <Button size="sm" variant="secondary" onClick={() => completeReminder(reminder)} icon={<CheckCircle2 className="h-3.5 w-3.5" />}>
                        Mark complete
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState
                  icon={<CalendarCheck className="h-7 w-7" />}
                  title="No open reminders"
                  description="Set next-due intervals when logging a service and the reminder will appear here automatically."
                />
              )}
            </Card>
          )}
        </>
      )}

      <Modal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        title={editing ? 'Edit service record' : 'Log a service'}
        description="Costs are synced to your expense tracker automatically."
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
            <Field label="Service date" required>
              <Input type="date" value={form.serviceDate} onChange={(event) => update('serviceDate', event.target.value)} />
            </Field>
            <Field label="Service type" required>
              <Select value={form.serviceType} onChange={(event) => update('serviceType', event.target.value)}>
                {SERVICE_TYPES.map((type) => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </Select>
            </Field>
            <Field label="Workshop name" required>
              <Input value={form.workshopName} onChange={(event) => update('workshopName', event.target.value)} placeholder="Apex Precision Garage" />
            </Field>
            <Field label="Cost">
              <Input type="number" min={0} step="0.01" value={form.cost} onChange={(event) => update('cost', event.target.value)} placeholder="0" />
            </Field>
            <Field label="Odometer (km)">
              <Input type="number" min={0} value={form.odometer} onChange={(event) => update('odometer', event.target.value)} />
            </Field>
            <Field label="Next due after (months)" hint="Creates a reminder automatically">
              <Input type="number" min={0} value={form.nextDueMonths} onChange={(event) => update('nextDueMonths', event.target.value)} placeholder="e.g. 6" />
            </Field>
            <Field label="Next due after (km)" hint="Creates a reminder automatically">
              <Input type="number" min={0} value={form.nextDueKm} onChange={(event) => update('nextDueKm', event.target.value)} placeholder="e.g. 5000" />
            </Field>
            <Field label="Description" className="sm:col-span-2">
              <Textarea value={form.description} onChange={(event) => update('description', event.target.value)} placeholder="Work performed, observations, recommendations…" rows={3} />
            </Field>
            <Field label="Parts replaced" className="sm:col-span-2">
              <Input value={form.partsReplaced} onChange={(event) => update('partsReplaced', event.target.value)} placeholder="Engine oil, oil filter, air filter…" />
            </Field>
          </div>
          {formError && (
            <p className="rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">{formError}</p>
          )}
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button type="button" variant="secondary" onClick={() => setFormOpen(false)}>Cancel</Button>
            <Button type="submit" loading={saving} icon={<CheckCircle2 className="h-4 w-4" />}>
              {editing ? 'Save changes' : 'Log service'}
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={!!deleting}
        onCancel={() => setDeleting(null)}
        onConfirm={confirmDelete}
        loading={deleteLoading}
        title="Delete service record?"
        message="The service record and its linked expense will be removed. This cannot be undone."
        confirmLabel="Delete record"
      />
    </div>
  );
}
