import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  AlertTriangle,
  ArrowUpRight,
  Bell,
  CalendarClock,
  Car,
  ChevronRight,
  CircleDollarSign,
  Fuel,
  Gauge,
  Plus,
  ShieldCheck,
  Sparkles,
  Wrench,
} from 'lucide-react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { useAuth } from '../context/AuthContext';
import { useVehicles } from '../context/VehicleContext';
import { api } from '../lib/api';
import { capitalise, daysUntil, formatCurrency, formatDate, formatNumber, getExpiryInfo } from '../lib/format';
import type {
  Expense,
  ExpensesResponse,
  FuelLogsResponse,
  NotificationsResponse,
  ServiceRecord,
  ServiceReminder,
} from '../types';
import {
  Badge,
  Button,
  Card,
  CardHeader,
  EmptyState,
  ErrorState,
  LoadingBlock,
  PageHeader,
  StatCard,
} from '../components/ui';

const tooltipStyle = {
  contentStyle: {
    backgroundColor: '#14161B',
    border: '1px solid #292D35',
    borderRadius: 12,
    color: '#F5F5F5',
    fontSize: 12,
  },
  labelStyle: { color: '#A0A5AF' },
};

export default function DashboardPage() {
  const { user } = useAuth();
  const { vehicles, activeVehicle, activeVehicleId, loading: vehiclesLoading } = useVehicles();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [unread, setUnread] = useState(0);
  const [reminders, setReminders] = useState<ServiceReminder[]>([]);
  const [services, setServices] = useState<ServiceRecord[]>([]);
  const [expenses, setExpenses] = useState<ExpensesResponse | null>(null);
  const [fuel, setFuel] = useState<FuelLogsResponse | null>(null);

  const load = async () => {
    if (!activeVehicleId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError('');
    try {
      const [notifications, reminderData, serviceData, expenseData, fuelData] = await Promise.all([
        api.get<NotificationsResponse>('/notifications', { isRead: false }),
        api.get<ServiceReminder[]>('/services/reminders'),
        api.get<ServiceRecord[]>('/services', { vehicleId: activeVehicleId }),
        api.get<ExpensesResponse>('/fuel-expenses/expenses', { vehicleId: activeVehicleId }),
        api.get<FuelLogsResponse>('/fuel-expenses/fuel', { vehicleId: activeVehicleId }),
      ]);
      setUnread(notifications.unreadCount);
      setReminders(reminderData);
      setServices(serviceData);
      setExpenses(expenseData);
      setFuel(fuelData);
    } catch (err: any) {
      setError(err.message || 'Unable to load dashboard data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeVehicleId]);

  const renewals = useMemo(
    () =>
      vehicles
        .filter((vehicle) => vehicle.nextRenewalDate && daysUntil(vehicle.nextRenewalDate) <= 30)
        .sort((a, b) => daysUntil(a.nextRenewalDate) - daysUntil(b.nextRenewalDate)),
    [vehicles]
  );

  const fuelTrend = useMemo(() => {
    if (!fuel) return [];
    return [...fuel.logs]
      .filter((log) => log.calculatedEfficiency && log.calculatedEfficiency > 0)
      .reverse()
      .slice(-8)
      .map((log) => ({
        date: new Date(log.logDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }),
        efficiency: log.calculatedEfficiency,
      }));
  }, [fuel]);

  const recentExpenses = useMemo(() => expenses?.expenses.slice(0, 4) || [], [expenses]);

  const greeting = (() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  })();

  if (vehiclesLoading) {
    return <LoadingBlock label="Loading your garage…" />;
  }

  return (
    <div className="mx-auto w-full max-w-[1440px]">
      <PageHeader
        title={`${greeting}, ${user?.name?.split(' ')[0] || 'driver'}`}
        subtitle={`${new Date().toLocaleDateString('en-IN', {
          weekday: 'long',
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        })} · Here is what needs your attention today.`}
        actions={
          <>
            <Link to="/notifications">
              <Button variant="secondary" icon={<Bell className="h-4 w-4" />}>
                Notifications{unread > 0 ? ` (${unread})` : ''}
              </Button>
            </Link>
            <Link to="/garage">
              <Button icon={<Plus className="h-4 w-4" />}>Add vehicle</Button>
            </Link>
          </>
        }
      />

      {vehicles.length === 0 ? (
        <EmptyState
          icon={<Car className="h-7 w-7" />}
          title="Your garage is empty"
          description="Add your first vehicle to unlock odometer tracking, service reminders, document vault, insurance alerts and expense analytics."
          action={
            <div className="flex flex-wrap justify-center gap-2">
              <Link to="/garage">
                <Button icon={<Plus className="h-4 w-4" />}>Add your first vehicle</Button>
              </Link>
              <Link to="/settings">
                <Button variant="secondary" icon={<Sparkles className="h-4 w-4" />}>
                  Seed demo garage
                </Button>
              </Link>
            </div>
          }
        />
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
              label="Vehicles"
              value={formatNumber(vehicles.length)}
              hint="Active vehicles in your garage"
              icon={<Car className="h-5 w-5" />}
            />
            <StatCard
              label="Upcoming renewals"
              value={formatNumber(renewals.length)}
              hint="Insurance or documents due within 30 days"
              tone={renewals.length > 0 ? 'warning' : 'success'}
              icon={<CalendarClock className="h-5 w-5" />}
            />
            <StatCard
              label="Maintenance due"
              value={formatNumber(reminders.length)}
              hint="Open service reminders"
              tone={reminders.length > 0 ? 'warning' : 'success'}
              icon={<Wrench className="h-5 w-5" />}
            />
            <StatCard
              label="This month"
              value={formatCurrency(expenses?.summary.thisMonthTotal || 0, user?.settings?.currency)}
              hint="Recorded spend for selected vehicle"
              icon={<CircleDollarSign className="h-5 w-5" />}
            />
          </div>

          {error && (
            <div className="mt-4">
              <ErrorState message={error} onRetry={load} />
            </div>
          )}

          {loading ? (
            <LoadingBlock label="Loading vehicle insights…" />
          ) : (
            <div className="mt-6 grid gap-6 xl:grid-cols-[1.55fr_1fr]">
              <div className="space-y-6">
                <Card>
                  <CardHeader
                    title="Your garage"
                    subtitle="Live status from your recorded vehicle data"
                    action={
                      <Link
                        to="/garage"
                        className="inline-flex items-center gap-1 text-xs font-medium text-primary-yellow hover:text-primary-hover"
                      >
                        Manage garage <ArrowUpRight className="h-3.5 w-3.5" />
                      </Link>
                    }
                  />
                  <div className="grid gap-3 sm:grid-cols-2">
                    {vehicles.map((vehicle) => {
                      const insurance = vehicle.activeInsurance;
                      const renewal = insurance
                        ? getExpiryInfo(insurance.expiryDate)
                        : { label: 'No policy', tone: 'neutral' as const, days: 0 };
                      return (
                        <Link
                          key={vehicle.id}
                          to={`/garage/${vehicle.id}`}
                          className={`group overflow-hidden rounded-xl border transition ${
                            vehicle.id === activeVehicleId
                              ? 'border-primary-yellow/50 bg-primary-yellow/[0.04]'
                              : 'border-border-subtle bg-bg-elevated/40 hover:border-primary-yellow/30'
                          }`}
                        >
                          <div className="relative h-28 overflow-hidden bg-gradient-to-br from-bg-elevated to-bg-main">
                            {vehicle.photo ? (
                              <img
                                src={vehicle.photo}
                                alt={`${vehicle.make} ${vehicle.model}`}
                                className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]"
                              />
                            ) : (
                              <div className="flex h-full items-center justify-center text-primary-yellow/40">
                                <Car className="h-12 w-12" />
                              </div>
                            )}
                            <div className="absolute left-2 top-2 flex gap-1.5">
                              <Badge tone="yellow">{vehicle.vehicleType}</Badge>
                              <Badge tone={renewal.tone === 'danger' ? 'danger' : renewal.tone === 'warning' ? 'warning' : renewal.tone === 'success' ? 'success' : 'neutral'}>
                                {insurance ? renewal.label : 'No insurance'}
                              </Badge>
                            </div>
                          </div>
                          <div className="p-3.5">
                            <div className="flex items-start justify-between gap-2">
                              <div className="min-w-0">
                                <p className="truncate text-sm font-semibold text-text-main">
                                  {vehicle.nickname}
                                </p>
                                <p className="truncate text-xs text-text-secondary">
                                  {vehicle.make} {vehicle.model} · {vehicle.year}
                                </p>
                              </div>
                              <ChevronRight className="mt-0.5 h-4 w-4 shrink-0 text-text-secondary transition group-hover:text-primary-yellow" />
                            </div>
                            <div className="mt-3 flex items-center justify-between rounded-lg border border-border-subtle bg-bg-main/60 px-2.5 py-1.5">
                              <span className="flex items-center gap-1 text-[11px] text-text-secondary">
                                <Gauge className="h-3.5 w-3.5" /> {formatNumber(vehicle.currentOdometer)} km
                              </span>
                              <span className="text-[11px] font-medium tracking-wide text-text-main">
                                {vehicle.registrationNumber}
                              </span>
                            </div>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                </Card>

                <Card>
                  <CardHeader
                    title="Monthly spending"
                    subtitle="Last 6 months for the selected vehicle"
                    action={<Badge tone="yellow">{formatCurrency(expenses?.summary.ytdTotal || 0, user?.settings?.currency)} YTD</Badge>}
                  />
                  {expenses?.summary.monthlySpending?.length ? (
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={expenses.summary.monthlySpending}>
                          <CartesianGrid stroke="#292D35" strokeDasharray="4 4" vertical={false} />
                          <XAxis dataKey="month" tick={{ fill: '#A0A5AF', fontSize: 11 }} axisLine={false} tickLine={false} />
                          <YAxis
                            tick={{ fill: '#A0A5AF', fontSize: 11 }}
                            axisLine={false}
                            tickLine={false}
                            tickFormatter={(value) => `${Math.round(Number(value) / 1000)}k`}
                          />
                          <Tooltip
                            {...tooltipStyle}
                            formatter={(value) => formatCurrency(Number(value), user?.settings?.currency)}
                          />
                          <Bar dataKey="fuel" stackId="spend" fill="#FFD400" radius={[0, 0, 0, 0]} />
                          <Bar dataKey="service" stackId="spend" fill="#60A5FA" />
                          <Bar dataKey="insurance" stackId="spend" fill="#34D399" />
                          <Bar dataKey="other" stackId="spend" fill="#A0A5AF" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  ) : (
                    <p className="py-10 text-center text-sm text-text-secondary">No expenses recorded yet.</p>
                  )}
                  <div className="mt-3 flex flex-wrap gap-3 text-[11px] text-text-secondary">
                    <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-primary-yellow" /> Fuel</span>
                    <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-sky-400" /> Service</span>
                    <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-emerald-400" /> Insurance</span>
                    <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-text-secondary" /> Other</span>
                  </div>
                </Card>

                <Card>
                  <CardHeader
                    title="Recent service activity"
                    subtitle={activeVehicle ? `${activeVehicle.nickname} service history` : 'Service history'}
                    action={
                      <Link to="/services" className="text-xs font-medium text-primary-yellow hover:text-primary-hover">
                        View all
                      </Link>
                    }
                  />
                  {services.length ? (
                    <div className="space-y-2">
                      {services.slice(0, 5).map((service) => (
                        <div
                          key={service.id}
                          className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-border-subtle bg-bg-elevated/40 px-3.5 py-3"
                        >
                          <div className="flex items-center gap-3">
                            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-yellow/10 text-primary-yellow">
                              <Wrench className="h-4 w-4" />
                            </span>
                            <div>
                              <p className="text-sm font-medium text-text-main">{service.serviceType}</p>
                              <p className="text-xs text-text-secondary">
                                {service.workshopName} · {formatDate(service.serviceDate)}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-semibold text-text-main">
                              {formatCurrency(service.cost, user?.settings?.currency)}
                            </p>
                            <p className="text-xs text-text-secondary">{formatNumber(service.odometer)} km</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="py-8 text-center text-sm text-text-secondary">No service records yet.</p>
                  )}
                </Card>
              </div>

              <div className="space-y-6">
                <Card>
                  <CardHeader
                    title="Upcoming deadlines"
                    subtitle="Calculated from your records"
                    action={<Badge tone="yellow">{reminders.length + renewals.length}</Badge>}
                  />
                  <div className="space-y-2">
                    {reminders.slice(0, 4).map((reminder) => (
                      <div
                        key={reminder.id}
                        className="rounded-xl border border-border-subtle bg-bg-elevated/40 p-3"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-sm font-medium text-text-main">{reminder.title}</p>
                          <Badge tone="warning">Service</Badge>
                        </div>
                        <p className="mt-1 text-xs text-text-secondary">
                          {reminder.vehicle?.nickname || activeVehicle?.nickname} ·{' '}
                          {reminder.dueDate ? formatDate(reminder.dueDate) : 'No date'}
                          {reminder.dueOdometer ? ` · ${formatNumber(reminder.dueOdometer)} km` : ''}
                        </p>
                      </div>
                    ))}
                    {renewals.map((vehicle) => {
                      const info = getExpiryInfo(vehicle.nextRenewalDate);
                      return (
                        <Link
                          key={vehicle.id}
                          to="/insurance"
                          className="block rounded-xl border border-border-subtle bg-bg-elevated/40 p-3 transition hover:border-primary-yellow/30"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <p className="text-sm font-medium text-text-main">
                              Renewal · {vehicle.nickname}
                            </p>
                            <Badge tone={info.tone === 'danger' ? 'danger' : info.tone === 'warning' ? 'warning' : 'success'}>
                              {info.label}
                            </Badge>
                          </div>
                          <p className="mt-1 text-xs text-text-secondary">
                            Due {formatDate(vehicle.nextRenewalDate)} · {vehicle.registrationNumber}
                          </p>
                        </Link>
                      );
                    })}
                    {reminders.length === 0 && renewals.length === 0 && (
                      <div className="rounded-xl border border-dashed border-border-subtle px-4 py-8 text-center">
                        <ShieldCheck className="mx-auto mb-2 h-6 w-6 text-emerald-300" />
                        <p className="text-sm text-text-secondary">Nothing urgent. You are all caught up.</p>
                      </div>
                    )}
                  </div>
                </Card>

                <Card>
                  <CardHeader
                    title="Fuel efficiency"
                    subtitle={fuel?.metrics.avgEfficiency ? `Average ${fuel.metrics.avgEfficiency} km/L` : 'Full-tank readings required'}
                    action={<Fuel className="h-4 w-4 text-primary-yellow" />}
                  />
                  {fuelTrend.length >= 2 ? (
                    <div className="h-44">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={fuelTrend}>
                          <defs>
                            <linearGradient id="efficiencyFill" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="#FFD400" stopOpacity={0.35} />
                              <stop offset="100%" stopColor="#FFD400" stopOpacity={0} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid stroke="#292D35" strokeDasharray="4 4" vertical={false} />
                          <XAxis dataKey="date" tick={{ fill: '#A0A5AF', fontSize: 10 }} axisLine={false} tickLine={false} />
                          <YAxis tick={{ fill: '#A0A5AF', fontSize: 10 }} axisLine={false} tickLine={false} width={32} />
                          <Tooltip {...tooltipStyle} formatter={(value) => [`${value} km/L`, 'Efficiency']} />
                          <Area
                            type="monotone"
                            dataKey="efficiency"
                            stroke="#FFD400"
                            strokeWidth={2}
                            fill="url(#efficiencyFill)"
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  ) : (
                    <p className="py-8 text-center text-sm text-text-secondary">
                      Log two consecutive full-tank fill-ups to see efficiency trends.
                    </p>
                  )}
                </Card>

                <Card>
                  <CardHeader title="Quick actions" subtitle="Jump straight into a workflow" />
                  <div className="grid grid-cols-2 gap-2">
                    <Link to="/expenses" className="flex flex-col gap-2 rounded-xl border border-border-subtle bg-bg-elevated/40 p-3 transition hover:border-primary-yellow/40">
                      <Fuel className="h-5 w-5 text-primary-yellow" />
                      <span className="text-xs font-medium text-text-main">Log fuel</span>
                    </Link>
                    <Link to="/services" className="flex flex-col gap-2 rounded-xl border border-border-subtle bg-bg-elevated/40 p-3 transition hover:border-primary-yellow/40">
                      <Wrench className="h-5 w-5 text-primary-yellow" />
                      <span className="text-xs font-medium text-text-main">Log service</span>
                    </Link>
                    <Link to="/documents" className="flex flex-col gap-2 rounded-xl border border-border-subtle bg-bg-elevated/40 p-3 transition hover:border-primary-yellow/40">
                      <ShieldCheck className="h-5 w-5 text-primary-yellow" />
                      <span className="text-xs font-medium text-text-main">Add document</span>
                    </Link>
                    <Link to="/odometer" className="flex flex-col gap-2 rounded-xl border border-border-subtle bg-bg-elevated/40 p-3 transition hover:border-primary-yellow/40">
                      <Gauge className="h-5 w-5 text-primary-yellow" />
                      <span className="text-xs font-medium text-text-main">Odometer</span>
                    </Link>
                  </div>
                </Card>

                <Card>
                  <CardHeader title="Recent expenses" subtitle="Latest recorded costs" />
                  {recentExpenses.length ? (
                    <div className="space-y-2">
                      {recentExpenses.map((expense: Expense) => (
                        <div key={expense.id} className="flex items-center justify-between gap-3 text-sm">
                          <div className="min-w-0">
                            <p className="truncate text-text-main">{expense.description}</p>
                            <p className="text-[11px] text-text-secondary">
                              {capitalise(expense.category)} · {formatDate(expense.expenseDate)}
                            </p>
                          </div>
                          <span className="shrink-0 font-medium text-text-main">
                            {formatCurrency(expense.amount, user?.settings?.currency)}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="py-6 text-center text-sm text-text-secondary">No expenses yet.</p>
                  )}
                </Card>

                <Card>
                  <CardHeader
                    title="Insurance & documents"
                    subtitle={activeVehicle ? activeVehicle.nickname : 'Selected vehicle'}
                    action={<AlertTriangle className={`h-4 w-4 ${(activeVehicle?.expiredDocsCount || 0) > 0 ? 'text-red-300' : 'text-emerald-300'}`} />}
                  />
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-between rounded-lg border border-border-subtle bg-bg-elevated/40 px-3 py-2.5">
                      <span className="text-text-secondary">Insurance</span>
                      {activeVehicle?.activeInsurance ? (
                        <Badge
                          tone={
                            getExpiryInfo(activeVehicle.activeInsurance.expiryDate).tone === 'danger'
                              ? 'danger'
                              : getExpiryInfo(activeVehicle.activeInsurance.expiryDate).tone === 'warning'
                              ? 'warning'
                              : 'success'
                          }
                        >
                          {getExpiryInfo(activeVehicle.activeInsurance.expiryDate).label}
                        </Badge>
                      ) : (
                        <Badge tone="neutral">Not tracked</Badge>
                      )}
                    </div>
                    <div className="flex items-center justify-between rounded-lg border border-border-subtle bg-bg-elevated/40 px-3 py-2.5">
                      <span className="text-text-secondary">Expired documents</span>
                      <Badge tone={(activeVehicle?.expiredDocsCount || 0) > 0 ? 'danger' : 'success'}>
                        {activeVehicle?.expiredDocsCount || 0}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between rounded-lg border border-border-subtle bg-bg-elevated/40 px-3 py-2.5">
                      <span className="text-text-secondary">Latest service</span>
                      <span className="text-text-main">
                        {activeVehicle?.latestService ? formatDate(activeVehicle.latestService.serviceDate) : '—'}
                      </span>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
