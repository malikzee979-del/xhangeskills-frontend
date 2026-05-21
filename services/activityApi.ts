import { apiClient, safeRequest } from './apiClient';

export type ActivityType = 'success' | 'warning' | 'info' | 'message';

export interface ActivityItem {
  id: string;
  type: ActivityType;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  actionLink?: string;
}

export interface RecentChat {
  id: string;
  otherUser: { name: string; avatar: string };
  lastMessage: string;
  updatedAt: string;
  hasUnread: boolean;
}

// ── localStorage persistence for notification read state ──────────────────
const STORAGE_KEY = 'xchange_read_notifs';

function loadReadIds(): Set<string> {
  if (typeof window === 'undefined') return new Set();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? new Set(JSON.parse(raw) as string[]) : new Set();
  } catch { return new Set(); }
}

function saveReadIds(ids: Set<string>) {
  if (typeof window === 'undefined') return;
  try {
    // Cap at 500 entries to avoid unbounded growth
    const arr = [...ids].slice(-500);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(arr));
  } catch {}
}

async function fetchList(url: string, params: Record<string, any> = {}): Promise<any[]> {
  const res: any = await safeRequest(
    apiClient.get(url, { params: { populate: '*', ...params } }),
    { data: [] }
  );
  return Array.isArray(res) ? res : (res?.data ?? []);
}

function otherParticipant(chat: any, uid: string) {
  const participants: any[] = chat.participants || [];
  return (
    participants.find((p: any) => String(p.id ?? p.user?.id ?? '') !== uid) ||
    participants[0] ||
    null
  );
}

export const activityApi = {
  // Persist one or more notification IDs as read in localStorage
  markRead(ids: string[]) {
    const current = loadReadIds();
    ids.forEach((id) => current.add(id));
    saveReadIds(current);
  },

  // Clear the entire read-state cache (e.g. on logout)
  clearReadCache() {
    if (typeof window !== 'undefined') localStorage.removeItem(STORAGE_KEY);
  },

  async getActivityFeed(userId: string | number): Promise<ActivityItem[]> {
    if (!userId) return [];
    const uid = String(userId);
    const readIds = loadReadIds();

    const [pendingReqs, receivedReviews, chats] = await Promise.all([
      fetchList('/service-requests', { type: 'received', status: 'pending' }).catch(() => []),
      fetchList('/reviews', { 'filters[reviewee][id][$eq]': uid }).catch(() => []),
      fetchList('/chats').catch(() => []),
    ]);

    const items: ActivityItem[] = [];

    for (const sr of pendingReqs) {
      const id = `req-${sr.id}`;
      const name = sr.requester?.displayName || sr.requester?.username || 'Someone';
      const skill = sr.skill?.title || 'a skill';
      items.push({
        id,
        type: 'warning',
        title: 'Skill Request',
        message: `${name} requested your "${skill}" skill`,
        // Persist read state via localStorage; resets naturally when request is no longer pending
        isRead: readIds.has(id),
        createdAt: sr.createdAt,
        actionLink: '/dashboard/requests',
      });
    }

    for (const rev of receivedReviews) {
      const id = `rev-${rev.id}`;
      const name = rev.reviewer?.displayName || rev.reviewer?.username || 'Someone';
      const skill = rev.skill?.title || 'a skill';
      items.push({
        id,
        type: 'success',
        title: 'New Review',
        message: `${name} gave you ${rev.rating}★ on "${skill}"`,
        // Reviews start as read; user can explicitly mark unread ones via localStorage
        isRead: true,
        createdAt: rev.createdAt,
        actionLink: '/dashboard/reviews',
      });
    }

    for (const chat of chats) {
      const id = `msg-${chat.id}`;
      const other = otherParticipant(chat, uid);
      const name = other?.displayName || other?.username || other?.user?.username || 'Someone';
      const msgs: any[] = chat.messages || [];
      const last = msgs[msgs.length - 1];
      if (last && String(last.sender?.id) !== uid) {
        // Use the DB isRead field if available — falls back to localStorage cache
        const dbRead = last.isRead === true;
        items.push({
          id,
          type: 'message',
          title: 'New Message',
          message: `${name}: ${String(last.content || '').slice(0, 70)}`,
          isRead: dbRead || readIds.has(id),
          createdAt: last.createdAt || chat.updatedAt,
          actionLink: '/dashboard/chat',
        });
      }
    }

    items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return items;
  },

  async getRecentChats(userId: string | number): Promise<RecentChat[]> {
    if (!userId) return [];
    const uid = String(userId);
    const readIds = loadReadIds();
    const chats = await fetchList('/chats').catch(() => []);
    return chats.slice(0, 5).map((chat: any) => {
      const other = otherParticipant(chat, uid);
      const msgs: any[] = chat.messages || [];
      const last = msgs[msgs.length - 1];
      const hasUnreadMsg = last && String(last.sender?.id) !== uid && last.isRead !== true;
      const chatNotifId = `msg-${chat.id}`;
      return {
        id: String(chat.id),
        otherUser: {
          name: other?.displayName || other?.username || other?.user?.username || 'User',
          avatar: other?.avatar || other?.user?.avatar || '',
        },
        lastMessage: last?.content || 'No messages yet',
        updatedAt: last?.createdAt || chat.updatedAt || new Date().toISOString(),
        hasUnread: hasUnreadMsg && !readIds.has(chatNotifId),
      };
    });
  },
};
