import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  BadgeCheck,
  Bell,
  CalendarDays,
  Car,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CreditCard,
  Disc3,
  FileText,
  FolderLock,
  Fuel,
  Gauge,
  LayoutDashboard,
  LogOut,
  MapPin,
  Menu,
  Search,
  Settings,
  ShieldCheck,
  Siren,
  UserRound,
  Wrench,
  X,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useVehicles } from '../context/VehicleContext';
import { api } from '../lib/api';
import { initials, formatNumber } from '../lib/format';
import type { NotificationsResponse } from '../types';
import { cx } from './ui';

const navItems = [
  { label: 'Dashboard', path: '/', icon: LayoutDashboard },
  { label: 'My Garage', path: '/garage', icon: Car },
  { label: 'Service & Maintenance', path: '/services', icon: Wrench },
  { label: 'Odometer', path: '/odometer', icon: Gauge },
  { label: 'Documents Vault', path: '/documents', icon: FolderLock },
  { label: 'Insurance', path: '/insurance', icon: ShieldCheck },
  { label: 'Warranty Tracker', path: '/warranties', icon: BadgeCheck },
  { label: 'Driving Licence', path: '/licence', icon: CreditCard },
  { label: 'Tyre & Battery', path: '/tyre-battery', icon: Disc3 },
  { label: 'Fuel & Expenses', path: '/expenses', icon: Fuel },
  { label: 'Nearby Services', path: '/nearby', icon: MapPin },
  { label: 'Care Calendar', path: '/calendar', icon: CalendarDays },
  { label: 'Emergency Help', path: '/emergency', icon: Siren },
  { label: 'Vehicle Reports', path: '/reports', icon: FileText },
  { label: 'Notifications', path: '/notifications', icon: Bell },
  { label: 'Settings', path: '/settings', icon: Settings },
];

function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <Link to="/" className="flex items-center gap-3">
      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-yellow text-black shadow-[0_0_28px_rgba(255,212,0,0.18)]">
        <Car className="h-5 w-5" strokeWidth={2.4} />
      </span>
      {!compact && (
        <span className="leading-none">
          <span className="block font-display text-xl font-extrabold tracking-[0.18em] text-text-main">
            MY<span className="text-primary-yellow">VEEL</span>
          </span>
          <span className="mt-1 block text-[10px] uppercase tracking-[0.22em] text-text-secondary">
            Smart Garage
          </span>
        </span>
      )}
    </Link>
  );
}

function NavList({
  collapsed,
  unread,
  onNavigate,
}: {
  collapsed: boolean;
  unread: number;
  onNavigate?: () => void;
}) {
  return (
    <nav className="flex flex-1 flex-col gap-1 overflow-y-auto px-2 py-3">
      {navItems.map((item) => {
        const Icon = item.icon;
        return (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === '/'}
            onClick={onNavigate}
            title={collapsed ? item.label : undefined}
            className={({ isActive }) =>
              cx(
                'group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition',
                collapsed && 'justify-center px-0',
                isActive
                  ? 'bg-primary-yellow/10 text-primary-yellow'
                  : 'text-text-secondary hover:bg-white/5 hover:text-text-main'
              )
            }
          >
            {({ isActive }) => (
              <>
                {isActive && !collapsed && (
                  <span className="absolute left-0 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-r bg-primary-yellow" />
                )}
                <Icon className="h-[18px] w-[18px] shrink-0" />
                {!collapsed && <span className="truncate">{item.label}</span>}
                {!collapsed && item.path === '/notifications' && unread > 0 && (
                  <span className="ml-auto rounded-full bg-primary-yellow px-1.5 py-0.5 text-[10px] font-bold text-black">
                    {unread}
                  </span>
                )}
                {collapsed && item.path === '/notifications' && unread > 0 && (
                  <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-primary-yellow" />
                )}
              </>
            )}
          </NavLink>
        );
      })}
    </nav>
  );
}

