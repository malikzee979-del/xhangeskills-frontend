'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { CheckCircle, AlertCircle, MessageSquare, Info, Loader } from 'lucide-react';
import { activityApi, ActivityItem } from '@/services/activityApi';

const iconMap = {
  success: { Icon: CheckCircle, color: 'text-success', bg: 'bg-success-soft border-success/30' },
  warning: { Icon: AlertCircle, color: 'text-warning', bg: 'bg-warning-soft border-warning/30' },
  info: { Icon: Info, color: 'text-muted', bg: 'bg-surface-2 border-line' },
  message: { Icon: MessageSquare, color: 'text-accent-2', bg: 'bg-accent-2-soft border-accent-2/30' },
} as const;

function relativeTime(iso: string) {
  const m = Math.round((Date.now() - new Date(iso).getTime()) / 60_000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.round(h / 24)}d ago`;
}

export default function SidebarRight() {
  const [activity, setActivity] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const uid =
      typeof window !== 'undefined'
        ? localStorage.getItem('userId') || sessionStorage.getItem('userId')
        : null;
    if (!uid) {
      setLoading(false);
      return;
    }
    try {
      const feed = await activityApi.getActivityFeed(uid);
      setActivity(feed.slice(0, 5));
    } catch {
      // silently ignore
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const pendingCount = activity.filter((a) => a.type === 'warning').length;
  const reviewCount = activity.filter((a) => a.type === 'success').length;
  const messageCount = activity.filter((a) => a.type === 'message').length;
  const unreadCount = activity.filter((a) => !a.isRead).length;

  return (
    <aside className="sticky top-16 h-[calc(100vh-4rem)] w-72 shrink-0 self-start space-y-6 overflow-y-auto border-l border-line bg-surface p-6">
      {/* Recent Activity */}
      <div>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-content">Recent Activity</h2>
          {unreadCount > 0 && (
            <span className="badge bg-warning-soft px-2 py-0.5 text-xs font-semibold text-warning">
              {unreadCount} new
            </span>
          )}
        </div>

        {loading ? (
          <div className="flex justify-center py-6">
            <Loader className="h-5 w-5 animate-spin text-accent" />
          </div>
        ) : activity.length === 0 ? (
          <p className="py-4 text-center text-sm text-muted">No recent activity</p>
        ) : (
          <div className="space-y-3">
            {activity.map((item) => {
              const { Icon, color, bg } = iconMap[item.type] ?? iconMap.info;
              return (
                <a
                  key={item.id}
                  href={item.actionLink || '#'}
                  className={`block rounded-xl border p-3 transition hover:opacity-90 ${bg} ${
                    !item.isRead ? 'ring-1 ring-accent/40' : ''
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <Icon className={`mt-0.5 h-4 w-4 flex-shrink-0 ${color}`} />
                    <div className="min-w-0 flex-1">
                      <p className={`truncate text-sm text-content ${!item.isRead ? 'font-semibold' : ''}`}>
                        {item.title}
                      </p>
                      <p className="mt-0.5 line-clamp-2 text-xs text-muted">{item.message}</p>
                      <p className="mt-1 text-xs text-subtle">{relativeTime(item.createdAt)}</p>
                    </div>
                  </div>
                </a>
              );
            })}
          </div>
        )}

        {!loading && activity.length > 0 && (
          <Link
            href="/dashboard/notifications"
            className="mt-3 block text-center text-xs font-semibold text-accent hover:opacity-80"
          >
            View all →
          </Link>
        )}
      </div>

      <div className="border-t border-line" />

      {/* Notification Summary */}
      <div>
        <h3 className="mb-3 font-semibold text-content">Summary</h3>
        <div className="space-y-2 rounded-xl bg-surface-2 p-3">
          <div className="flex items-center justify-between">
            <p className="flex items-center gap-2 text-sm text-muted">
              <AlertCircle className="h-4 w-4 text-warning" />
              Pending requests
            </p>
            <span className={`text-sm font-bold ${pendingCount > 0 ? 'text-warning' : 'text-subtle'}`}>
              {pendingCount}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <p className="flex items-center gap-2 text-sm text-muted">
              <CheckCircle className="h-4 w-4 text-accent" />
              New reviews
            </p>
            <span className={`text-sm font-bold ${reviewCount > 0 ? 'text-accent' : 'text-subtle'}`}>
              {reviewCount}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <p className="flex items-center gap-2 text-sm text-muted">
              <MessageSquare className="h-4 w-4 text-accent-2" />
              Messages
            </p>
            <span className={`text-sm font-bold ${messageCount > 0 ? 'text-accent-2' : 'text-subtle'}`}>
              {messageCount}
            </span>
          </div>
        </div>
      </div>

      {/* Quick Links */}
      <div>
        <h3 className="mb-3 font-semibold text-content">Quick Links</h3>
        <div className="space-y-1">
          {[
            { href: '/dashboard/requests', label: 'Skill Requests' },
            { href: '/dashboard/reviews', label: 'My Reviews' },
            { href: '/dashboard/chat', label: 'Messages' },
            { href: '/dashboard/notifications', label: 'Notifications' },
          ].map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className="block rounded-lg px-3 py-2 text-sm text-muted transition hover:bg-surface-2 hover:text-content"
            >
              {label}
            </Link>
          ))}
        </div>
      </div>
    </aside>
  );
}
