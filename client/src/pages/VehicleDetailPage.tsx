import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  AlertTriangle,
  ArrowLeft,
  BatteryCharging,
  CalendarClock,
  Car,
  ChevronRight,
  CircleDollarSign,
  Download,
  FileText,
  Fuel,
  Gauge,
  Pencil,
  ShieldCheck,
  Star,
  Wrench,
} from 'lucide-react';
import { useVehicles } from '../context/VehicleContext';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import { api } from '../lib/api';
import {
  capitalise,
  formatCurrency,
  formatDate,
  formatNumber,
  getExpiryInfo,
} from '../lib/format';
import type { Vehicle } from '../types';
import {
  Badge,
  Button,
  Card,
  CardHeader,
  ErrorState,
  InfoRow,
  LoadingBlock,
  StatCard,
  Tabs,
} from '../components/ui';

const tabs = [
  { key: 'overview', label: 'Overview' },
  { key: 'services', label: 'Services' },
  { key: 'odometer', label: 'Odometer' },
  { key: 'documents', label: 'Documents' },
  { key: 'insurance', label: 'Insurance' },
  { key: 'fuel', label: 'Fuel' },
  { key: 'expenses', label: 'Expenses' },
  { key: 'care', label: 'Tyres & care' },
];

function TableShell({ headers, children }: { headers: string[]; children: React.ReactNode }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[560px] text-left text-sm">
        <thead>
          <tr className="border-b border-border-subtle">
            {headers.map((header) => (
              <th
                key={header}
                className="pb-2 pr-4 text-[10px] font-semibold uppercase tracking-[0.12em] text-text-secondary last:pr-0"
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-border-subtle/60">{children}</tbody>
      </table>
    </div>
  );
}

export default function VehicleDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { success } = useToast();
  const { user } = useAuth();
  const { activeVehicleId, setActiveVehicleId } = useVehicles();
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tab, setTab] = useState('overview');

  const load = async () => {
    if (!id) return;
    setLoading(true);
    setError('');
    try {
      const data = await api.get<Vehicle>(`/vehicles/${id}`);
      setVehicle(data);
    } catch (err: any) {
      setError(err.message || 'Could not load this vehicle.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const totals = useMemo(() => {
    if (!vehicle) return { service: 0, fuel: 0, expenses: 0 };
    return {
      service: (vehicle.serviceRecords || []).reduce((sum, record) => sum + Number(record.cost || 0), 0),
      fuel: (vehicle.fuelLogs || []).reduce((sum, log) => sum + Number(log.totalCost || 0), 0),
      expenses: (vehicle.expenses || []).reduce((sum, expense) => sum + Number(expense.amount || 0), 0),
    };
  }, [vehicle]);

  if (loading) return <LoadingBlock label="Loading vehicle…" />;
  if (error || !vehicle) {
    return (
      <div className="mx-auto w-full max-w-3xl">
        <ErrorState message={error || 'Vehicle not found.'} onRetry={load} />
        <div className="mt-4 text-center">
          <Link to="/garage">
            <Button variant="secondary" icon={<ArrowLeft className="h-4 w-4" />}>
              Back to garage
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const insurance = vehicle.insurancePolicies?.[0];
  const insuranceInfo = insurance ? getExpiryInfo(insurance.expiryDate) : null;
  const isActive = vehicle.id === activeVehicleId;

  const markActive = () => {
    setActiveVehicleId(vehicle.id);
    success(`${vehicle.nickname} is now your active vehicle.`);
  };

  return (
    <div className="mx-auto w-full max-w-[1440px]">
      <Link
        to="/garage"
        className="mb-4 inline-flex items-center gap-1.5 text-xs font-medium text-text-secondary transition hover:text-primary-yellow"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> Back to garage
      </Link>

      <div className="mb-6 overflow-hidden rounded-card border border-border-subtle bg-bg-card">
        <div className="relative h-48 bg-gradient-to-br from-bg-elevated to-bg-main sm:h-56">
          {vehicle.photo ? (
            <img
              src={vehicle.photo}
              alt={`${vehicle.make} ${vehicle.model}`}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-primary-yellow/25">
              <Car className="h-24 w-24" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-bg-card via-bg-card/20 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 flex flex-wrap items-end justify-between gap-3 p-5">
            <div>
              <div className="mb-2 flex flex-wrap gap-1.5">
                <Badge tone="yellow">{vehicle.vehicleType}</Badge>
                <Badge tone="neutral">{vehicle.fuelType}</Badge>
                {isActive && <Badge tone="success">Active vehicle</Badge>}
              </div>
              <h1 className="font-display text-2xl font-bold text-white sm:text-3xl">{vehicle.nickname}</h1>
              <p className="mt-1 text-sm text-white/70">
                {vehicle.make} {vehicle.model} · {vehicle.year} ·{' '}
                <span className="font-semibold tracking-wider text-white">{vehicle.registrationNumber}</span>
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {!isActive && (
                <Button variant="secondary" onClick={markActive} icon={<Star className="h-4 w-4" />}>
                  Set active
                </Button>
              )}
              <Link to="/reports">
                <Button variant="secondary" icon={<Download className="h-4 w-4" />}>
                  Reports
                </Button>
              </Link>
              <Link to="/garage">
                <Button icon={<Pencil className="h-4 w-4" />}>Edit vehicle</Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Odometer"
          value={`${formatNumber(vehicle.currentOdometer)} km`}
          hint={vehicle.odometerReadings?.[0] ? `Updated ${formatDate(vehicle.odometerReadings[0].readingDate)}` : 'No readings'}
          icon={<Gauge className="h-5 w-5" />}
        />
        <StatCard
          label="Service spend"
          value={formatCurrency(totals.service, user?.settings?.currency)}
          hint={`${vehicle.serviceRecords?.length || 0} recent records`}
          icon={<Wrench className="h-5 w-5" />}
        />
        <StatCard
          label="Fuel spend"
          value={formatCurrency(totals.fuel, user?.settings?.currency)}
          hint={`${vehicle.fuelLogs?.length || 0} recent fill-ups`}
          icon={<Fuel className="h-5 w-5" />}
        />
        <StatCard
          label="Insurance"
          value={insurance ? insuranceInfo?.label : 'Not tracked'}
          hint={insurance ? `${insurance.insurer} · ${insurance.policyNumber}` : 'Add a policy to get alerts'}
          tone={insuranceInfo?.tone === 'danger' ? 'danger' : insuranceInfo?.tone === 'warning' ? 'warning' : insuranceInfo?.tone === 'success' ? 'success' : 'default'}
          icon={<ShieldCheck className="h-5 w-5" />}
        />
      </div>

      <div className="mt-6">
        <Tabs
          tabs={tabs.map((item) => ({
            ...item,
            count:
              item.key === 'services'
                ? vehicle.serviceRecords?.length
                : item.key === 'documents'
                ? vehicle.documents?.length
                : item.key === 'insurance'
                ? vehicle.insurancePolicies?.length
                : item.key === 'fuel'
                ? vehicle.fuelLogs?.length
                : item.key === 'expenses'
                ? vehicle.expenses?.length
                : item.key === 'care'
                ? (vehicle.tyreBatteryRecords?.length || 0) + (vehicle.warranties?.length || 0)
                : undefined,
          }))}
          active={tab}
          onChange={setTab}
        />
      </div>

      <div className="mt-5">
        {tab === 'overview' && (
          <div className="grid gap-5 lg:grid-cols-[1.4fr_1fr]">
            <Card>
              <CardHeader title="Vehicle profile" subtitle="Core details used across MyVeel" />
              <div className="grid gap-x-8 sm:grid-cols-2">
                <div>
                  <InfoRow label="Nickname" value={vehicle.nickname} />
                  <InfoRow label="Registration" value={vehicle.registrationNumber} />
                  <InfoRow label="Make" value={vehicle.make} />
                  <InfoRow label="Model" value={vehicle.model} />
                </div>
                <div>
                  <InfoRow label="Year" value={vehicle.year} />
                  <InfoRow label="Vehicle type" value={vehicle.vehicleType} />
                  <InfoRow label="Fuel type" value={vehicle.fuelType} />
                  <InfoRow label="Added" value={formatDate(vehicle.createdAt)} />
                </div>
              </div>
              {vehicle.notes && (
                <div className="mt-4 rounded-xl border border-border-subtle bg-bg-elevated/40 p-3.5">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-text-secondary">Notes</p>
                  <p className="mt-1.5 text-sm text-text-main">{vehicle.notes}</p>
                </div>
              )}
            </Card>

            <div className="space-y-5">
              <Card>
                <CardHeader title="Health alerts" subtitle="Generated from expiry dates and reminders" />
                <div className="space-y-2">
                  {insuranceInfo && (
                    <div className="flex items-center justify-between rounded-xl border border-border-subtle bg-bg-elevated/40 px-3 py-2.5">
                      <span className="flex items-center gap-2 text-sm text-text-main">
                        <ShieldCheck className="h-4 w-4 text-primary-yellow" /> Insurance
                      </span>
                      <Badge tone={insuranceInfo.tone === 'danger' ? 'danger' : insuranceInfo.tone === 'warning' ? 'warning' : 'success'}>
                        {insuranceInfo.label}
                      </Badge>
                    </div>
                  )}
                  {(vehicle.documents || []).filter((doc) => getExpiryInfo(doc.expiryDate).days <= 30).slice(0, 3).map((doc) => (
                    <div key={doc.id} className="flex items-center justify-between rounded-xl border border-border-subtle bg-bg-elevated/40 px-3 py-2.5">
                      <span className="flex items-center gap-2 text-sm text-text-main">
                        <FileText className="h-4 w-4 text-primary-yellow" /> {doc.documentType}
                      </span>
                      <Badge tone={getExpiryInfo(doc.expiryDate).tone === 'danger' ? 'danger' : 'warning'}>
                        {getExpiryInfo(doc.expiryDate).label}
                      </Badge>
                    </div>
                  ))}
                  {(vehicle.serviceReminders || []).slice(0, 4).map((reminder) => (
                    <div key={reminder.id} className="flex items-center justify-between gap-3 rounded-xl border border-border-subtle bg-bg-elevated/40 px-3 py-2.5">
                      <span className="flex min-w-0 items-center gap-2 text-sm text-text-main">
                        <Wrench className="h-4 w-4 shrink-0 text-primary-yellow" />
                        <span className="truncate">{reminder.title}</span>
                      </span>
                      <span className="shrink-0 text-xs text-text-secondary">
                        {reminder.dueDate ? formatDate(reminder.dueDate) : reminder.dueOdometer ? `${formatNumber(reminder.dueOdometer)} km` : '—'}
                      </span>
                    </div>
                  ))}
                  {!insuranceInfo && !(vehicle.serviceReminders || []).length && (
                    <p className="py-6 text-center text-sm text-text-secondary">
                      No alerts. Add insurance, documents or reminders to track them here.
                    </p>
                  )}
                </div>
              </Card>

              <Card>
                <CardHeader title="Latest odometer" subtitle="Most recent recorded readings" />
                {(vehicle.odometerReadings || []).slice(0, 4).map((reading) => (
                  <div key={reading.id} className="flex items-center justify-between border-b border-border-subtle/60 py-2.5 last:border-0">
                    <div>
                      <p className="text-sm font-medium text-text-main">{formatNumber(reading.reading)} km</p>
                      <p className="text-[11px] text-text-secondary">{formatDate(reading.readingDate)} · {capitalise(reading.source)}</p>
                    </div>
                    {reading.isCorrection && <Badge tone="warning">Correction</Badge>}
                  </div>
                ))}
                {!(vehicle.odometerReadings || []).length && (
                  <p className="py-6 text-center text-sm text-text-secondary">No odometer readings yet.</p>
                )}
                <Link
                  to="/odometer"
                  className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-primary-yellow hover:text-primary-hover"
                >
                  Record a reading <ChevronRight className="h-3.5 w-3.5" />
                </Link>
              </Card>
            </div>
          </div>
        )}

        {tab === 'services' && (
          <Card>
            <CardHeader
              title="Service history"
              subtitle="Most recent service records"
              action={<Link to="/services"><Button size="sm" variant="secondary">Manage services</Button></Link>}
            />
            {(vehicle.serviceRecords || []).length ? (
              <TableShell headers={['Date', 'Service', 'Workshop', 'Odometer', 'Cost']}>
                {vehicle.serviceRecords!.map((record) => (
                  <tr key={record.id} className="text-text-main">
                    <td className="py-3 pr-4 text-xs text-text-secondary">{formatDate(record.serviceDate)}</td>
                    <td className="py-3 pr-4">{record.serviceType}</td>
                    <td className="py-3 pr-4 text-text-secondary">{record.workshopName}</td>
                    <td className="py-3 pr-4 text-text-secondary">{formatNumber(record.odometer)} km</td>
                    <td className="py-3 font-medium">{formatCurrency(record.cost, user?.settings?.currency)}</td>
                  </tr>
                ))}
              </TableShell>
            ) : (
              <p className="py-8 text-center text-sm text-text-secondary">No service records yet.</p>
            )}
          </Card>
        )}

        {tab === 'odometer' && (
          <Card>
            <CardHeader
              title="Odometer readings"
              subtitle="Latest 10 readings"
              action={<Link to="/odometer"><Button size="sm" variant="secondary">Add reading</Button></Link>}
            />
            {(vehicle.odometerReadings || []).length ? (
              <TableShell headers={['Date', 'Reading', 'Source', 'Notes']}>
                {vehicle.odometerReadings!.map((reading) => (
                  <tr key={reading.id} className="text-text-main">
                    <td className="py-3 pr-4 text-xs text-text-secondary">{formatDate(reading.readingDate)}</td>
                    <td className="py-3 pr-4 font-medium">{formatNumber(reading.reading)} km</td>
                    <td className="py-3 pr-4 text-text-secondary">{capitalise(reading.source)}</td>
                    <td className="py-3 text-text-secondary">{reading.notes || '—'}</td>
                  </tr>
                ))}
              </TableShell>
            ) : (
              <p className="py-8 text-center text-sm text-text-secondary">No odometer readings yet.</p>
            )}
          </Card>
        )}

        {tab === 'documents' && (
          <Card>
            <CardHeader
              title="Documents"
              subtitle="RC, PUC, permits and more"
              action={<Link to="/documents"><Button size="sm" variant="secondary">Manage documents</Button></Link>}
            />
            {(vehicle.documents || []).length ? (
              <TableShell headers={['Type', 'Number', 'Issued', 'Expires', 'Status']}>
                {vehicle.documents!.map((doc) => {
                  const info = getExpiryInfo(doc.expiryDate);
                  return (
                    <tr key={doc.id} className="text-text-main">
                      <td className="py-3 pr-4 font-medium">{doc.documentType}</td>
                      <td className="py-3 pr-4 text-text-secondary">{doc.documentNumber}</td>
                      <td className="py-3 pr-4 text-xs text-text-secondary">{formatDate(doc.issueDate)}</td>
                      <td className="py-3 pr-4 text-xs text-text-secondary">{formatDate(doc.expiryDate)}</td>
                      <td className="py-3">
                        <Badge tone={info.tone === 'danger' ? 'danger' : info.tone === 'warning' ? 'warning' : 'success'}>
                          {info.label}
                        </Badge>
                      </td>
                    </tr>
                  );
                })}
              </TableShell>
            ) : (
              <p className="py-8 text-center text-sm text-text-secondary">No documents stored yet.</p>
            )}
          </Card>
        )}

        {tab === 'insurance' && (
          <Card>
            <CardHeader
              title="Insurance policies"
              subtitle="All policies recorded for this vehicle"
              action={<Link to="/insurance"><Button size="sm" variant="secondary">Manage insurance</Button></Link>}
            />
            {(vehicle.insurancePolicies || []).length ? (
              <TableShell headers={['Insurer', 'Policy', 'Cover', 'Premium', 'Expires', 'Status']}>
                {vehicle.insurancePolicies!.map((policy) => {
                  const info = getExpiryInfo(policy.expiryDate);
                  return (
                    <tr key={policy.id} className="text-text-main">
                      <td className="py-3 pr-4 font-medium">{policy.insurer}</td>
                      <td className="py-3 pr-4 text-text-secondary">{policy.policyNumber}</td>
                      <td className="py-3 pr-4 text-text-secondary">{policy.coverType}</td>
                      <td className="py-3 pr-4">{formatCurrency(policy.premium, user?.settings?.currency)}</td>
                      <td className="py-3 pr-4 text-xs text-text-secondary">{formatDate(policy.expiryDate)}</td>
                      <td className="py-3">
                        <Badge tone={info.tone === 'danger' ? 'danger' : info.tone === 'warning' ? 'warning' : 'success'}>
                          {info.label}
                        </Badge>
                      </td>
                    </tr>
                  );
                })}
              </TableShell>
            ) : (
              <p className="py-8 text-center text-sm text-text-secondary">No insurance policies yet.</p>
            )}
          </Card>
        )}

        {tab === 'fuel' && (
          <Card>
            <CardHeader
              title="Fuel log"
              subtitle="Recent fill-ups and efficiency"
              action={<Link to="/expenses"><Button size="sm" variant="secondary">Manage fuel</Button></Link>}
            />
            {(vehicle.fuelLogs || []).length ? (
              <TableShell headers={['Date', 'Quantity', 'Cost', 'Odometer', 'Efficiency']}>
                {vehicle.fuelLogs!.map((log) => (
                  <tr key={log.id} className="text-text-main">
                    <td className="py-3 pr-4 text-xs text-text-secondary">{formatDate(log.logDate)}</td>
                    <td className="py-3 pr-4">{log.quantity} L</td>
                    <td className="py-3 pr-4">{formatCurrency(log.totalCost, user?.settings?.currency)}</td>
                    <td className="py-3 pr-4 text-text-secondary">{formatNumber(log.odometer)} km</td>
                    <td className="py-3 text-text-secondary">
                      {log.calculatedEfficiency ? `${log.calculatedEfficiency} km/L` : '—'}
                    </td>
                  </tr>
                ))}
              </TableShell>
            ) : (
              <p className="py-8 text-center text-sm text-text-secondary">No fuel logs yet.</p>
            )}
          </Card>
        )}

        {tab === 'expenses' && (
          <Card>
            <CardHeader
              title="Expenses"
              subtitle="Recent recorded costs"
              action={<Link to="/expenses"><Button size="sm" variant="secondary">Open expense tracker</Button></Link>}
            />
            {(vehicle.expenses || []).length ? (
              <TableShell headers={['Date', 'Category', 'Description', 'Amount']}>
                {vehicle.expenses!.map((expense) => (
                  <tr key={expense.id} className="text-text-main">
                    <td className="py-3 pr-4 text-xs text-text-secondary">{formatDate(expense.expenseDate)}</td>
                    <td className="py-3 pr-4"><Badge tone="neutral">{capitalise(expense.category)}</Badge></td>
                    <td className="py-3 pr-4 text-text-secondary">{expense.description}</td>
                    <td className="py-3 font-medium">{formatCurrency(expense.amount, user?.settings?.currency)}</td>
                  </tr>
                ))}
              </TableShell>
            ) : (
              <p className="py-8 text-center text-sm text-text-secondary">No expenses recorded yet.</p>
            )}
          </Card>
        )}

        {tab === 'care' && (
          <div className="grid gap-5 lg:grid-cols-2">
            <Card>
              <CardHeader
                title="Tyres & battery"
                subtitle="Installed components and replacement schedule"
                action={<BatteryCharging className="h-4 w-4 text-primary-yellow" />}
              />
              {(vehicle.tyreBatteryRecords || []).length ? (
                <div className="space-y-2">
                  {vehicle.tyreBatteryRecords!.map((record) => (
                    <div key={record.id} className="rounded-xl border border-border-subtle bg-bg-elevated/40 p-3">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-sm font-medium text-text-main">
                          {record.brand} {record.model}
                        </p>
                        <Badge tone={record.itemType === 'BATTERY' ? 'info' : 'yellow'}>{record.itemType}</Badge>
                      </div>
                      <p className="mt-1 text-xs text-text-secondary">
                        {record.position || '—'} · Installed {formatDate(record.installedDate)} · {formatNumber(record.installedOdometer)} km
                      </p>
                      {record.replacementDueAgeMonths && (
                        <p className="mt-1 flex items-center gap-1 text-[11px] text-amber-300">
                          <CalendarClock className="h-3 w-3" /> Replace after {record.replacementDueAgeMonths} months
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="py-6 text-center text-sm text-text-secondary">No tyre or battery records.</p>
              )}
              <Link to="/tyres-battery" className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-primary-yellow hover:text-primary-hover">
                Manage tyres & battery <ChevronRight className="h-3.5 w-3.5" />
              </Link>
            </Card>

            <Card>
              <CardHeader
                title="Warranties"
                subtitle="Coverage still associated with this vehicle"
                action={<ShieldCheck className="h-4 w-4 text-primary-yellow" />}
              />
              {(vehicle.warranties || []).length ? (
                <div className="space-y-2">
                  {vehicle.warranties!.map((warranty) => {
                    const info = getExpiryInfo(warranty.expiryDate);
                    return (
                      <div key={warranty.id} className="rounded-xl border border-border-subtle bg-bg-elevated/40 p-3">
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-sm font-medium text-text-main">{warranty.warrantyType}</p>
                          <Badge tone={info.tone === 'danger' ? 'danger' : info.tone === 'warning' ? 'warning' : 'success'}>
                            {info.label}
                          </Badge>
                        </div>
                        <p className="mt-1 text-xs text-text-secondary">
                          {warranty.provider} · Expires {formatDate(warranty.expiryDate)}
                        </p>
                        <p className="mt-1 text-[11px] text-text-secondary">{warranty.coverageNotes}</p>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="py-6 text-center text-sm text-text-secondary">No warranties recorded.</p>
              )}
              <Link to="/warranties" className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-primary-yellow hover:text-primary-hover">
                Manage warranties <ChevronRight className="h-3.5 w-3.5" />
              </Link>
            </Card>

            <Card className="lg:col-span-2">
              <CardHeader
                title="Open service reminders"
                subtitle="Derived from your latest service intervals"
                action={<Link to="/services"><Button size="sm" variant="secondary">Manage</Button></Link>}
              />
              {(vehicle.serviceReminders || []).length ? (
                <div className="grid gap-2 sm:grid-cols-2">
                  {vehicle.serviceReminders!.map((reminder) => (
                    <div key={reminder.id} className="flex items-center justify-between gap-3 rounded-xl border border-border-subtle bg-bg-elevated/40 p-3">
                      <div>
                        <p className="text-sm font-medium text-text-main">{reminder.title}</p>
                        <p className="text-[11px] text-text-secondary">{reminder.serviceType}</p>
                      </div>
                      <span className="text-xs text-text-secondary">
                        {reminder.dueDate ? formatDate(reminder.dueDate) : reminder.dueOdometer ? `${formatNumber(reminder.dueOdometer)} km` : '—'}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="py-6 text-center text-sm text-text-secondary">No open reminders.</p>
              )}
            </Card>
          </div>
        )}
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <Link to="/services" className="flex items-center justify-between rounded-card border border-border-subtle bg-bg-card p-4 transition hover:border-primary-yellow/40">
          <span className="flex items-center gap-2 text-sm font-medium text-text-main"><Wrench className="h-4 w-4 text-primary-yellow" /> Log a service</span>
          <ChevronRight className="h-4 w-4 text-text-secondary" />
        </Link>
        <Link to="/expenses" className="flex items-center justify-between rounded-card border border-border-subtle bg-bg-card p-4 transition hover:border-primary-yellow/40">
          <span className="flex items-center gap-2 text-sm font-medium text-text-main"><CircleDollarSign className="h-4 w-4 text-primary-yellow" /> Add an expense</span>
          <ChevronRight className="h-4 w-4 text-text-secondary" />
        </Link>
        <Link to="/nearby" className="flex items-center justify-between rounded-card border border-border-subtle bg-bg-card p-4 transition hover:border-primary-yellow/40">
          <span className="flex items-center gap-2 text-sm font-medium text-text-main"><AlertTriangle className="h-4 w-4 text-primary-yellow" /> Find help nearby</span>
          <ChevronRight className="h-4 w-4 text-text-secondary" />
        </Link>
      </div>
    </div>
  );
}
