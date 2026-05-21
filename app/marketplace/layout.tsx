import { Suspense } from 'react';
import Header from '@/app/dashboard/components/Header';
import SidebarLeft from '@/app/dashboard/components/SidebarLeft';
import SidebarRight from '@/app/dashboard/components/SidebarRight';

export default function MarketplaceLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="flex pt-16">
        <SidebarLeft />
        <main className="ml-64 flex-1 min-w-0 overflow-y-auto">
          <div className="p-8">
            <Suspense fallback={
              <div className="flex items-center justify-center py-16">
                <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
              </div>
            }>
              {children}
            </Suspense>
          </div>
        </main>
        <SidebarRight />
      </div>
    </div>
  );
}
