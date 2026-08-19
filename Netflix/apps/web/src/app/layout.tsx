import './globals.css';
import React from 'react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'StreamFlix — Watch TV Shows Online, Watch Movies Online',
  description: 'StreamFlix is a production-grade streaming platform for movies, TV series, and high-definition video entertainment.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-netflix-black text-white antialiased min-h-screen">
        {children}
      </body>
    </html>
  );
}
