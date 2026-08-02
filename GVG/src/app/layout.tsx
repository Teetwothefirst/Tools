import React from 'react';
import './globals.css';

export const metadata = {
  title: 'NSIPA GVG Tracker - Post-Disbursement Impact & Monitoring',
  description: 'Independent civic-tech platform for tracking NSIPA Grant for Vulnerable Groups beneficiaries across 774 LGAs in Nigeria.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 antialiased min-h-screen transition-colors duration-300">
        {children}
      </body>
    </html>
  );
}
