'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import Header from './components/Header';
import SidebarLeft from './components/SidebarLeft';
import SidebarRight from './components/SidebarRight';
import Footer from './components/Footer';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { isAuthenticated, loading } = useAuth();

  useEffect(() => {
    // Only redirect after auth check is complete
    if (!loading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, loading, router]);

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-bg">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-accent" />
          <p className="text-muted">Loading...</p>
        </div>
      </div>
    );
  }

  // Don't render dashboard content if not authenticated
  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-bg">
      {/* Header */}
      <Header />

      {/* Main Layout */}
      <div className="flex pt-16">
        {/* Left Sidebar */}
        <SidebarLeft />

        {/* Main Content */}
        <main className="ml-64 flex-1 overflow-y-auto">
          <div className="p-8">{children}</div>
          {/* Footer at bottom */}
          <Footer />
        </main>

        {/* Right Sidebar */}
        <SidebarRight />
      </div>
    </div>
  );
}
