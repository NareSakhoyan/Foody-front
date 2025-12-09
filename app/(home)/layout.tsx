'use client';

import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';

type HomeLayoutProps = {
  children: React.ReactNode;
};

export default function HomeLayout({ children }: HomeLayoutProps) {
  return (
    <div className="min-h-screen">
      <Header />
      <div className="flex flex-col gap-6 px-4 py-6 md:flex-row md:items-start">
        <Sidebar />
        <div className="flex-1 min-w-0">{children}</div>
      </div>
    </div>
  );
}
