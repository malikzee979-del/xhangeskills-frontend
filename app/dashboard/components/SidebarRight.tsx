'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { CheckCircle, AlertCircle, MessageSquare, Info, Loader } from 'lucide-react';
import { activityApi, ActivityItem } from '@/services/activityApi';

const iconMap = {
  success: { Icon: CheckCircle, color: 'text-blue-600',   bg: 'bg-blue-50   border-blue-200'   },
  warning: { Icon: AlertCircle, color: 'text-orange-600', bg: 'bg-orange-50 border-orange-200' },
  info:    { Icon: Info,         color: 'text-gray-600',   bg: 'bg-gray-50   border-gray-200'   },
  message: { Icon: MessageSquare,color: 'text-emerald-600',bg: 'bg-emerald-50 border-emerald-200'},
} as const;

function relativeTime(iso: string) {
  const m = Math.round((Date.now() - new Date(iso).getTime()) / 60_000);
  if (m < 1)  return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.round(h / 24)}d ago`;
}

export default function SidebarRight() {
  const [activity, setActivity] = useState<ActivityItem[]>([]);
  const [loading, setLoading]   = useState(true);

  const load = useCallback(async () => {
    const uid = typeof window !== 'undefined'
      ? localStorage.getItem('userId') || sessionStorage.getItem('userId')
      : null;
    if (!uid) { setLoading(false); return; }
    try {
      const feed = await activityApi.getActivityFeed(uid);
      setActivity(feed.slice(0, 5));
    } catch {
      // silently ignore
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const pendingCount  = activity.filter((a) => a.type === 'warning').length;
  const reviewCount   = activity.filter((a) => a.type === 'success').length;
  const messageCount  = activity.filter((a) => a.type === 'message').length;
  const unreadCount   = activity.filter((a) => !a.isRead).length;

  return (
    <aside className="w-72 shrink-0 bg-white border-l border-gray-200 overflow-y-auto p-6 space-y-6 self-start sticky top-16 h-[calc(100vh-4rem)]">

      {/* Recent Activity */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
          {unreadCount > 0 && (
            <span className="text-xs bg-orange-100 text-orange-700 font-semibold px-2 py-0.5 rounded-full">
              {unreadCount} new
            </span>
          )}
        </div>

        {loading ? (
          <div className="flex justify-center py-6">
            <Loader className="w-5 h-5 animate-spin text-blue-400" />
          </div>
        ) : activity.length === 0 ? (
          <p className="text-sm text-gray-500 text-center py-4">No recent activity</p>
        ) : (
          <div className="space-y-3">
            {activity.map((item) => {
              const { Icon, color, bg } = iconMap[item.type] ?? iconMap.info;
              return (
                <a
                  key={item.id}
                  href={item.actionLink || '#'}
                  className={`block p-3 rounded-lg border transition hover:opacity-90 ${bg} ${!item.isRead ? 'ring-1 ring-blue-300' : ''}`}
                >
                  <div className="flex items-start gap-3">
                    <Icon className={`w-4 h-4 flex-shrink-0 mt-0.5 ${color}`} />
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm text-gray-900 truncate ${!item.isRead ? 'font-semibold' : ''}`}>
                        {item.title}
                      </p>
                      <p className="text-xs text-gray-600 mt-0.5 line-clamp-2">{item.message}</p>
                      <p className="text-xs text-gray-400 mt-1">{relativeTime(item.createdAt)}</p>
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
            className="block mt-3 text-center text-xs text-blue-600 hover:text-blue-700 font-semibold"
          >
            View all →
          </Link>
        )}
      </div>

      <div className="border-t border-gray-200" />

      {/* Notification Summary */}
      <div>
        <h3 className="font-semibold text-gray-900 mb-3">Summary</h3>
        <div className="bg-gray-50 p-3 rounded-lg space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-orange-500" />
              Pending requests
            </p>
            <span className={`text-sm font-bold ${pendingCount > 0 ? 'text-orange-600' : 'text-gray-400'}`}>
              {pendingCount}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-700 flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-blue-500" />
              New reviews
            </p>
            <span className={`text-sm font-bold ${reviewCount > 0 ? 'text-blue-600' : 'text-gray-400'}`}>
              {reviewCount}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-700 flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-emerald-500" />
              Messages
            </p>
            <span className={`text-sm font-bold ${messageCount > 0 ? 'text-emerald-600' : 'text-gray-400'}`}>
              {messageCount}
            </span>
          </div>
        </div>
      </div>

      {/* Quick Links */}
      <div>
        <h3 className="font-semibold text-gray-900 mb-3">Quick Links</h3>
        <div className="space-y-1">
          {[
            { href: '/dashboard/requests',     label: 'Skill Requests' },
            { href: '/dashboard/reviews',       label: 'My Reviews'    },
            { href: '/dashboard/chat',          label: 'Messages'      },
            { href: '/dashboard/notifications', label: 'Notifications' },
          ].map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className="block px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition"
            >
              {label}
            </Link>
          ))}
        </div>
      </div>
    </aside>
  );
}
