import Header from '@/app/dashboard/components/Header';
import SidebarLeft from '@/app/dashboard/components/SidebarLeft';
import SidebarRight from '@/app/dashboard/components/SidebarRight';

export default function SkillsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="flex pt-16">
        <SidebarLeft />
        <main className="ml-64 flex-1 min-w-0 overflow-y-auto">
          <div className="p-8">
            {children}
          </div>
        </main>
        <SidebarRight />
      </div>
    </div>
  );
}
