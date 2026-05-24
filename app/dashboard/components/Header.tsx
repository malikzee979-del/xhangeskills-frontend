"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  LogOut,
  Search,
  Bell,
  MessageCircle,
  CheckCircle,
  AlertCircle,
  Info,
} from "lucide-react";
import { useState, useRef, useEffect, useCallback } from "react";
import { activityApi, RecentChat } from "@/services/activityApi";
import { notificationApi, Notification } from "@/services/notificationApi";
import { chatApi } from "@/services/chatApi";

function relativeTime(iso: string) {
  const ms = Date.now() - new Date(iso).getTime();
  const m = Math.round(ms / 60_000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.round(h / 24)}d ago`;
}

const activityIcon: Record<string, typeof CheckCircle> = {
  success: CheckCircle,
  warning: AlertCircle,
  info: Info,
  message: MessageCircle,
};

const activityBg: Record<string, string> = {
  success: "bg-accent-soft",
  warning: "bg-warning-soft",
  info: "bg-surface-2",
  message: "bg-accent-2-soft",
};

export default function Header() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isMessagesOpen, setIsMessagesOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [recentChats, setRecentChats] = useState<RecentChat[]>([]);
  const [readChatIds, setReadChatIds] = useState<Set<string>>(new Set());
  const [markingAllRead, setMarkingAllRead] = useState(false);

  const markNotifRead = async (id: string) => {
    await notificationApi.markAsRead(id).catch(() => {});
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)),
    );
  };

  const markAllNotifsRead = async () => {
    await notificationApi.markAllAsRead().catch(() => {});
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  const dismissNotif = async (id: string) => {
    await notificationApi.delete(id).catch(() => {});
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const markAllChatsRead = async () => {
    if (markingAllRead || recentChats.length === 0) return;
    setMarkingAllRead(true);
    try {
      await Promise.all(
        recentChats.map((c) => chatApi.markChatAsRead(c.id).catch(() => {})),
      );
      setReadChatIds(new Set(recentChats.map((c) => c.id)));
    } finally {
      setMarkingAllRead(false);
    }
  };

  const markOneChatRead = async (chatId: string) => {
    try {
      await chatApi.markChatAsRead(chatId).catch(() => {});
      setReadChatIds((prev) => new Set([...prev, chatId]));
    } catch {}
  };

  const [currentUser, setCurrentUser] = useState({
    id: "",
    displayName: "",
    avatar: "",
    username: "",
  });

  const notifRef = useRef<HTMLDivElement>(null);
  const msgRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  // Read stored user identity synchronously on mount
  useEffect(() => {
    if (typeof window === "undefined") return;
    setCurrentUser({
      id: localStorage.getItem("userId") || sessionStorage.getItem("userId") || "",
      displayName: localStorage.getItem("userDisplayName") || sessionStorage.getItem("userDisplayName") || "",
      avatar: localStorage.getItem("userAvatar") || sessionStorage.getItem("userAvatar") || "",
      username: localStorage.getItem("userUsername") || sessionStorage.getItem("userUsername") || "",
    });

    // Listen for avatar updates from profile page
    const handleAvatarUpdate = (e: Event) => {
      const customEvent = e as CustomEvent<{ avatar: string }>;
      if (customEvent.detail?.avatar) {
        setCurrentUser((prev) => ({
          ...prev,
          avatar: customEvent.detail.avatar,
        }));
      }
    };
    window.addEventListener("avatarUpdated", handleAvatarUpdate);
    return () => window.removeEventListener("avatarUpdated", handleAvatarUpdate);
  }, []);

  // Fetch notifications + recent chats
  const refreshData = useCallback(async () => {
    const uid =
      typeof window !== "undefined"
        ? localStorage.getItem("userId") || sessionStorage.getItem("userId")
        : null;
    if (!uid) return;
    try {
      const [notifRes, chats] = await Promise.all([
        notificationApi.getAll(),
        activityApi.getRecentChats(uid),
      ]);
      const notifData = (notifRes as { data?: Notification[] })?.data ?? [];
      setNotifications(notifData.slice(0, 6));
      setRecentChats(chats.slice(0, 4));
    } catch {
      // silently ignore — header notifications are non-critical
    }
  }, []);

  useEffect(() => {
    refreshData();
    // Poll every 30 s so notification + message counts update without a page refresh
    const interval = setInterval(refreshData, 30_000);
    return () => clearInterval(interval);
  }, [refreshData]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node))
        setIsNotificationsOpen(false);
      if (msgRef.current && !msgRef.current.contains(e.target as Node))
        setIsMessagesOpen(false);
      if (profileRef.current && !profileRef.current.contains(e.target as Node))
        setIsProfileOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    sessionStorage.clear();
    window.location.href = "/login";
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;
  // Unread chats: DB isRead=false + not yet marked read locally this session
  const unreadMsgs = recentChats.filter(
    (c) => c.hasUnread && !readChatIds.has(c.id),
  ).length;

  const displayName = currentUser.displayName || currentUser.username || "U";
  const initials = displayName[0]?.toUpperCase() ?? "U";

  return (
    <header className="glass fixed left-0 right-0 top-0 z-50 h-16 border-b border-line shadow-sm">
      <div className="flex h-full items-center justify-between px-6">
        {/* Logo */}
        <div className="flex items-center gap-2.5">
          <div className="brand-mark flex h-10 w-10 items-center justify-center overflow-hidden rounded-xl">
            <img src="/logo.jfif" alt="Logo" className="h-full w-full object-cover" />
          </div>
          <h1 className="text-xl font-bold text-content">
            Xchange<span className="text-gradient">Skills</span>
          </h1>
        </div>

        {/* Search */}
        <form
          className="mx-8 hidden max-w-md flex-1 md:block"
          onSubmit={(e) => {
            e.preventDefault();
            if (searchQuery.trim())
              router.push(`/marketplace?q=${encodeURIComponent(searchQuery.trim())}`);
          }}
        >
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-subtle" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search skills..."
              className="field w-full py-2 pl-10 pr-4 text-content placeholder:text-subtle"
            />
          </div>
        </form>

        {/* Right actions */}
        <div className="flex items-center gap-3">
          {/* ── Notifications bell ── */}
          <div className="relative" ref={notifRef}>
            <button
              onClick={() => {
                setIsNotificationsOpen((o) => !o);
                setIsMessagesOpen(false);
                setIsProfileOpen(false);
              }}
              className="relative rounded-lg p-2 text-muted transition hover:bg-surface-2 hover:text-content"
            >
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-warning px-1 text-[10px] font-bold text-white">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </button>

            {isNotificationsOpen && (
              <div className="absolute right-0 top-12 z-10 w-80 rounded-2xl border border-line bg-bg-elevated shadow-lg">
                <div className="flex items-center justify-between border-b border-line px-4 py-3">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-semibold text-content">Notifications</h3>
                    {unreadCount > 0 && (
                      <span className="badge bg-warning-soft px-2 py-0.5 text-xs font-semibold text-warning">
                        {unreadCount}
                      </span>
                    )}
                  </div>
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllNotifsRead}
                      className="flex items-center gap-1 text-xs font-medium text-accent transition hover:opacity-80"
                      title="Mark all as read"
                    >
                      <CheckCircle className="h-3.5 w-3.5" />
                      Mark all read
                    </button>
                  )}
                </div>

                <div className="max-h-80 divide-y divide-line overflow-y-auto">
                  {notifications.length === 0 ? (
                    <p className="py-8 text-center text-sm text-subtle">All caught up!</p>
                  ) : (
                    notifications.map((item) => {
                      const Icon = activityIcon[item.type] ?? Info;
                      return (
                        <div
                          key={item.id}
                          className={`px-3 py-2.5 transition ${
                            !item.isRead ? "bg-accent-soft/40" : "hover:bg-surface-2"
                          }`}
                        >
                          <div className="flex items-start gap-2">
                            <div className={`shrink-0 rounded-md p-1 ${activityBg[item.type] ?? activityBg.info}`}>
                              <Icon className="h-3.5 w-3.5 text-muted" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <a href={item.actionLink || "#"} onClick={() => markNotifRead(item.id)}>
                                <p
                                  className={`line-clamp-2 text-xs leading-snug text-content ${
                                    !item.isRead ? "font-semibold" : ""
                                  }`}
                                >
                                  {item.message}
                                </p>
                              </a>
                              <p className="mt-0.5 text-[11px] text-subtle">{relativeTime(item.createdAt)}</p>
                            </div>
                            <div className="flex shrink-0 flex-col items-end gap-1">
                              {!item.isRead && <span className="h-2 w-2 rounded-full bg-accent" />}
                              <button
                                onClick={() => dismissNotif(item.id)}
                                className="text-lg leading-none text-subtle transition hover:text-muted"
                                title="Dismiss"
                              >
                                ×
                              </button>
                            </div>
                          </div>
                          {!item.isRead && (
                            <button
                              onClick={() => markNotifRead(item.id)}
                              className="ml-7 mt-1 flex items-center gap-0.5 text-[11px] font-medium text-accent transition hover:opacity-80"
                            >
                              <CheckCircle className="h-3 w-3" /> Mark as read
                            </button>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>

                <div className="border-t border-line px-3 py-2.5">
                  <Link
                    href="/dashboard/notifications"
                    onClick={() => setIsNotificationsOpen(false)}
                    className="block text-center text-xs font-semibold text-accent hover:opacity-80"
                  >
                    View All Notifications →
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* ── Messages ── */}
          <div className="relative" ref={msgRef}>
            <button
              onClick={() => {
                setIsMessagesOpen((o) => !o);
                setIsNotificationsOpen(false);
                setIsProfileOpen(false);
              }}
              className="relative rounded-lg p-2 text-muted transition hover:bg-surface-2 hover:text-content"
            >
              <MessageCircle className="h-5 w-5" />
              {unreadMsgs > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-accent px-1 text-[10px] font-bold text-on-accent">
                  {unreadMsgs > 9 ? "9+" : unreadMsgs}
                </span>
              )}
            </button>

            {isMessagesOpen && (
              <div className="absolute right-0 top-12 z-10 w-80 rounded-2xl border border-line bg-bg-elevated shadow-lg">
                <div className="flex items-center justify-between border-b border-line px-4 py-3">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-semibold text-content">Messages</h3>
                    {unreadMsgs > 0 && (
                      <span className="badge bg-accent-soft px-2 py-0.5 text-xs font-semibold text-accent">
                        {unreadMsgs} unread
                      </span>
                    )}
                  </div>
                  {unreadMsgs > 0 && (
                    <button
                      onClick={markAllChatsRead}
                      disabled={markingAllRead}
                      className="flex items-center gap-1 text-xs font-medium text-accent transition hover:opacity-80 disabled:opacity-50"
                      title="Mark all as read"
                    >
                      <CheckCircle className="h-3.5 w-3.5" />
                      Mark all read
                    </button>
                  )}
                </div>
                <div className="max-h-72 divide-y divide-line overflow-y-auto">
                  {recentChats.length === 0 ? (
                    <p className="py-8 text-center text-sm text-subtle">No conversations yet</p>
                  ) : (
                    recentChats.map((chat) => {
                      const hasUnread = chat.hasUnread && !readChatIds.has(chat.id);
                      return (
                        <div
                          key={chat.id}
                          className={`flex items-center gap-3 px-3 py-2.5 transition ${
                            hasUnread ? "bg-accent-soft/40" : "hover:bg-surface-2"
                          }`}
                        >
                          <Link
                            href="/dashboard/chat"
                            onClick={() => setIsMessagesOpen(false)}
                            className="flex min-w-0 flex-1 items-center gap-3"
                          >
                            <div className="relative shrink-0">
                              <div className="brand-mark flex h-9 w-9 items-center justify-center rounded-full text-sm font-semibold text-on-accent">
                                {chat.otherUser.name[0]?.toUpperCase() ?? "?"}
                              </div>
                              {hasUnread && (
                                <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full border-2 border-bg-elevated bg-accent" />
                              )}
                            </div>
                            <div className="min-w-0 flex-1">
                              <p
                                className={`truncate text-xs text-content ${
                                  hasUnread ? "font-bold" : "font-semibold"
                                }`}
                              >
                                {chat.otherUser.name}
                              </p>
                              <p className="mt-0.5 truncate text-xs text-subtle">{chat.lastMessage}</p>
                            </div>
                          </Link>
                          <div className="flex shrink-0 flex-col items-end gap-1">
                            <p className="text-[11px] text-subtle">{relativeTime(chat.updatedAt)}</p>
                            {hasUnread && (
                              <button
                                onClick={() => markOneChatRead(chat.id)}
                                className="flex items-center gap-0.5 text-[11px] font-medium text-accent transition hover:opacity-80"
                              >
                                <CheckCircle className="h-3 w-3" /> Read
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
                <div className="border-t border-line px-3 py-2.5">
                  <Link
                    href="/dashboard/chat"
                    onClick={() => setIsMessagesOpen(false)}
                    className="block text-center text-xs font-semibold text-accent hover:opacity-80"
                  >
                    Open Chat →
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* ── Profile / Logout ── */}
          <div className="relative" ref={profileRef}>
            <button
              onClick={() => {
                setIsProfileOpen((o) => !o);
                setIsNotificationsOpen(false);
                setIsMessagesOpen(false);
              }}
              className="flex h-10 w-10 cursor-pointer items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-[var(--accent)] to-[var(--accent-2)] font-semibold text-on-accent transition hover:shadow-md"
              title={displayName}
            >
              {currentUser.avatar ? (
                <img src={currentUser.avatar} alt={displayName} className="h-full w-full object-cover" />
              ) : (
                initials
              )}
            </button>

            {isProfileOpen && (
              <div className="absolute right-0 top-12 w-48 rounded-xl border border-line bg-bg-elevated py-2 shadow-lg">
                <div className="mb-1 border-b border-line px-4 py-2">
                  <p className="truncate text-sm font-semibold text-content">{displayName}</p>
                  <p className="truncate text-xs text-subtle">{currentUser.username}</p>
                </div>
                <Link
                  href="/dashboard/profile"
                  className="block px-4 py-2 text-sm text-muted transition hover:bg-surface-2 hover:text-content"
                >
                  My Profile
                </Link>
                <Link
                  href="/dashboard/settings"
                  className="block px-4 py-2 text-sm text-muted transition hover:bg-surface-2 hover:text-content"
                >
                  Settings
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-danger transition hover:bg-danger-soft"
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