export default function Layout() {
  const { user, logout } = useAuth();
  const { vehicles, activeVehicleId, setActiveVehicleId } = useVehicles();
  const location = useLocation();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [unread, setUnread] = useState(user?.unreadNotificationsCount || 0);
  const searchRef = useRef<HTMLDivElement>(null);

  const currentNav = useMemo(() => {
    const path = location.pathname;
    const exact = navItems.find((item) => item.path === path);
    if (exact) return exact;
    return navItems.find((item) => item.path !== '/' && path.startsWith(item.path)) || navItems[0];
  }, [location.pathname]);

  useEffect(() => {
    setMobileOpen(false);
    setSearchOpen(false);
    setSearch('');
    setProfileOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!user) return;
    let active = true;
    const load = () =>
      api
        .get<NotificationsResponse>('/notifications')
        .then((data) => {
          if (active) setUnread(data.unreadCount);
        })
        .catch(() => undefined);
    load();
    const timer = window.setInterval(load, 60000);
    return () => {
      active = false;
      window.clearInterval(timer);
    };
  }, [user, location.pathname]);

  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setSearchOpen(false);
      }
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  const matches = search.trim()
    ? navItems.filter((item) => item.label.toLowerCase().includes(search.trim().toLowerCase()))
    : navItems.slice(0, 6);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="flex min-h-screen bg-bg-main text-text-main">
      <aside
        className={cx(
          'sticky top-0 hidden h-screen shrink-0 flex-col border-r border-border-subtle bg-bg-sidebar transition-all duration-200 lg:flex',
          collapsed ? 'w-[76px]' : 'w-[264px]'
        )}
      >
        <div className={cx('flex h-16 items-center border-b border-border-subtle px-4', collapsed && 'justify-center px-0')}>
          <Logo compact={collapsed} />
        </div>
        <NavList collapsed={collapsed} unread={unread} />
        <div className="border-t border-border-subtle p-3">
          {!collapsed && (
            <div className="mb-3 rounded-xl border border-border-subtle bg-bg-card p-3">
              <p className="text-[10px] uppercase tracking-[0.16em] text-text-secondary">Signed in as</p>
              <p className="mt-1 truncate text-sm font-medium text-text-main">{user?.name}</p>
              <p className="truncate text-xs text-text-secondary">{user?.email}</p>
            </div>
          )}
          <button
            type="button"
            onClick={() => setCollapsed((value) => !value)}
            className="flex w-full items-center justify-center gap-2 rounded-lg border border-border-subtle px-3 py-2 text-xs text-text-secondary transition hover:border-primary-yellow/40 hover:text-text-main"
          >
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
            {!collapsed && 'Collapse sidebar'}
          </button>
        </div>
      </aside>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <aside className="relative flex h-full w-[280px] flex-col border-r border-border-subtle bg-bg-sidebar">
            <div className="flex h-16 items-center justify-between border-b border-border-subtle px-4">
              <Logo />
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                className="rounded-lg p-2 text-text-secondary hover:bg-white/5 hover:text-text-main"
                aria-label="Close navigation"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <NavList collapsed={false} unread={unread} onNavigate={() => setMobileOpen(false)} />
            <div className="border-t border-border-subtle p-4">
              <button
                type="button"
                onClick={handleLogout}
                className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-red-300 hover:bg-red-500/10"
              >
                <LogOut className="h-4 w-4" /> Logout
              </button>
            </div>
          </aside>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 border-b border-border-subtle bg-bg-main/85 backdrop-blur">
          <div className="flex h-16 items-center gap-3 px-4 sm:px-6">
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              className="rounded-lg p-2 text-text-secondary hover:bg-white/5 hover:text-text-main lg:hidden"
              aria-label="Open navigation"
            >
              <Menu className="h-5 w-5" />
            </button>

            <div className="min-w-0">
              <p className="text-[10px] uppercase tracking-[0.18em] text-text-secondary">MyVeel</p>
              <p className="truncate font-display text-sm font-semibold text-text-main">
                {currentNav.label}
              </p>
            </div>

            <div ref={searchRef} className="relative ml-auto hidden md:block">
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-secondary" />
                <input
                  value={search}
                  onChange={(event) => {
                    setSearch(event.target.value);
                    setSearchOpen(true);
                  }}
                  onFocus={() => setSearchOpen(true)}
                  placeholder="Search sections…"
                  className="h-9 w-56 rounded-xl border border-border-subtle bg-bg-card pl-9 pr-3 text-xs text-text-main placeholder:text-text-secondary/60 focus:border-primary-yellow/50 focus:outline-none lg:w-64"
                />
              </div>
              {searchOpen && (
                <div className="absolute right-0 top-11 z-40 w-72 overflow-hidden rounded-xl border border-border-subtle bg-bg-secondary p-1.5 shadow-2xl">
                  {matches.length === 0 ? (
                    <p className="px-3 py-4 text-center text-xs text-text-secondary">No sections found.</p>
                  ) : (
                    matches.map((item) => {
                      const Icon = item.icon;
                      return (
                        <button
                          key={item.path}
                          type="button"
                          onClick={() => {
                            navigate(item.path);
                            setSearchOpen(false);
                            setSearch('');
                          }}
                          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm text-text-secondary transition hover:bg-white/5 hover:text-text-main"
                        >
                          <Icon className="h-4 w-4" /> {item.label}
                        </button>
                      );
                    })
                  )}
                </div>
              )}
            </div>

            {vehicles.length > 0 && (
              <select
                value={activeVehicleId}
                onChange={(event) => setActiveVehicleId(event.target.value)}
                className="hidden h-9 max-w-[190px] rounded-xl border border-border-subtle bg-bg-card px-2.5 text-xs text-text-main focus:border-primary-yellow/50 focus:outline-none sm:block"
                aria-label="Active vehicle"
              >
                {vehicles.map((vehicle) => (
                  <option key={vehicle.id} value={vehicle.id}>
                    {vehicle.nickname} · {vehicle.registrationNumber}
                  </option>
                ))}
              </select>
            )}

            <Link
              to="/notifications"
              className="relative ml-auto rounded-xl border border-border-subtle bg-bg-card p-2 text-text-secondary transition hover:border-primary-yellow/40 hover:text-text-main sm:ml-0"
              aria-label="Notifications"
            >
              <Bell className="h-[18px] w-[18px]" />
              {unread > 0 && (
                <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary-yellow px-1 text-[10px] font-bold text-black">
                  {unread > 99 ? '99+' : unread}
                </span>
              )}
            </Link>

            <div className="relative">
              <button
                type="button"
                onClick={() => setProfileOpen((value) => !value)}
                className="flex items-center gap-2 rounded-xl border border-border-subtle bg-bg-card p-1.5 pr-2 transition hover:border-primary-yellow/40"
                aria-label="Profile menu"
              >
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary-yellow text-xs font-bold text-black">
                  {initials(user?.name)}
                </span>
                <ChevronDown className="h-3.5 w-3.5 text-text-secondary" />
              </button>
              {profileOpen && (
                <div className="absolute right-0 top-11 z-40 w-56 overflow-hidden rounded-xl border border-border-subtle bg-bg-secondary p-1.5 shadow-2xl">
                  <div className="border-b border-border-subtle px-3 py-2.5">
                    <p className="truncate text-sm font-medium text-text-main">{user?.name}</p>
                    <p className="truncate text-xs text-text-secondary">{user?.email}</p>
                    <p className="mt-1 text-[11px] text-text-secondary">
                      {vehicles.length} vehicle{vehicles.length === 1 ? '' : 's'} ·{' '}
                      {formatNumber(
                        vehicles.reduce((sum, vehicle) => sum + (vehicle.currentOdometer || 0), 0)
                      )}{' '}
                      km logged
                    </p>
                  </div>
                  <Link
                    to="/settings"
                    className="mt-1 flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-text-secondary transition hover:bg-white/5 hover:text-text-main"
                  >
                    <UserRound className="h-4 w-4" /> Account settings
                  </Link>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-red-300 transition hover:bg-red-500/10"
                  >
                    <LogOut className="h-4 w-4" /> Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        <main className="min-w-0 flex-1 px-4 py-6 sm:px-6 lg:px-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export function PageContainer({ children }: { children: ReactNode }) {
  return <div className="mx-auto w-full max-w-[1440px]">{children}</div>;
}
