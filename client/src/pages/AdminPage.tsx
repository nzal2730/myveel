import { useEffect, useMemo, useState } from 'react';
import {
  BadgeCheck,
  Car,
  CheckCheck,
  Database,
  Gauge,
  Mail,
  Shield,
  Trash2,
  UserRound,
  Users,
  Wrench,
} from 'lucide-react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { api } from '../lib/api';
import { capitalise, formatDate, formatNumber, initials } from '../lib/format';
import type { AdminOverview, AdminUser, AdminVehicle } from '../types';
import {
  Badge,
  Button,
  Card,
  CardHeader,
  ConfirmDialog,
  EmptyState,
  ErrorState,
  LoadingBlock,
  PageHeader,
  SearchInput,
  StatCard,
  Tabs,
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

type AdminAction =
  | { kind: 'role'; user: AdminUser; nextRole: 'USER' | 'ADMIN' }
  | { kind: 'verify'; user: AdminUser }
  | { kind: 'delete-user'; user: AdminUser }
  | { kind: 'delete-vehicle'; vehicle: AdminVehicle };

export default function AdminPage() {
  const { user: currentUser } = useAuth();
  const { success, error: showError } = useToast();
  const [overview, setOverview] = useState<AdminOverview | null>(null);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [vehicles, setVehicles] = useState<AdminVehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tab, setTab] = useState('overview');
  const [userSearch, setUserSearch] = useState('');
  const [vehicleSearch, setVehicleSearch] = useState('');
  const [pendingAction, setPendingAction] = useState<AdminAction | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const [overviewData, userData, vehicleData] = await Promise.all([
        api.get<AdminOverview>('/admin/overview'),
        api.get<AdminUser[]>('/admin/users'),
        api.get<AdminVehicle[]>('/admin/vehicles'),
      ]);
      setOverview(overviewData);
      setUsers(userData);
      setVehicles(vehicleData);
    } catch (err: any) {
      setError(err.message || 'Could not load admin data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleConfirmAction = async () => {
    if (!pendingAction) return;
    setActionLoading(true);
    try {
      if (pendingAction.kind === 'role') {
        await api.patch(`/admin/users/${pendingAction.user.id}/role`, {
          role: pendingAction.nextRole,
        });
        success(
          pendingAction.nextRole === 'ADMIN'
            ? `${pendingAction.user.name} is now an admin.`
            : `${pendingAction.user.name} is now a regular user.`
        );
      } else if (pendingAction.kind === 'verify') {
        await api.patch(`/admin/users/${pendingAction.user.id}/verification`, {
          isEmailVerified: true,
          isMobileVerified: true,
        });
        success(`${pendingAction.user.name} has been fully verified.`);
      } else if (pendingAction.kind === 'delete-user') {
        await api.delete(`/admin/users/${pendingAction.user.id}`);
        success(`${pendingAction.user.name}'s account was deleted.`);
      } else {
        await api.delete(`/admin/vehicles/${pendingAction.vehicle.id}`);
        success(`${pendingAction.vehicle.nickname} was removed from the platform.`);
      }
      setPendingAction(null);
      await load();
    } catch (err: any) {
      showError(err.message || 'Could not complete that action.');
    } finally {
      setActionLoading(false);
    }
  };

  const filteredUsers = useMemo(() => {
    const term = userSearch.trim().toLowerCase();
    if (!term) return users;
    return users.filter((user) =>
      [user.name, user.email, user.mobile].some((value) =>
        value?.toLowerCase().includes(term)
      )
    );
  }, [users, userSearch]);

  const filteredVehicles = useMemo(() => {
    const term = vehicleSearch.trim().toLowerCase();
    if (!term) return vehicles;
    return vehicles.filter((vehicle) =>
      [
        vehicle.nickname,
        vehicle.registrationNumber,
        vehicle.make,
        vehicle.model,
        vehicle.user?.name,
        vehicle.user?.email,
      ].some((value) => value?.toLowerCase().includes(term))
    );
  }, [vehicles, vehicleSearch]);

  const moduleData = overview
    ? [
        { name: 'Services', value: overview.stats.totalServices },
        { name: 'Documents', value: overview.stats.totalDocuments },
        { name: 'Insurance', value: overview.stats.totalInsurancePolicies },
        { name: 'Fuel logs', value: overview.stats.totalFuelLogs },
        { name: 'Expenses', value: overview.stats.totalExpenses },
        { name: 'Care tasks', value: overview.stats.totalCareTasks },
      ]
    : [];

  const pendingDialog = (() => {
    if (!pendingAction) {
      return { title: '', message: '', confirmLabel: 'Confirm', danger: true };
    }
    if (pendingAction.kind === 'role') {
      const promote = pendingAction.nextRole === 'ADMIN';
      return {
        title: promote ? 'Grant admin access?' : 'Remove admin access?',
        message: promote
          ? `${pendingAction.user.name} will get full access to the admin console, including the ability to manage users and vehicles.`
          : `${pendingAction.user.name} will lose access to the admin console and return to a regular garage account.`,
        confirmLabel: promote ? 'Make admin' : 'Make user',
        danger: !promote,
      };
    }
    if (pendingAction.kind === 'verify') {
      return {
        title: 'Verify this user?',
        message: `Mark both the email address and mobile number for ${pendingAction.user.name} as verified.`,
        confirmLabel: 'Verify user',
        danger: false,
      };
    }
    if (pendingAction.kind === 'delete-user') {
      return {
        title: 'Delete this account?',
        message: `${pendingAction.user.name}'s account and all of their vehicle records, documents, expenses and history will be permanently deleted. This cannot be undone.`,
        confirmLabel: 'Delete account',
        danger: true,
      };
    }
    return {
      title: 'Delete this vehicle?',
      message: `${pendingAction.vehicle.nickname} (${pendingAction.vehicle.registrationNumber}) and all related records will be permanently removed from MyVeel. This cannot be undone.`,
      confirmLabel: 'Delete vehicle',
      danger: true,
    };
  })();

  return (
    <div className="mx-auto w-full max-w-6xl">
      <PageHeader
        title="Admin Console"
        subtitle="Platform-wide overview of accounts, vehicles and garage activity."
        actions={
          <Badge tone="yellow">
            <Shield className="h-3 w-3" /> Administrator
          </Badge>
        }
      />

      {error && <div className="mb-4"><ErrorState message={error} onRetry={load} /></div>}

      {loading ? (
        <LoadingBlock label="Loading admin console…" />
      ) : overview ? (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
              label="Total users"
              value={formatNumber(overview.stats.totalUsers)}
              hint={`${overview.stats.totalAdmins} admin${overview.stats.totalAdmins === 1 ? '' : 's'}`}
              icon={<Users className="h-5 w-5" />}
            />
            <StatCard
              label="Vehicles"
              value={formatNumber(overview.stats.totalVehicles)}
              hint="Across all garages"
              tone="success"
              icon={<Car className="h-5 w-5" />}
            />
            <StatCard
              label="Verified accounts"
              value={formatNumber(overview.stats.verifiedUsers)}
              hint={
                overview.stats.totalUsers
                  ? `${Math.round((overview.stats.verifiedUsers / overview.stats.totalUsers) * 100)}% of users`
                  : 'No users yet'
              }
              tone="success"
              icon={<BadgeCheck className="h-5 w-5" />}
            />
            <StatCard
              label="Tracked records"
              value={formatNumber(overview.stats.totalRecords)}
              hint="Services, docs, fuel & more"
              icon={<Database className="h-5 w-5" />}
            />
          </div>

          <div className="mt-5">
            <Tabs
              tabs={[
                { key: 'overview', label: 'Overview' },
                { key: 'users', label: 'Users', count: users.length },
                { key: 'vehicles', label: 'Vehicles', count: vehicles.length },
              ]}
              active={tab}
              onChange={setTab}
            />
          </div>

          {tab === 'overview' && (
            <div className="mt-5 grid gap-5 lg:grid-cols-[1.25fr_1fr]">
              <Card>
                <CardHeader
                  title="Records by module"
                  subtitle="What the platform is tracking right now"
                  action={<Database className="h-4 w-4 text-primary-yellow" />}
                />
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={moduleData} margin={{ left: -18 }}>
                      <CartesianGrid stroke="#292D35" strokeDasharray="4 4" vertical={false} />
                      <XAxis
                        dataKey="name"
                        tick={{ fill: '#A0A5AF', fontSize: 10 }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <YAxis
                        tick={{ fill: '#A0A5AF', fontSize: 10 }}
                        axisLine={false}
                        tickLine={false}
                        allowDecimals={false}
                      />
                      <Tooltip {...tooltipStyle} formatter={(value) => [formatNumber(Number(value)), 'Records']} />
                      <Bar dataKey="value" fill="#FFD400" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </Card>

              <div className="space-y-5">
                <Card>
                  <CardHeader title="Newest accounts" subtitle="Latest registrations" />
                  {overview.recentUsers.length ? (
                    <div className="space-y-2">
                      {overview.recentUsers.map((user) => (
                        <div
                          key={user.id}
                          className="flex items-center gap-3 rounded-xl border border-border-subtle bg-bg-elevated/40 p-2.5"
                        >
                          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary-yellow/15 text-xs font-bold text-primary-yellow">
                            {initials(user.name)}
                          </span>
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-medium text-text-main">{user.name}</p>
                            <p className="truncate text-[11px] text-text-secondary">{user.email}</p>
                          </div>
                          <div className="text-right">
                            <Badge tone={user.role === 'ADMIN' ? 'yellow' : 'neutral'}>
                              {user.role === 'ADMIN' ? 'Admin' : 'User'}
                            </Badge>
                            <p className="mt-1 text-[10px] text-text-secondary">
                              {user._count.vehicles} vehicle{user._count.vehicles === 1 ? '' : 's'}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <EmptyState icon={<Users className="h-7 w-7" />} title="No accounts yet" />
                  )}
                </Card>

                <Card>
                  <CardHeader title="Fresh garages" subtitle="Most recently added vehicles" />
                  {overview.recentVehicles.length ? (
                    <div className="space-y-2">
                      {overview.recentVehicles.map((vehicle) => (
                        <div
                          key={vehicle.id}
                          className="flex items-center gap-3 rounded-xl border border-border-subtle bg-bg-elevated/40 p-2.5"
                        >
                          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/5 text-text-secondary">
                            <Car className="h-4 w-4" />
                          </span>
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-medium text-text-main">{vehicle.nickname}</p>
                            <p className="truncate text-[11px] text-text-secondary">
                              {vehicle.user?.name} · {vehicle.registrationNumber}
                            </p>
                          </div>
                          <span className="text-[11px] text-text-secondary">
                            {formatNumber(vehicle.currentOdometer)} km
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <EmptyState icon={<Car className="h-7 w-7" />} title="No vehicles yet" />
                  )}
                </Card>
              </div>
            </div>
          )}

          {tab === 'users' && (
            <Card className="mt-5">
              <CardHeader
                title="Registered users"
                subtitle="Read-only directory of every MyVeel account"
                action={<Badge tone="neutral">{filteredUsers.length} shown</Badge>}
              />
              <SearchInput
                value={userSearch}
                onChange={setUserSearch}
                placeholder="Search by name, email or mobile…"
                className="mb-4 max-w-md"
              />
              {filteredUsers.length ? (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[980px] border-collapse text-left text-sm">
                    <thead>
                      <tr className="border-b border-border-subtle text-[10px] uppercase tracking-[0.14em] text-text-secondary">
                        <th className="pb-3 pr-4 font-semibold">User</th>
                        <th className="pb-3 pr-4 font-semibold">Contact</th>
                        <th className="pb-3 pr-4 font-semibold">Role</th>
                        <th className="pb-3 pr-4 font-semibold">Verification</th>
                        <th className="pb-3 pr-4 font-semibold">Garage</th>
                        <th className="pb-3 pr-4 font-semibold">Joined</th>
                        <th className="pb-3 font-semibold">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredUsers.map((user) => (
                        <tr
                          key={user.id}
                          className="border-b border-border-subtle/60 last:border-0"
                        >
                          <td className="py-3 pr-4">
                            <div className="flex items-center gap-2.5">
                              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary-yellow/15 text-[11px] font-bold text-primary-yellow">
                                {initials(user.name)}
                              </span>
                              <span className="font-medium text-text-main">{user.name}</span>
                            </div>
                          </td>
                          <td className="py-3 pr-4">
                            <p className="text-xs text-text-main">{user.email}</p>
                            <p className="text-[11px] text-text-secondary">{user.mobile}</p>
                          </td>
                          <td className="py-3 pr-4">
                            <Badge tone={user.role === 'ADMIN' ? 'yellow' : 'neutral'}>
                              {user.role === 'ADMIN' ? 'Admin' : 'User'}
                            </Badge>
                          </td>
                          <td className="py-3 pr-4">
                            <div className="flex gap-1.5">
                              <Badge tone={user.isEmailVerified ? 'success' : 'warning'}>
                                <Mail className="h-3 w-3" />
                                {user.isEmailVerified ? 'Email' : 'Pending'}
                              </Badge>
                              <Badge tone={user.isMobileVerified ? 'success' : 'warning'}>
                                {user.isMobileVerified ? 'Mobile' : 'Mobile pending'}
                              </Badge>
                            </div>
                          </td>
                          <td className="py-3 pr-4 text-xs text-text-secondary">
                            {user._count.vehicles} vehicle{user._count.vehicles === 1 ? '' : 's'}
                          </td>
                          <td className="py-3 pr-4 text-xs text-text-secondary">
                            {formatDate(user.createdAt)}
                          </td>
                          <td className="py-3">
                            {user.id === currentUser?.id ? (
                              <Badge tone="yellow">You</Badge>
                            ) : (
                              <div className="flex flex-wrap items-center gap-1">
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  icon={<Shield className="h-3.5 w-3.5" />}
                                  onClick={() =>
                                    setPendingAction({
                                      kind: 'role',
                                      user,
                                      nextRole: user.role === 'ADMIN' ? 'USER' : 'ADMIN',
                                    })
                                  }
                                >
                                  {user.role === 'ADMIN' ? 'Make user' : 'Make admin'}
                                </Button>
                                {(!user.isEmailVerified || !user.isMobileVerified) && (
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    icon={<CheckCheck className="h-3.5 w-3.5" />}
                                    onClick={() =>
                                      setPendingAction({ kind: 'verify', user })
                                    }
                                  >
                                    Verify
                                  </Button>
                                )}
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="text-red-300 hover:bg-red-500/10 hover:text-red-200"
                                  aria-label={`Delete ${user.name}`}
                                  title="Delete user"
                                  icon={<Trash2 className="h-3.5 w-3.5" />}
                                  onClick={() =>
                                    setPendingAction({ kind: 'delete-user', user })
                                  }
                                />
                              </div>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <EmptyState
                  icon={<UserRound className="h-7 w-7" />}
                  title="No matching users"
                  description="Try a different name, email address or mobile number."
                />
              )}
            </Card>
          )}

          {tab === 'vehicles' && (
            <div className="mt-5">
              <Card>
                <CardHeader
                  title="All vehicles"
                  subtitle="Every vehicle registered across MyVeel"
                  action={<Badge tone="neutral">{filteredVehicles.length} shown</Badge>}
                />
                <SearchInput
                  value={vehicleSearch}
                  onChange={setVehicleSearch}
                  placeholder="Search by vehicle, registration or owner…"
                  className="mb-4 max-w-md"
                />
                {filteredVehicles.length ? (
                  <div className="grid gap-3 md:grid-cols-2">
                    {filteredVehicles.map((vehicle) => (
                      <div
                        key={vehicle.id}
                        className="rounded-xl border border-border-subtle bg-bg-elevated/40 p-4"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex min-w-0 items-center gap-3">
                            {vehicle.photo ? (
                              <img
                                src={vehicle.photo}
                                alt={vehicle.nickname}
                                className="h-12 w-12 rounded-lg object-cover"
                              />
                            ) : (
                              <span className="flex h-12 w-12 items-center justify-center rounded-lg bg-white/5 text-text-secondary">
                                <Car className="h-5 w-5" />
                              </span>
                            )}
                            <div className="min-w-0">
                              <p className="truncate text-sm font-semibold text-text-main">
                                {vehicle.nickname}
                              </p>
                              <p className="truncate text-[11px] text-text-secondary">
                                {vehicle.make} {vehicle.model} · {vehicle.year}
                              </p>
                              <p className="mt-0.5 font-mono text-[11px] font-medium tracking-wide text-primary-yellow">
                                {vehicle.registrationNumber}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-1">
                            <Badge tone="neutral">{capitalise(vehicle.vehicleType)}</Badge>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-8 w-8 text-red-300 hover:bg-red-500/10 hover:text-red-200"
                              aria-label={`Delete ${vehicle.nickname}`}
                              title="Delete vehicle"
                              icon={<Trash2 className="h-3.5 w-3.5" />}
                              onClick={() =>
                                setPendingAction({ kind: 'delete-vehicle', vehicle })
                              }
                            />
                          </div>
                        </div>

                        <div className="mt-3 grid grid-cols-2 gap-2 text-[11px] sm:grid-cols-4">
                          <div className="rounded-lg bg-bg-card px-2 py-1.5">
                            <p className="text-text-secondary">Odometer</p>
                            <p className="mt-0.5 font-medium text-text-main">
                              {formatNumber(vehicle.currentOdometer)} km
                            </p>
                          </div>
                          <div className="rounded-lg bg-bg-card px-2 py-1.5">
                            <p className="text-text-secondary">Services</p>
                            <p className="mt-0.5 font-medium text-text-main">
                              {vehicle._count?.serviceRecords ?? 0}
                            </p>
                          </div>
                          <div className="rounded-lg bg-bg-card px-2 py-1.5">
                            <p className="text-text-secondary">Documents</p>
                            <p className="mt-0.5 font-medium text-text-main">
                              {vehicle._count?.documents ?? 0}
                            </p>
                          </div>
                          <div className="rounded-lg bg-bg-card px-2 py-1.5">
                            <p className="text-text-secondary">Fuel logs</p>
                            <p className="mt-0.5 font-medium text-text-main">
                              {vehicle._count?.fuelLogs ?? 0}
                            </p>
                          </div>
                        </div>

                        <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-border-subtle/60 pt-3">
                          <p className="text-[11px] text-text-secondary">
                            Owner: <span className="text-text-main">{vehicle.user?.name}</span>
                            {vehicle.user?.email ? ` · ${vehicle.user.email}` : ''}
                          </p>
                          <Badge tone="info">
                            <Gauge className="h-3 w-3" /> {vehicle.fuelType}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <EmptyState
                    icon={<Wrench className="h-7 w-7" />}
                    title="No matching vehicles"
                    description="Try another nickname, registration number or owner."
                  />
                )}
              </Card>
            </div>
          )}
        </>
      ) : null}

      <ConfirmDialog
        open={Boolean(pendingAction)}
        title={pendingDialog.title}
        message={pendingDialog.message}
        confirmLabel={pendingDialog.confirmLabel}
        danger={pendingDialog.danger}
        loading={actionLoading}
        onConfirm={handleConfirmAction}
        onCancel={() => {
          if (!actionLoading) setPendingAction(null);
        }}
      />
    </div>
  );
}
