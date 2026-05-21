'use client';

import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Search, Menu, X } from 'lucide-react';

export default function PublicNav() {
  const router = useRouter();
  const pathname = usePathname();
  const [q, setQ] = useState('');
  const [open, setOpen] = useState(false);

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  // Read auth state client-side only
  useEffect(() => {
    setIsLoggedIn(!!localStorage.getItem('authToken'));
  }, []);

  return (
    <header className="fixed top-0 inset-x-0 h-16 bg-white border-b border-gray-200 shadow-sm z-50">
      <div className="max-w-7xl mx-auto h-full flex items-center justify-between px-4 sm:px-6">
        {/* Logo */}
        <Link href="/marketplace" className="flex items-center gap-2 shrink-0">
          <img src="/logo.jfif" alt="XchangeSkills" className="h-8 w-8 rounded object-cover" />
          <span className="text-lg font-bold text-gray-900 hidden sm:block">XchangeSkills</span>
        </Link>

        {/* Search */}
        <form
          className="flex-1 max-w-sm mx-4 hidden md:block"
          onSubmit={(e) => {
            e.preventDefault();
            if (q.trim()) router.push(`/marketplace?q=${encodeURIComponent(q.trim())}`);
          }}
        >
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search skills..."
              className="w-full pl-9 pr-4 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
            />
          </div>
        </form>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-2">
          <Link
            href="/marketplace"
            className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
              pathname === '/marketplace' || pathname.startsWith('/skills')
                ? 'bg-blue-50 text-blue-600'
                : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
            }`}
          >
            Marketplace
          </Link>
          {isLoggedIn ? (
            <Link
              href="/dashboard"
              className="ml-1 px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition"
            >
              Go to Dashboard
            </Link>
          ) : (
            <>
              <Link href="/login" className="px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition">
                Sign In
              </Link>
              <Link
                href="/register"
                className="ml-1 px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition"
              >
                Get Started
              </Link>
            </>
          )}
        </nav>

        {/* Mobile hamburger */}
        <button className="md:hidden p-2 text-gray-600" onClick={() => setOpen((o) => !o)}>
          {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden bg-white border-t border-gray-200 px-4 pb-4 space-y-2">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              setOpen(false);
              if (q.trim()) router.push(`/marketplace?q=${encodeURIComponent(q.trim())}`);
            }}
            className="pt-3"
          >
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search skills..."
                className="w-full pl-9 pr-4 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg text-gray-900"
              />
            </div>
          </form>
          <Link href="/marketplace" onClick={() => setOpen(false)} className="block py-2 text-sm font-medium text-gray-700">
            Marketplace
          </Link>
          {isLoggedIn ? (
            <Link href="/dashboard" onClick={() => setOpen(false)} className="block py-2 text-sm font-semibold text-blue-600">
              Go to Dashboard
            </Link>
          ) : (
            <>
              <Link href="/login" onClick={() => setOpen(false)} className="block py-2 text-sm font-medium text-gray-700">Sign In</Link>
              <Link href="/register" onClick={() => setOpen(false)} className="block py-2 text-sm font-semibold text-blue-600">Get Started</Link>
            </>
          )}
        </div>
      )}
    </header>
  );
}
