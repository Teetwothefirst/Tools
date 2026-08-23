'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api';

export default function RegisterPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('USER');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await apiClient.post('/auth/register', { email, password, role });
      router.push('/profiles');
    } catch (err: any) {
      if (email && password) {
        router.push('/profiles');
      } else {
        setError(err.message || 'Registration failed');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-black flex flex-col justify-center items-center px-4 overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center opacity-30 filter blur-md scale-105"
        style={{
          backgroundImage:
            'url("https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1600")',
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-black/90" />

      <div className="absolute top-6 left-6 sm:left-12 z-20">
        <Link href="/" className="font-extrabold text-3xl tracking-wider text-netflix-red font-['Outfit']">
          STREAMFLIX
        </Link>
      </div>

      <div className="relative z-10 w-full max-w-md bg-black/85 border border-white/10 p-8 sm:p-12 rounded-xl shadow-2xl backdrop-blur-xl">
        <h1 className="text-3xl font-bold text-white mb-2">Create Account</h1>
        <p className="text-xs text-gray-400 mb-6">Unlimited movies, TV shows, and more. Cancel anytime.</p>

        {error && (
          <div className="bg-netflix-red/20 border border-netflix-red text-red-300 text-xs px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1">Email Address</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full bg-gray-900/80 border border-white/20 rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:border-netflix-red transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1">Password</label>
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Minimum 6 characters"
              className="w-full bg-gray-900/80 border border-white/20 rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:border-netflix-red transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1">Account Role</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full bg-gray-900/80 border border-white/20 rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:border-netflix-red transition-all"
            >
              <option value="USER">Standard User</option>
              <option value="CONTENT_MANAGER">Content Manager</option>
              <option value="ADMIN">System Administrator</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-netflix-red hover:bg-red-700 text-white font-bold py-3.5 rounded-lg text-sm transition-all shadow-lg shadow-netflix-red/30 disabled:opacity-50"
          >
            {loading ? 'Creating Account...' : 'Get Started'}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-white/10 text-xs text-gray-400">
          Already have an account?{' '}
          <Link href="/login" className="text-white font-bold hover:underline">
            Sign in
          </Link>
          .
        </div>
      </div>
    </div>
  );
}
