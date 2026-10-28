import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Bell,
  BellRing,
  CheckCheck,
  Info,
  RefreshCw,
  Trash2,
  TriangleAlert,
} from 'lucide-react';
import { useToast } from '../context/ToastContext';
import { api } from '../lib/api';
import { capitalise, relativeTime } from '../lib/format';
import type { NotificationItem, NotificationsResponse } from '../types';
import {
  Badge,
  Button,
  Card,
  EmptyState,
  ErrorState,
  LoadingBlock,
  PageHeader,
  Select,
  StatCard,
  Tabs,
} from '../components/ui';

const CATEGORIES = ['ALL', 'INSURANCE', 'DOCUMENT', 'SERVICE', 'CARE'];

export default function NotificationsPage() {
  const { success } = useToast();
  const [data, setData] = useState<NotificationsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [category, setCategory] = useState('ALL');
  const [readFilter, setReadFilter] = useState('all');
  const [syncing, setSyncing] = useState(false);
  const [busyId, setBusyId] = useState('');

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const result = await api.get<NotificationsResponse>('/notifications', {
        category: category !== 'ALL' ? category : undefined,
        isRead: readFilter === 'unread' ? false : readFilter === 'read' ? true : undefined,
      });
      setData(result);
    } catch (err: any) {
      setError(err.message || 'Could not load notifications.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [category, readFilter]);

  const markRead = async (item: NotificationItem) => {
    if (item.isRead) return;
    setBusyId(item.id);
    try {
      await api.patch(`/notifications/${item.id}/read`);
      setData((current) =>
        current
          ? {
              ...current,
              notifications: current.notifications.map((notification) =>
                notification.id === item.id ? { ...notification, isRead: true } : notification
              ),
              unreadCount: Math.max(0, current.unreadCount - 1),
            }
          : current
      );
    } catch (err: any) {
      setError(err.message || 'Could not mark notification as read.');
    } finally {
      setBusyId('');
    }
  };

  const markAll = async () => {
    try {
      await api.patch('/notifications/read-all');
      success('All notifications marked as read.');
      await load();
    } catch (err: any) {
      setError(err.message || 'Could not mark all as read.');
    }
  };

  const dismiss = async (item: NotificationItem) => {
    setBusyId(item.id);
    try {
      await api.delete(`/notifications/${item.id}`);
      setData((current) =>
        current
          ? {
              ...current,
              notifications: current.notifications.filter((notification) => notification.id !== item.id),
              unreadCount: item.isRead ? current.unreadCount : Math.max(0, current.unreadCount - 1),
            }
          : current
      );
    } catch (err: any) {
      setError(err.message || 'Could not dismiss notification.');
    } finally {
      setBusyId('');
    }
  };

  const sync = async () => {
    setSyncing(true);
    try {
      const result = await api.post<{ createdCount: number }>('/notifications/sync');
      success(`${result.createdCount || 0} reminder${result.createdCount === 1 ? '' : 's'} synced.`);
      await load();
    } catch (err: any) {
      setError(err.message || 'Could not sync reminders.');
    } finally {
      setSyncing(false);
    }
  };

  const notifications = data?.notifications || [];
  const unread = notifications.filter((item) => !item.isRead).length;

  const iconFor = (item: NotificationItem) => {
    if (item.priority === 'URGENT') return <TriangleAlert className="h-4 w-4 text-red-300" />;
    if (item.priority === 'WARNING') return <BellRing className="h-4 w-4 text-amber-300" />;
    return <Info className="h-4 w-4 text-sky-300" />;
  };

  return (
    <div className="mx-auto w-full max-w-4xl">
      <PageHeader
        title="Notifications"
        subtitle="Insurance, document and service reminders generated from your garage data."
        actions={
          <>
            <Button variant="secondary" icon={<RefreshCw className="h-4 w-4" />} onClick={sync} loading={syncing}>
              Sync reminders
            </Button>
            <Button variant="secondary" icon={<CheckCheck className="h-4 w-4" />} onClick={markAll} disabled={!data?.unreadCount}>
              Mark all read
            </Button>
          </>
        }
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Unread" value={data?.unreadCount || 0} hint="Needs attention" tone={data?.unreadCount ? 'warning' : 'success'} icon={<Bell className="h-5 w-5" />} />
        <StatCard label="Showing" value={notifications.length} hint="Matching filters" />
        <StatCard label="Urgent" value={notifications.filter((item) => item.priority === 'URGENT').length} hint="Expired or due now" tone="danger" />
      </div>

      <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <Tabs
          tabs={[
            { key: 'all', label: 'All' },
            { key: 'unread', label: 'Unread' },
            { key: 'read', label: 'Read' },
          ]}
          active={readFilter}
          onChange={setReadFilter}
        />
        <Select value={category} onChange={(event) => setCategory(event.target.value)} className="sm:w-44">
          {CATEGORIES.map((item) => (
            <option key={item} value={item}>{item === 'ALL' ? 'All categories' : capitalise(item)}</option>
          ))}
        </Select>
      </div>

      {error && <div className="mt-4"><ErrorState message={error} onRetry={load} /></div>}

      {loading ? (
        <LoadingBlock label="Loading notifications…" />
      ) : (
        <Card className="mt-4">
          {notifications.length ? (
            <div className="space-y-2">
              {notifications.map((item) => (
                <div
                  key={item.id}
                  className={`flex items-start gap-3 rounded-xl border p-3.5 transition ${
                    item.isRead ? 'border-border-subtle bg-bg-elevated/20' : 'border-primary-yellow/25 bg-primary-yellow/[0.04]'
                  }`}
                >
                  <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-bg-elevated">
                    {iconFor(item)}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className={`text-sm font-semibold ${item.isRead ? 'text-text-secondary' : 'text-text-main'}`}>
                        {item.title}
                      </p>
                      <Badge tone={item.priority === 'URGENT' ? 'danger' : item.priority === 'WARNING' ? 'warning' : 'info'}>
                        {capitalise(item.priority)}
                      </Badge>
                      <span className="text-[10px] uppercase tracking-wider text-text-secondary">{capitalise(item.category)}</span>
                    </div>
                    <p className="mt-1 text-xs text-text-secondary">{item.message}</p>
                    <div className="mt-2 flex flex-wrap items-center gap-3">
                      <span className="text-[11px] text-text-secondary/70">{relativeTime(item.createdAt)}</span>
                      {item.vehicle && <span className="text-[11px] text-text-secondary/70">· {item.vehicle.nickname}</span>}
                      {item.linkUrl && (
                        <Link
                          to={item.linkUrl}
                          onClick={() => markRead(item)}
                          className="text-[11px] font-medium text-primary-yellow hover:text-primary-hover"
                        >
                          View
                        </Link>
                      )}
                      {!item.isRead && (
                        <button onClick={() => markRead(item)} disabled={busyId === item.id} className="text-[11px] text-text-secondary hover:text-text-main">
                          Mark read
                        </button>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => dismiss(item)}
                    disabled={busyId === item.id}
                    className="rounded-lg p-1.5 text-text-secondary transition hover:bg-red-500/10 hover:text-red-300 disabled:opacity-50"
                    aria-label="Dismiss notification"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              icon={<Bell className="h-7 w-7" />}
              title="No notifications"
              description="Sync reminders to generate alerts for expiring insurance, documents and service intervals."
              action={<Button onClick={sync} loading={syncing} icon={<RefreshCw className="h-4 w-4" />}>Sync reminders</Button>}
            />
          )}
        </Card>
      )}
    </div>
  );
}
