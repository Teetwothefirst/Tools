import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from '@/providers/providers';
import { Sidebar } from '@/components/Sidebar';
import { MusicPlayer } from '@/components/MusicPlayer';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Music Streaming Platform',
  description: 'Production-grade modular music streaming web app',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={inter.className}>
        <Providers>
          <div className="flex min-h-screen">
            <Sidebar />
            {/* pt-14 on mobile to clear fixed top bar; lg:pl-64 for desktop sidebar */}
            <div className="flex-1 pt-14 lg:pt-0 lg:pl-64 pb-20 min-w-0">
              {children}
            </div>
          </div>
          <MusicPlayer />
        </Providers>
      </body>
    </html>
  );
}
