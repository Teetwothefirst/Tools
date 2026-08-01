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
    <html lang="en" className="dark">
      <body className="bg-slate-950 text-slate-100 antialiased min-h-screen">
        {children}
      </body>
    </html>
  );
}
