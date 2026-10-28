import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  CalendarDays,
  CalendarPlus,
  CheckCircle2,
  Clock,
  RefreshCw,
  Trash2,
} from 'lucide-react';
import { useVehicles } from '../context/VehicleContext';
import { useToast } from '../context/ToastContext';
import { api } from '../lib/api';
import { CARE_TYPES, RECURRENCES } from '../lib/constants';
import { formatDate, todayInput } from '../lib/format';
import type { CareSchedule } from '../types';
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

interface CareForm {
  vehicleId: string;
  title: string;
  careType: string;
  scheduledDate: string;
  recurrence: string;
  notes: string;
}

const emptyForm = (vehicleId = ''): CareForm => ({
  vehicleId,
  title: '',
  careType: 'WASH',
  scheduledDate: todayInput(),
  recurrence: 'NONE',
  notes: '',
});

export default function CalendarPage() {
  const { vehicles, activeVehicleId } = useVehicles();
  const { success } = useToast();
  const [schedules, setSchedules] = useState<CareSchedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tab, setTab] = useState('upcoming');
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<CareForm>(emptyForm());
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');
  const [rescheduling, setRescheduling] = useState<CareSchedule | null>(null);
  const [newDate, setNewDate] = useState(todayInput());
  const [rescheduleLoading, setRescheduleLoading] = useState(false);
  const [deleting, setDeleting] = useState<CareSchedule | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await api.get<CareSchedule[]>('/care');
      setSchedules(data);
    } catch (err: any) {
      setError(err.message || 'Could not load care schedule.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const upcoming = useMemo(
    () => schedules.filter((item) => !item.isCompleted),
    [schedules]
  );
  const completed = useMemo(
    () => schedules.filter((item) => item.isCompleted),
    [schedules]
  );
  const overdue = upcoming.filter((item) => item.isOverdue);

  const openCreate = () => {
    setForm(emptyForm(activeVehicleId || vehicles[0]?.id || ''));
    setFormError('');
    setOpen(true);
  };

  const update = (key: keyof CareForm, value: string) =>
    setForm((current) => ({ ...current, [key]: value }));

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setFormError('');
    if (!form.title.trim()) {
      setFormError('Give this care task a title.');
      return;
    }
    setSaving(true);
    try {
      await api.post('/care', {
        ...form,
        vehicleId: form.vehicleId || null,
      });
      success('Care task scheduled.');
      setOpen(false);
      await load();
    } catch (err: any) {
      setFormError(err.message || 'Could not create care task.');
    } finally {
      setSaving(false);
    }
  };

  const complete = async (schedule: CareSchedule) => {
    try {
      await api.patch(`/care/${schedule.id}/complete`);
      success(schedule.recurrence !== 'NONE' ? 'Task completed. Next occurrence scheduled.' : 'Task completed.');
      await load();
    } catch (err: any) {
      setError(err.message || 'Could not complete task.');
    }
  };

  const openReschedule = (schedule: CareSchedule) => {
    setRescheduling(schedule);
    setNewDate(schedule.scheduledDate?.slice(0, 10) || todayInput());
  };

  const reschedule = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!rescheduling) return;
    setRescheduleLoading(true);
    try {
      await api.patch(`/care/${rescheduling.id}/reschedule`, { scheduledDate: newDate });
      success('Task rescheduled.');
      setRescheduling(null);
      await load();
    } catch (err: any) {
      setError(err.message || 'Could not reschedule task.');
    } finally {
      setRescheduleLoading(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleting) return;
    setDeleteLoading(true);
    try {
      await api.delete(`/care/${deleting.id}`);
      success('Care task deleted.');
      setDeleting(null);
      await load();
    } catch (err: any) {
      setError(err.message || 'Could not delete task.');
    } finally {
      setDeleteLoading(false);
    }
  };

  const renderTask = (schedule: CareSchedule) => (
    <div
      key={schedule.id}
      className={`rounded-xl border p-3.5 ${
        schedule.isOverdue
          ? 'border-amber-500/30 bg-amber-500/5'
          : schedule.isCompleted
          ? 'border-border-subtle bg-bg-elevated/20 opacity-75'
          : 'border-border-subtle bg-bg-elevated/40'
      }`}
    >
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <p className={`text-sm font-semibold ${schedule.isCompleted ? 'text-text-secondary line-through' : 'text-text-main'}`}>
              {schedule.title}
            </p>
            <Badge tone={schedule.isOverdue ? 'warning' : schedule.isCompleted ? 'success' : 'yellow'}>
              {schedule.isOverdue ? 'Overdue' : schedule.isCompleted ? 'Completed' : 'Scheduled'}
            </Badge>
            <Badge tone="neutral">{schedule.careType.replace('_', ' ')}</Badge>
          </div>
          <p className="mt-1 flex flex-wrap items-center gap-2 text-[11px] text-text-secondary">
            <span className="flex items-center gap-1"><CalendarDays className="h-3 w-3" /> {formatDate(schedule.scheduledDate)}</span>
            {schedule.vehicle?.nickname && <span>· {schedule.vehicle.nickname}</span>}
            {schedule.recurrence !== 'NONE' && (
              <span className="flex items-center gap-1"><RefreshCw className="h-3 w-3" /> {schedule.recurrence.toLowerCase()}</span>
            )}
          </p>
          {schedule.notes && <p className="mt-1.5 text-xs text-text-secondary/80">{schedule.notes}</p>}
        </div>
        <div className="flex shrink-0 flex-wrap gap-1.5">
          {!schedule.isCompleted && (
            <>
              <Button size="sm" variant="secondary" onClick={() => complete(schedule)} icon={<CheckCircle2 className="h-3.5 w-3.5" />}>
                Complete
              </Button>
              <Button size="sm" variant="ghost" onClick={() => openReschedule(schedule)} icon={<Clock className="h-3.5 w-3.5" />}>
                Reschedule
              </Button>
            </>
          )}
          <button onClick={() => setDeleting(schedule)} className="rounded-lg p-2 text-text-secondary hover:bg-red-500/10 hover:text-red-300" aria-label="Delete task">
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="mx-auto w-full max-w-5xl">
      <PageHeader
        title="Care Calendar"
        subtitle="Schedule washes, detailing, fluid checks and inspections with optional recurrence."
        actions={<Button icon={<CalendarPlus className="h-4 w-4" />} onClick={openCreate}>Schedule care</Button>}
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Upcoming" value={upcoming.length} hint="Open care tasks" icon={<CalendarDays className="h-5 w-5" />} />
        <StatCard label="Overdue" value={overdue.length} hint="Past scheduled date" tone={overdue.length ? 'warning' : 'success'} icon={<Clock className="h-5 w-5" />} />
        <StatCard label="Completed" value={completed.length} hint="All-time completed tasks" tone="success" icon={<CheckCircle2 className="h-5 w-5" />} />
      </div>

      <div className="mt-5">
        <Tabs
          tabs={[
            { key: 'upcoming', label: 'Upcoming', count: upcoming.length },
            { key: 'completed', label: 'Completed', count: completed.length },
          ]}
          active={tab}
          onChange={setTab}
        />
      </div>

      {error && <div className="mt-4"><ErrorState message={error} onRetry={load} /></div>}

      {loading ? (
        <LoadingBlock label="Loading care calendar…" />
      ) : (
        <Card className="mt-4">
          <CardHeader
            title={tab === 'upcoming' ? 'Upcoming care' : 'Completed care'}
            subtitle={
              tab === 'upcoming'
                ? 'Sorted by scheduled date. Completing a recurring task creates the next one automatically.'
                : 'History of completed care tasks.'
            }
          />
          {(tab === 'upcoming' ? upcoming : completed).length ? (
            <div className="space-y-2">
              {(tab === 'upcoming' ? upcoming : completed).map(renderTask)}
            </div>
          ) : (
            <EmptyState
              icon={<CalendarDays className="h-7 w-7" />}
              title={tab === 'upcoming' ? 'No upcoming care tasks' : 'No completed tasks yet'}
              description={
                tab === 'upcoming'
                  ? 'Schedule a wash, detailing session or inspection to keep your vehicle in shape.'
                  : 'Completed tasks will appear here.'
              }
              action={tab === 'upcoming' ? <Button icon={<CalendarPlus className="h-4 w-4" />} onClick={openCreate}>Schedule care</Button> : undefined}
            />
          )}
        </Card>
      )}

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Schedule care"
        description="Set a one-off task or a recurring routine."
      >
        <form onSubmit={submit} className="space-y-4">
          <Field label="Title" required>
            <Input value={form.title} onChange={(event) => update('title', event.target.value)} placeholder="Weekly foam wash" autoFocus />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Care type">
              <Select value={form.careType} onChange={(event) => update('careType', event.target.value)}>
                {CARE_TYPES.map((type) => (
                  <option key={type} value={type}>{type.replace('_', ' ')}</option>
                ))}
              </Select>
            </Field>
            <Field label="Vehicle">
              <Select value={form.vehicleId} onChange={(event) => update('vehicleId', event.target.value)}>
                <option value="">General (no vehicle)</option>
                {vehicles.map((vehicle) => (
                  <option key={vehicle.id} value={vehicle.id}>{vehicle.nickname}</option>
                ))}
              </Select>
            </Field>
            <Field label="Scheduled date" required>
              <Input type="date" value={form.scheduledDate} onChange={(event) => update('scheduledDate', event.target.value)} />
            </Field>
            <Field label="Repeat">
              <Select value={form.recurrence} onChange={(event) => update('recurrence', event.target.value)}>
                {RECURRENCES.map((recurrence) => (
                  <option key={recurrence} value={recurrence}>{recurrence === 'NONE' ? 'One-time' : recurrence.toLowerCase()}</option>
                ))}
              </Select>
            </Field>
          </div>
          <Field label="Notes">
            <Textarea value={form.notes} onChange={(event) => update('notes', event.target.value)} rows={2} placeholder="Products, location, special instructions…" />
          </Field>
          {formError && <p className="rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">{formError}</p>}
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button type="button" variant="secondary" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" loading={saving}>Schedule task</Button>
          </div>
        </form>
      </Modal>

      <Modal
        open={!!rescheduling}
        onClose={() => setRescheduling(null)}
        title="Reschedule care task"
        description={rescheduling?.title}
        size="sm"
      >
        <form onSubmit={reschedule} className="space-y-4">
          <Field label="New date" required>
            <Input type="date" value={newDate} onChange={(event) => setNewDate(event.target.value)} />
          </Field>
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button type="button" variant="secondary" onClick={() => setRescheduling(null)}>Cancel</Button>
            <Button type="submit" loading={rescheduleLoading}>Update date</Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={!!deleting}
        onCancel={() => setDeleting(null)}
        onConfirm={confirmDelete}
        loading={deleteLoading}
        title="Delete care task?"
        message="The task will be removed from your calendar. Future recurring occurrences already created are not affected."
        confirmLabel="Delete task"
      />
    </div>
  );
}
