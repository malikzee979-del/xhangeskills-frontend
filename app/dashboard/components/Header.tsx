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
  success: "bg-blue-50 border-blue-200",
  warning: "bg-orange-50 border-orange-200",
  info: "bg-gray-50 border-gray-200",
  message: "bg-emerald-50 border-emerald-200",
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
    return () =>
      window.removeEventListener("avatarUpdated", handleAvatarUpdate);
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
    <header className="fixed top-0 left-0 right-0 h-16 bg-white border-b border-gray-200 shadow-sm z-50">
      <div className="flex items-center justify-between h-full px-6">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <div className="w-30 h-20 flex items-center justify-center">
            <img src="/logo.jfif" alt="Logo" />
          </div>
          <h1 className="text-xl font-bold text-gray-900">XchangeSkills</h1>
        </div>

        {/* Search */}
        <form
          className="flex-1 max-w-md mx-8 hidden md:block"
          onSubmit={(e) => {
            e.preventDefault();
            if (searchQuery.trim())
              router.push(
                `/marketplace?q=${encodeURIComponent(searchQuery.trim())}`,
              );
          }}
        >
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search skills..."
              className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
            />
          </div>
        </form>

        {/* Right actions */}
        <div className="flex items-center gap-4">
          {/* ── Notifications bell ── */}
          <div className="relative" ref={notifRef}>
            <button
              onClick={() => {
                setIsNotificationsOpen((o) => !o);
                setIsMessagesOpen(false);
                setIsProfileOpen(false);
              }}
              className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] bg-orange-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </button>

            {isNotificationsOpen && (
              <div className="absolute top-12 right-0 bg-white border border-gray-200 rounded-xl shadow-xl w-80 z-10">
                <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-gray-900 text-sm">
                      Notifications
                    </h3>
                    {unreadCount > 0 && (
                      <span className="text-xs bg-orange-100 text-orange-700 font-semibold px-2 py-0.5 rounded-full">
                        {unreadCount}
                      </span>
                    )}
                  </div>
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllNotifsRead}
                      className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 font-medium transition"
                      title="Mark all as read"
                    >
                      <CheckCircle className="w-3.5 h-3.5" />
                      Mark all read
                    </button>
                  )}
                </div>

                <div className="max-h-80 overflow-y-auto divide-y divide-gray-50">
                  {notifications.length === 0 ? (
                    <p className="text-sm text-gray-400 text-center py-8">
                      All caught up!
                    </p>
                  ) : (
                    notifications.map((item) => {
                      const Icon = activityIcon[item.type] ?? Info;
                      return (
                        <div
                          key={item.id}
                          className={`px-3 py-2.5 transition ${!item.isRead ? "bg-blue-50/50" : "hover:bg-gray-50"}`}
                        >
                          <div className="flex items-start gap-2">
                            <div
                              className={`p-1 rounded-md shrink-0 ${activityBg[item.type] ?? activityBg.info}`}
                            >
                              <Icon className="w-3.5 h-3.5 text-gray-600" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <a
                                href={item.actionLink || "#"}
                                onClick={() => markNotifRead(item.id)}
                              >
                                <p
                                  className={`text-xs text-gray-800 line-clamp-2 leading-snug ${!item.isRead ? "font-semibold" : ""}`}
                                >
                                  {item.message}
                                </p>
                              </a>
                              <p className="text-[11px] text-gray-400 mt-0.5">
                                {relativeTime(item.createdAt)}
                              </p>
                            </div>
                            <div className="flex flex-col items-end gap-1 shrink-0">
                              {!item.isRead && (
                                <span className="w-2 h-2 bg-blue-500 rounded-full" />
                              )}
                              <button
                                onClick={() => dismissNotif(item.id)}
                                className="text-gray-300 hover:text-gray-500 transition text-lg leading-none"
                                title="Dismiss"
                              >
                                ×
                              </button>
                            </div>
                          </div>
                          {!item.isRead && (
                            <button
                              onClick={() => markNotifRead(item.id)}
                              className="mt-1 ml-7 text-[11px] text-blue-500 hover:text-blue-700 font-medium flex items-center gap-0.5 transition"
                            >
                              <CheckCircle className="w-3 h-3" /> Mark as read
                            </button>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>

                <div className="px-3 py-2.5 border-t border-gray-100">
                  <Link
                    href="/dashboard/notifications"
                    onClick={() => setIsNotificationsOpen(false)}
                    className="block text-center text-xs text-blue-600 hover:text-blue-700 font-semibold"
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
              className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition"
            >
              <MessageCircle className="w-5 h-5" />
              {unreadMsgs > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] bg-blue-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1">
                  {unreadMsgs > 9 ? "9+" : unreadMsgs}
                </span>
              )}
            </button>

            {isMessagesOpen && (
              <div className="absolute top-12 right-0 bg-white border border-gray-200 rounded-xl shadow-xl w-80 z-10">
                <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-gray-900 text-sm">
                      Messages
                    </h3>
                    {unreadMsgs > 0 && (
                      <span className="text-xs bg-blue-100 text-blue-700 font-semibold px-2 py-0.5 rounded-full">
                        {unreadMsgs} unread
                      </span>
                    )}
                  </div>
                  {unreadMsgs > 0 && (
                    <button
                      onClick={markAllChatsRead}
                      disabled={markingAllRead}
                      className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 font-medium transition disabled:opacity-50"
                      title="Mark all as read"
                    >
                      <CheckCircle className="w-3.5 h-3.5" />
                      Mark all read
                    </button>
                  )}
                </div>
                <div className="max-h-72 overflow-y-auto divide-y divide-gray-50">
                  {recentChats.length === 0 ? (
                    <p className="text-sm text-gray-400 text-center py-8">
                      No conversations yet
                    </p>
                  ) : (
                    recentChats.map((chat) => {
                      const hasUnread =
                        chat.hasUnread && !readChatIds.has(chat.id);
                      return (
                        <div
                          key={chat.id}
                          className={`flex items-center gap-3 px-3 py-2.5 transition ${hasUnread ? "bg-blue-50/60" : "hover:bg-gray-50"}`}
                        >
                          <Link
                            href="/dashboard/chat"
                            onClick={() => setIsMessagesOpen(false)}
                            className="flex items-center gap-3 flex-1 min-w-0"
                          >
                            <div className="relative shrink-0">
                              <div className="w-9 h-9 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                                {chat.otherUser.name[0]?.toUpperCase() ?? "?"}
                              </div>
                              {hasUnread && (
                                <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-blue-500 rounded-full border-2 border-white" />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p
                                className={`text-xs truncate ${hasUnread ? "font-bold text-gray-900" : "font-semibold text-gray-900"}`}
                              >
                                {chat.otherUser.name}
                              </p>
                              <p className="text-xs text-gray-500 truncate mt-0.5">
                                {chat.lastMessage}
                              </p>
                            </div>
                          </Link>
                          <div className="flex flex-col items-end gap-1 shrink-0">
                            <p className="text-[11px] text-gray-400">
                              {relativeTime(chat.updatedAt)}
                            </p>
                            {hasUnread && (
                              <button
                                onClick={() => markOneChatRead(chat.id)}
                                className="text-[11px] text-blue-500 hover:text-blue-700 font-medium flex items-center gap-0.5 transition"
                              >
                                <CheckCircle className="w-3 h-3" /> Read
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
                <div className="px-3 py-2.5 border-t border-gray-100">
                  <Link
                    href="/dashboard/chat"
                    onClick={() => setIsMessagesOpen(false)}
                    className="block text-center text-xs text-blue-600 hover:text-blue-700 font-semibold"
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
              className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-emerald-500 rounded-full flex items-center justify-center text-white font-semibold hover:shadow-md transition cursor-pointer overflow-hidden"
              title={displayName}
            >
              {currentUser.avatar ? (
                <img
                  src={currentUser.avatar}
                  alt={displayName}
                  className="w-full h-full object-cover"
                />
              ) : (
                initials
              )}
            </button>

            {isProfileOpen && (
              <div className="absolute top-12 right-0 bg-white border border-gray-200 rounded-lg shadow-lg py-2 w-48">
                <div className="px-4 py-2 border-b border-gray-100 mb-1">
                  <p className="text-sm font-semibold text-gray-900 truncate">
                    {displayName}
                  </p>
                  <p className="text-xs text-gray-500 truncate">
                    {currentUser.username}
                  </p>
                </div>
                <Link
                  href="/dashboard/profile"
                  className="block px-4 py-2 text-gray-700 hover:bg-gray-100 text-sm"
                >
                  My Profile
                </Link>
                <Link
                  href="/dashboard/settings"
                  className="block px-4 py-2 text-gray-700 hover:bg-gray-100 text-sm"
                >
                  Settings
                </Link>
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 text-sm flex items-center gap-2"
                >
                  <LogOut className="w-4 h-4" />
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
