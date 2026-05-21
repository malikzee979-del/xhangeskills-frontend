'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Zap, Send, Star, User, Settings, MessageSquare, Bell, ShoppingBag } from 'lucide-react';

export default function SidebarLeft() {
  const pathname = usePathname();

  const menuItems = [
    {
      label: 'Dashboard',
      href: '/dashboard',
      icon: LayoutDashboard,
    },
    {
      label: 'My Skills',
      href: '/dashboard/skills',
      icon: Zap,
    },
    {
      label: 'Marketplace',
      href: '/marketplace',
      icon: ShoppingBag,
    },
    {
      label: 'Requests',
      href: '/dashboard/requests',
      icon: Send,
    },
    {
      label: 'Reviews',
      href: '/dashboard/reviews',
      icon: Star,
    },
    {
      label: 'Chat',
      href: '/dashboard/chat',
      icon: MessageSquare,
    },
    {
      label: 'Notifications',
      href: '/dashboard/notifications',
      icon: Bell,
    },
    {
      label: 'Profile',
      href: '/dashboard/profile',
      icon: User,
    },
    {
      label: 'Settings',
      href: '/dashboard/settings',
      icon: Settings,
    },
  ];

  const isActive = (href: string) => {
    if (href === '/dashboard') {
      return pathname === '/dashboard';
    }
    return pathname.startsWith(href);
  };

  return (
    <aside className="fixed left-0 top-16 w-64 h-[calc(100vh-4rem)] bg-white border-r border-gray-200 overflow-y-auto">
      <nav className="p-4 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition ${
                active
                  ? 'bg-blue-50 text-blue-600 font-semibold'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
