'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { Sidebar } from '@/components/Sidebar';
import { MusicPlayer } from '@/components/MusicPlayer';

export function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLandingPage = pathname === '/';

  if (isLandingPage) {
    return <div className="w-full min-h-screen bg-background">{children}</div>;
  }

  return (
    <>
      <div className="flex min-h-screen">
        <Sidebar />
        {/* pt-14 on mobile to clear fixed top bar; lg:pl-64 for desktop sidebar */}
        <div className="flex-1 pt-14 lg:pt-0 lg:pl-64 pb-20 min-w-0">
          {children}
        </div>
      </div>
      <MusicPlayer />
    </>
  );
}
