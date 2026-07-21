import { useEffect, useState } from 'react';
import { BaseCard } from '../../../components/ui/BaseCard';
import { BaseLoader } from '../../../components/ui/BaseLoader';
import { EmptyState } from '../../../components/ui/EmptyState';
import { platformNotificationsApi, PlatformNotification } from '../api/platformNotificationsApi';
import { Bell, Info, AlertTriangle, CheckCircle, ShieldAlert, Check } from 'lucide-react';

export function PlatformNotificationsPage() {
  const [notifications, setNotifications] = useState<PlatformNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [unreadOnly, setUnreadOnly] = useState(false);

  useEffect(() => {
    fetchNotifications();
  }, [unreadOnly]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const data = await platformNotificationsApi.getNotifications(50, 0, unreadOnly);
      setNotifications(data.items);
    } catch (error) {
      console.error('Failed to fetch notifications', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (id: string) => {
    try {
      await platformNotificationsApi.markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
      );
    } catch (error) {
      console.error('Failed to mark notification as read', error);
    }
  };

  const getIconForType = (type: string) => {
    switch (type) {
      case 'INFO':
        return <Info className="text-blue-500" size={20} />;
      case 'WARNING':
        return <AlertTriangle className="text-yellow-500" size={20} />;
      case 'ALERT':
        return <ShieldAlert className="text-red-500" size={20} />;
      case 'SUCCESS':
        return <CheckCircle className="text-green-500" size={20} />;
      default:
        return <Bell className="text-gray-500" size={20} />;
    }
  };

  return (
    <div className="max-w-4xl space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-neutral-primary-light)] dark:text-[var(--color-neutral-primary-dark)]">
            Notification Center
          </h1>
          <p className="text-sm text-[var(--color-neutral-muted-light)] dark:text-[var(--color-neutral-muted-dark)] mt-1">
            Stay updated on important platform events and alerts.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setUnreadOnly(!unreadOnly)}
            className={`px-4 py-2 text-sm font-medium rounded-xl border transition-colors ${
              unreadOnly
                ? 'bg-blue-50 border-blue-200 text-blue-700 dark:bg-blue-900/30 dark:border-blue-800 dark:text-blue-400'
                : 'bg-white border-zinc-200 text-zinc-700 hover:bg-zinc-50 dark:bg-zinc-900 dark:border-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-800'
            }`}
          >
            Unread Only
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {loading ? (
          <BaseLoader />
        ) : notifications.length === 0 ? (
          <BaseCard>
            <EmptyState
              icon={Bell}
              title="All Caught Up"
              description="You have no notifications matching the selected filters."
            />
          </BaseCard>
        ) : (
          notifications.map((notification) => (
            <BaseCard
              key={notification.id}
              className={`transition-all duration-200 ${
                !notification.is_read
                  ? 'border-l-4 border-l-blue-500 dark:bg-zinc-900'
                  : 'opacity-70'
              }`}
            >
              <div className="flex items-start gap-4">
                <div className="mt-1 shrink-0 p-2 bg-zinc-100 dark:bg-zinc-800 rounded-lg">
                  {getIconForType(notification.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="text-sm font-semibold text-[var(--color-neutral-primary-light)] dark:text-[var(--color-neutral-primary-dark)]">
                        {notification.title}
                      </h3>
                      <p className="mt-1 text-sm text-[var(--color-neutral-muted-light)] dark:text-[var(--color-neutral-muted-dark)]">
                        {notification.message}
                      </p>
                      <div className="mt-2 text-xs text-[var(--color-neutral-muted-light)] dark:text-[var(--color-neutral-muted-dark)]">
                        {new Date(notification.created_at).toLocaleString()}
                      </div>
                    </div>
                    {!notification.is_read && (
                      <button
                        onClick={() => handleMarkAsRead(notification.id)}
                        className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-emerald-700 bg-emerald-50 rounded-lg hover:bg-emerald-100 transition-colors dark:text-emerald-400 dark:bg-emerald-900/30 dark:hover:bg-emerald-900/50"
                      >
                        <Check size={14} />
                        Mark Read
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </BaseCard>
          ))
        )}
      </div>
    </div>
  );
}
