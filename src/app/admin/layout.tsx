'use client';

import { AdminSidebar } from '@/components/ui/admin-sidebar';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Cookies from 'js-cookie';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();

  useEffect(() => {
    const userRole = Cookies.get('userRole');
    if (userRole !== 'admin') {
      router.push('/');
    }
  }, [router]);

  return (
    <div className="flex h-screen">
      <AdminSidebar />
      <main className="flex-1 overflow-y-auto bg-gray-100 p-8">
        {children}
      </main>
    </div>
  );
} 