'use client';

import { useEffect, useState } from 'react';
import { Trash2, Filter, CheckCircle, AlertCircle, Info, MessageSquare, Loader } from 'lucide-react';
import { notificationApi, Notification } from '@/services/notificationApi';

const typeConfig = {
  request: { bgColor: 'bg-orange-50', borderColor: 'border-orange-200', iconColor: 'text-orange-600', icon: AlertCircle   },
  review:  { bgColor: 'bg-blue-50',   borderColor: 'border-blue-200',   iconColor: 'text-blue-600',   icon: CheckCircle   },
  message: { bgColor: 'bg-emerald-50',borderColor: 'border-emerald-200',iconColor: 'text-emerald-600',icon: MessageSquare },
  system:  { bgColor: 'bg-gray-50',   borderColor: 'border-gray-200',   iconColor: 'text-gray-600',   icon: Info          },
} as const;

const relativeTime = (iso: string) => {
  const ms = Date.now() - new Date(iso).getTime();
  const mins = Math.round(ms / 60_000);
  if (mins < 1)  return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24)  return `${hrs}h ago`;
  return `${Math.round(hrs / 24)}d ago`;
};

export default function NotificationsPage() {
  const [items, setItems]           = useState<Notification[]>([]);
  const [loading, setLoading]       = useState(true);
  const [fetchError, setFetchError] = useState(false);
  const [filterType, setFilterType] = useState<'all' | 'unread'>('all');

  const load = () => {
    setLoading(true);
    setFetchError(false);
    notificationApi.getAll()
      .then((res) => setItems((res as any)?.data ?? []))
      .catch(() => setFetchError(true))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
    const interval = setInterval(() => {
      notificationApi.getAll()
        .then((res) => setItems((res as any)?.data ?? []))
        .catch(() => {});
    }, 30_000);
    return () => clearInterval(interval);
  }, []);

  const markAsRead = async (id: string) => {
    await notificationApi.markAsRead(id).catch(() => {});
    setItems((prev) => prev.map((n) => n.id === id ? { ...n, isRead: true } : n));
  };

  const markAllAsRead = async () => {
    await notificationApi.markAllAsRead().catch(() => {});
    setItems((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  const remove = async (id: string) => {
    await notificationApi.delete(id).catch(() => {});
    setItems((prev) => prev.filter((n) => n.id !== id));
  };

  const displayed = filterType === 'unread' ? items.filter((n) => !n.isRead) : items;
  const unreadCount = items.filter((n) => !n.isRead).length;

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Notifications</h1>
          <p className="text-gray-600 mt-2">
            {unreadCount === 0 ? 'All caught up!' : `You have ${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}`}
          </p>
        </div>
        <button
          onClick={markAllAsRead}
          disabled={unreadCount === 0}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <CheckCircle className="w-4 h-4" />
          Mark all as read
        </button>
      </div>

      <div className="flex gap-4 mb-6">
        {(['all', 'unread'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setFilterType(t)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition ${
              filterType === t
                ? 'bg-blue-600 text-white'
                : 'bg-white border border-gray-200 text-gray-700 hover:border-gray-300'
            }`}
          >
            <Filter className="w-4 h-4" />
            {t === 'all' ? 'All Notifications' : `Unread${unreadCount > 0 ? ` (${unreadCount})` : ''}`}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-16">
          <Loader className="w-8 h-8 animate-spin text-blue-500" />
        </div>
      ) : fetchError ? (
        <div className="text-center py-12 bg-white border border-red-200 rounded-lg">
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-3" />
          <p className="text-gray-700 font-semibold">Failed to load notifications</p>
          <p className="text-gray-500 text-sm mt-1 mb-4">Check your connection or try again.</p>
          <button onClick={load} className="px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition">
            Retry
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {displayed.length === 0 ? (
            <div className="text-center py-12 bg-white border border-gray-200 rounded-lg">
              <CheckCircle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600 font-semibold">No notifications</p>
              <p className="text-gray-500 text-sm mt-1">
                {filterType === 'unread' ? "You've read everything" : "You're all caught up!"}
              </p>
            </div>
          ) : (
            displayed.map((item) => {
              const cfg = typeConfig[item.type] ?? typeConfig.system;
              const Icon = cfg.icon;
              return (
                <div
                  key={item.id}
                  className={`p-4 border rounded-lg transition ${cfg.bgColor} ${cfg.borderColor} ${!item.isRead ? 'ring-2 ring-blue-300' : ''}`}
                >
                  <div className="flex items-start gap-4">
                    <div className={`p-2 rounded-lg bg-white ${cfg.iconColor}`}>
                      <Icon className="w-5 h-5" />
                    </div>

                    <div className="flex-1">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className={`font-semibold text-gray-900 ${!item.isRead ? 'font-bold' : ''}`}>{item.title}</p>
                          <p className="text-sm text-gray-700 mt-1">{item.message}</p>
                          <p className="text-xs text-gray-500 mt-2">{relativeTime(item.createdAt)}</p>
                        </div>
                        {!item.isRead && <span className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0 mt-2" />}
                      </div>

                      <div className="flex items-center gap-3 mt-3 pt-3 border-t border-current border-opacity-10">
                        {item.actionLink && (
                          <a href={item.actionLink} className="text-sm font-semibold text-blue-600 hover:text-blue-700">
                            View
                          </a>
                        )}
                        {!item.isRead && (
                          <button
                            onClick={() => markAsRead(item.id)}
                            className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-100 text-blue-700 hover:bg-blue-200 transition"
                          >
                            <CheckCircle className="w-3 h-3" />
                            Mark as read
                          </button>
                        )}
                        <button
                          onClick={() => remove(item.id)}
                          className="text-sm font-semibold text-red-600 hover:text-red-700 flex items-center gap-1"
                        >
                          <Trash2 className="w-3 h-3" />
                          Dismiss
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
