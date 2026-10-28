import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Gauge, Plus, ShieldAlert, Trash2, TrendingUp } from 'lucide-react';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { useVehicles } from '../context/VehicleContext';
import { useToast } from '../context/ToastContext';
import { api } from '../lib/api';
import { capitalise, formatDate, formatNumber, todayInput } from '../lib/format';
import type { OdometerReading } from '../types';
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
  Toggle,
} from '../components/ui';

interface OdometerResponse {
  vehicle: { id: string; nickname: string; currentOdometer: number; make: string; model: string };
  readings: OdometerReading[];
  stats: { totalReadings: number; currentOdometer: number; avgDailyKm: number; estimatedMonthlyKm: number };
}

export default function OdometerPage() {
  const { vehicles, activeVehicleId, activeVehicle, refreshVehicles } = useVehicles();
  const { success } = useToast();
  const [vehicleId, setVehicleId] = useState(activeVehicleId || '');
  const [data, setData] = useState<OdometerResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [open, setOpen] = useState(false);
  const [reading, setReading] = useState('');
  const [readingDate, setReadingDate] = useState(todayInput());
  const [isCorrection, setIsCorrection] = useState(false);
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');
  const [deleting, setDeleting] = useState<OdometerReading | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    if (!vehicleId && activeVehicleId) setVehicleId(activeVehicleId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeVehicleId]);

  const load = async () => {
    if (!vehicleId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError('');
    try {
      const result = await api.get<OdometerResponse>('/odometer', { vehicleId });
      setData(result);
    } catch (err: any) {
      setError(err.message || 'Could not load odometer readings.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [vehicleId]);

  const chartData = useMemo(() => {
    if (!data) return [];
    return [...data.readings]
      .reverse()
      .map((item) => ({
        date: new Date(item.readingDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }),
        reading: item.reading,
      }));
  }, [data]);

  const openForm = () => {
    setReading(String(data?.stats.currentOdometer || activeVehicle?.currentOdometer || ''));
    setReadingDate(todayInput());
    setIsCorrection(false);
    setNotes('');
    setFormError('');
    setOpen(true);
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setFormError('');
    if (!vehicleId || !reading) {
      setFormError('Select a vehicle and enter a reading.');
      return;
    }
    setSaving(true);
    try {
      await api.post('/odometer', {
        vehicleId,
        reading: Number(reading),
        readingDate,
        isCorrection,
        notes,
      });
      success('Odometer reading recorded.');
      setOpen(false);
      await refreshVehicles();
      await load();
    } catch (err: any) {
      setFormError(err.message || 'Could not save reading.');
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleting) return;
    setDeleteLoading(true);
    try {
      await api.delete(`/odometer/${deleting.id}`);
      success('Reading deleted.');
      setDeleting(null);
      await refreshVehicles();
      await load();
    } catch (err: any) {
      setError(err.message || 'Could not delete reading.');
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-[1440px]">
      <PageHeader
        title="Odometer"
        subtitle="Track mileage over time, spot usage trends and keep every record accurate."
        actions={
          <Button icon={<Plus className="h-4 w-4" />} onClick={openForm} disabled={!vehicles.length}>
            Record reading
          </Button>
        }
      />

      {!vehicles.length ? (
        <EmptyState
          icon={<Gauge className="h-7 w-7" />}
          title="No vehicle in your garage"
          description="Add a vehicle before recording odometer readings."
          action={<Link to="/garage"><Button>Add vehicle</Button></Link>}
        />
      ) : (
        <>
          <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <Select value={vehicleId} onChange={(event) => setVehicleId(event.target.value)} className="sm:w-64">
              {vehicles.map((vehicle) => (
                <option key={vehicle.id} value={vehicle.id}>{vehicle.nickname} · {vehicle.registrationNumber}</option>
              ))}
            </Select>
            {data && (
              <p className="text-xs text-text-secondary">
                Latest reading {formatNumber(data.stats.currentOdometer)} km
              </p>
            )}
          </div>

          {error && <div className="mb-4"><ErrorState message={error} onRetry={load} /></div>}

          {loading ? (
            <LoadingBlock label="Loading odometer history…" />
          ) : data ? (
            <>
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <StatCard label="Current odometer" value={`${formatNumber(data.stats.currentOdometer)} km`} hint={data.vehicle.nickname} icon={<Gauge className="h-5 w-5" />} />
                <StatCard label="Average daily" value={`${data.stats.avgDailyKm} km`} hint="Between first and latest reading" icon={<TrendingUp className="h-5 w-5" />} />
                <StatCard label="Estimated monthly" value={`${formatNumber(data.stats.estimatedMonthlyKm)} km`} hint="Projected from daily average" />
                <StatCard label="Total readings" value={formatNumber(data.stats.totalReadings)} hint="All recorded entries" />
              </div>

              <div className="mt-5 grid gap-5 lg:grid-cols-[1.5fr_1fr]">
                <Card>
                  <CardHeader title="Mileage trend" subtitle="Recorded readings over time" />
                  {chartData.length >= 2 ? (
                    <div className="h-72">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={chartData}>
                          <defs>
                            <linearGradient id="odoFill" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="#FFD400" stopOpacity={0.3} />
                              <stop offset="100%" stopColor="#FFD400" stopOpacity={0} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid stroke="#292D35" strokeDasharray="4 4" vertical={false} />
                          <XAxis dataKey="date" tick={{ fill: '#A0A5AF', fontSize: 11 }} axisLine={false} tickLine={false} />
                          <YAxis tick={{ fill: '#A0A5AF', fontSize: 11 }} axisLine={false} tickLine={false} width={56} tickFormatter={(value) => `${Math.round(Number(value) / 1000)}k`} />
                          <Tooltip
                            contentStyle={{ backgroundColor: '#14161B', border: '1px solid #292D35', borderRadius: 12, color: '#F5F5F5', fontSize: 12 }}
                            labelStyle={{ color: '#A0A5AF' }}
                            formatter={(value) => [`${formatNumber(Number(value))} km`, 'Odometer']}
                          />
                          <Area type="monotone" dataKey="reading" stroke="#FFD400" strokeWidth={2} fill="url(#odoFill)" />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  ) : (
                    <p className="py-16 text-center text-sm text-text-secondary">
                      Add at least two readings to see your mileage trend.
                    </p>
                  )}
                </Card>

                <Card>
                  <CardHeader title="Recent readings" subtitle="Newest first" action={<Badge tone="yellow">{data.readings.length}</Badge>} />
                  <div className="max-h-80 space-y-2 overflow-y-auto pr-1">
                    {data.readings.slice(0, 20).map((item) => (
                      <div key={item.id} className="flex items-center justify-between gap-2 rounded-xl border border-border-subtle bg-bg-elevated/40 px-3 py-2.5">
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-text-main">{formatNumber(item.reading)} km</p>
                          <p className="text-[11px] text-text-secondary">
                            {formatDate(item.readingDate)} · {capitalise(item.source)}
                          </p>
                          {item.notes && <p className="mt-0.5 truncate text-[11px] text-text-secondary/70">{item.notes}</p>}
                        </div>
                        <div className="flex shrink-0 items-center gap-1.5">
                          {item.isCorrection && <Badge tone="warning">Correction</Badge>}
                          <button
                            onClick={() => setDeleting(item)}
                            className="rounded-lg p-1.5 text-text-secondary transition hover:bg-red-500/10 hover:text-red-300"
                            aria-label="Delete reading"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                    {!data.readings.length && (
                      <p className="py-8 text-center text-sm text-text-secondary">No readings recorded yet.</p>
                    )}
                  </div>
                </Card>
              </div>
            </>
          ) : null}
        </>
      )}

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Record odometer reading"
        description="Readings lower than your highest value need a correction confirmation."
      >
        <form onSubmit={submit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Reading (km)" required>
              <Input type="number" min={0} value={reading} onChange={(event) => setReading(event.target.value)} autoFocus />
            </Field>
            <Field label="Reading date" required>
              <Input type="date" value={readingDate} onChange={(event) => setReadingDate(event.target.value)} />
            </Field>
          </div>
          <Toggle
            checked={isCorrection}
            onChange={setIsCorrection}
            label="Confirm reading correction"
            description="Enable if the odometer was reset or the reading is intentionally lower."
          />
          <Field label="Notes">
            <Textarea value={notes} onChange={(event) => setNotes(event.target.value)} placeholder="Optional context for this reading…" rows={2} />
          </Field>
          {formError && (
            <p className="flex items-start gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">
              <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0" /> {formError}
            </p>
          )}
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button type="button" variant="secondary" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" loading={saving}>Save reading</Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={!!deleting}
        onCancel={() => setDeleting(null)}
        onConfirm={confirmDelete}
        loading={deleteLoading}
        title="Delete this reading?"
        message="The vehicle odometer will be recalculated from the highest remaining reading."
        confirmLabel="Delete reading"
      />
    </div>
  );
}
