'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Search, Bell, ChevronDown, User, LogOut, Check, Film, Tv, Plus } from 'lucide-react';
import { useProfileStore } from '@/stores/useProfileStore';

export const Navbar: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const router = useRouter();
  const { activeProfile } = useProfileStore();

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-colors duration-300 ${
        isScrolled ? 'glass-nav py-3' : 'bg-gradient-to-b from-black/80 via-black/40 to-transparent py-4'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        {/* Left Section: Brand & Links */}
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2 group">
            <span className="font-extrabold text-2xl tracking-wider text-netflix-red font-['Outfit'] group-hover:scale-105 transition-transform">
              STREAMFLIX
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-6 text-sm font-medium text-gray-300">
            <Link href="/" className="hover:text-white transition-colors">
              Home
            </Link>
            <Link href="/?category=shows" className="hover:text-white transition-colors">
              TV Shows
            </Link>
            <Link href="/?category=movies" className="hover:text-white transition-colors">
              Movies
            </Link>
            <Link href="/?category=latest" className="hover:text-white transition-colors">
              New & Popular
            </Link>
            <Link href="/?category=watchlist" className="hover:text-white transition-colors">
              My List
            </Link>
          </div>
        </div>

        {/* Right Section: Search, Profile & Actions */}
        <div className="flex items-center gap-5">
          {/* Search Input */}
          <form onSubmit={handleSearchSubmit} className="relative flex items-center">
            {isSearchOpen ? (
              <div className="flex items-center bg-black/70 border border-white/20 rounded-full px-3 py-1.5 transition-all w-48 sm:w-64">
                <Search className="w-4 h-4 text-gray-400 mr-2 shrink-0" />
                <input
                  type="text"
                  placeholder="Titles, people, genres..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-transparent border-none text-white text-xs focus:outline-none w-full"
                  autoFocus
                />
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setIsSearchOpen(true)}
                className="text-gray-300 hover:text-white transition-colors p-1"
                aria-label="Search"
              >
                <Search className="w-5 h-5" />
              </button>
            )}
          </form>

          {/* Notifications */}
          <button className="text-gray-300 hover:text-white transition-colors p-1 relative hidden sm:block">
            <Bell className="w-5 h-5" />
            <span className="absolute top-0 right-0 w-2 h-2 bg-netflix-red rounded-full"></span>
          </button>

          {/* Profile Selector */}
          <div className="relative">
            <button
              onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
              className="flex items-center gap-2 group focus:outline-none"
            >
              <img
                src={activeProfile?.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'}
                alt={activeProfile?.name || 'Profile'}
                className="w-8 h-8 rounded-md object-cover border border-white/20 group-hover:border-netflix-red transition-all"
              />
              <ChevronDown className="w-4 h-4 text-gray-300 group-hover:text-white transition-transform duration-200" />
            </button>

            {/* Dropdown Menu */}
            {isProfileMenuOpen && (
              <div className="absolute right-0 mt-3 w-56 bg-black/90 border border-white/10 rounded-lg shadow-2xl py-2 z-50 backdrop-blur-md">
                <div className="px-4 py-2 border-b border-white/10">
                  <p className="text-xs text-gray-400">Current Profile</p>
                  <p className="text-sm font-semibold text-white truncate">{activeProfile?.name || 'Alex'}</p>
                </div>

                <Link
                  href="/profiles"
                  className="flex items-center gap-3 px-4 py-2.5 text-xs text-gray-300 hover:bg-white/10 hover:text-white transition-colors"
                  onClick={() => setIsProfileMenuOpen(false)}
                >
                  <User className="w-4 h-4 text-netflix-red" />
                  Switch Profiles
                </Link>

                <div className="border-t border-white/10 mt-1 pt-1">
                  <button
                    onClick={() => {
                      setIsProfileMenuOpen(false);
                      router.push('/profiles');
                    }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-xs text-red-400 hover:bg-white/10 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out of StreamFlix
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};
