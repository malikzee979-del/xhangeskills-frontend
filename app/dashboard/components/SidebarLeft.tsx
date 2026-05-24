'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Zap,
  Send,
  Star,
  User,
  Settings,
  MessageSquare,
  Bell,
  ShoppingBag,
} from 'lucide-react';

export default function SidebarLeft() {
  const pathname = usePathname();

  const menuItems = [
    { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { label: 'My Skills', href: '/dashboard/skills', icon: Zap },
    { label: 'Marketplace', href: '/marketplace', icon: ShoppingBag },
    { label: 'Requests', href: '/dashboard/requests', icon: Send },
    { label: 'Reviews', href: '/dashboard/reviews', icon: Star },
    { label: 'Chat', href: '/dashboard/chat', icon: MessageSquare },
    { label: 'Notifications', href: '/dashboard/notifications', icon: Bell },
    { label: 'Profile', href: '/dashboard/profile', icon: User },
    { label: 'Settings', href: '/dashboard/settings', icon: Settings },
  ];

  const isActive = (href: string) => {
    if (href === '/dashboard') {
      return pathname === '/dashboard';
    }
    return pathname.startsWith(href);
  };

  return (
    <aside className="fixed left-0 top-16 h-[calc(100vh-4rem)] w-64 overflow-y-auto border-r border-line bg-surface">
      <nav className="space-y-1.5 p-4">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`group relative flex items-center gap-3 rounded-xl px-4 py-3 transition ${
                active
                  ? 'bg-accent-soft font-semibold text-accent'
                  : 'text-muted hover:bg-surface-2 hover:text-content'
              }`}
            >
              {active && (
                <span className="absolute left-0 top-1/2 h-6 w-1 -translate-y-1/2 rounded-r-full bg-accent" />
              )}
              <Icon className="h-5 w-5" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
