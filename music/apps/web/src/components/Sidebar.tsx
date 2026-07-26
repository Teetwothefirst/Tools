'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Music, Home, Compass, Search, Heart, Settings, LogIn, Upload, ListMusic, Menu, X } from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';
import { useState } from 'react';

export function Sidebar() {
  const pathname = usePathname();
  const { isAuthenticated, logout, user } = useAuthStore();
  const [mobileOpen, setMobileOpen] = useState(false);

  const routes = [
    { label: 'Home', icon: Home, href: '/' },
    { label: 'Browse', icon: Compass, href: '/browse' },
    { label: 'Search', icon: Search, href: '/search' },
    { label: 'Playlists', icon: ListMusic, href: '/playlists', authRequired: true },
    { label: 'Library', icon: Heart, href: '/library', authRequired: true },
    { label: 'Settings', icon: Settings, href: '/settings', authRequired: true },
  ];

  const isAdmin = user?.role === 'ADMIN';

  const sidebarContent = (
    <>
      <div className="p-5 flex items-center justify-between border-b border-border">
        <div className="flex items-center gap-2">
          <Music className="w-6 h-6 text-primary flex-shrink-0" />
          <span className="font-bold text-lg">MusicPlatform</span>
        </div>
        {/* Close button on mobile */}
        <button
          onClick={() => setMobileOpen(false)}
          className="lg:hidden p-1 rounded-md hover:bg-muted text-muted-foreground transition"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <nav className="flex-1 px-3 py-5 space-y-1 overflow-y-auto">
        {routes.map((route) => {
          if (route.authRequired && !isAuthenticated) return null;
          const isActive = pathname === route.href;

          return (
            <Link
              key={route.href}
              href={route.href}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition ${
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'hover:bg-muted text-muted-foreground hover:text-foreground'
              }`}
            >
              <route.icon className="w-5 h-5 flex-shrink-0" />
              {route.label}
            </Link>
          );
        })}

        {isAuthenticated && isAdmin && (
          <Link
            href="/admin"
            onClick={() => setMobileOpen(false)}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition ${
              pathname === '/admin'
                ? 'bg-primary text-primary-foreground'
                : 'hover:bg-muted text-muted-foreground hover:text-foreground'
            }`}
          >
            <Upload className="w-5 h-5 flex-shrink-0" />
            Admin Panel
          </Link>
        )}
      </nav>

      <div className="p-4 border-t border-border">
        {isAuthenticated ? (
          <div className="flex flex-col gap-2">
            <div className="px-3 py-2">
              <p className="text-xs text-muted-foreground">Signed in as</p>
              <p className="text-sm font-medium truncate">{user?.name || user?.email}</p>
            </div>
            <button
              onClick={logout}
              className="w-full text-center px-4 py-2 bg-destructive/10 text-destructive border border-destructive/20 hover:bg-destructive hover:text-white rounded-lg text-sm font-medium transition"
            >
              Sign Out
            </button>
          </div>
        ) : (
          <Link
            href="/login"
            onClick={() => setMobileOpen(false)}
            className="flex items-center justify-center gap-2 w-full px-4 py-2 bg-primary text-primary-foreground hover:opacity-90 rounded-lg text-sm font-medium transition"
          >
            <LogIn className="w-4 h-4" />
            Sign In
          </Link>
        )}
      </div>
    </>
  );

  return (
    <>
      {/* Mobile top bar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-card border-b border-border px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Music className="w-5 h-5 text-primary" />
          <span className="font-bold">MusicPlatform</span>
        </div>
        <button
          onClick={() => setMobileOpen(true)}
          className="p-2 rounded-lg hover:bg-muted text-muted-foreground transition"
        >
          <Menu className="w-5 h-5" />
        </button>
      </div>

      {/* Mobile overlay backdrop */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/60 z-40 backdrop-blur-sm"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile slide-in drawer */}
      <aside
        className={`lg:hidden fixed top-0 left-0 h-screen w-72 bg-card border-r border-border z-50 flex flex-col transform transition-transform duration-300 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {sidebarContent}
      </aside>

      {/* Desktop fixed sidebar */}
      <aside className="hidden lg:flex flex-col w-64 bg-card border-r border-border h-screen fixed left-0 top-0 text-foreground z-40">
        {sidebarContent}
      </aside>
    </>
  );
}
