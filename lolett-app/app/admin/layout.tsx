import { redirect } from 'next/navigation';
import { isAdminAuthenticated } from '@/lib/admin/auth';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { AdminHeader } from '@/components/admin/AdminHeader';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'LOLETT Admin',
  robots: { index: false, follow: false },
};

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const authenticated = await isAdminAuthenticated();

  if (!authenticated) {
    redirect('/admin-login');
  }

  return (
    <div className="flex min-h-screen w-full bg-[#FDF5E6] print:bg-white print:block">
      <div className="print:hidden">
        <AdminSidebar />
      </div>
      <div className="flex flex-1 flex-col min-w-0">
        <div className="print:hidden">
          <AdminHeader />
        </div>
        <main className="flex-1 w-full p-6 overflow-auto print:p-0">{children}</main>
      </div>
    </div>
  );
}
