'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';
import { Settings, User, Key, Shield } from 'lucide-react';

export default function SettingsPage() {
  const router = useRouter();
  const { user, token, isAuthenticated, setAuth } = useAuthStore();
  const [name, setName] = useState(user?.name || '');
  const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl || '');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  React.useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, router]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setError('');

    try {
      // Stub settings route or update user entity structure
      // For phase 1 settings UI, we update local store and auth session profile info
      if (user) {
        setAuth({
          ...user,
          name: name || null,
          avatarUrl: avatarUrl || null,
        }, token || '');
        setMessage('Profile configuration updated successfully.');
      }
    } catch (err: any) {
      setError('An error occurred while updating profile.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-3xl mx-auto space-y-8">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-primary/10 text-primary">
          <Settings className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground text-sm">Configure your personal preferences and profile settings.</p>
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl p-6">
        <form onSubmit={handleSaveProfile} className="space-y-6">
          <h3 className="text-lg font-medium border-b border-border pb-2 flex items-center gap-2">
            <User className="w-4 h-4 text-primary" /> Profile Settings
          </h3>

          {message && <div className="p-3 text-sm text-primary bg-primary/10 rounded-lg border border-primary/20">{message}</div>}
          {error && <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-lg border border-destructive/20">{error}</div>}

          <div className="space-y-2">
            <label className="text-sm font-medium">Display Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. John Doe"
              className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Avatar Image URL</label>
            <input
              type="text"
              value={avatarUrl}
              onChange={(e) => setAvatarUrl(e.target.value)}
              placeholder="e.g. https://domain.com/avatar.jpg"
              className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-primary text-primary-foreground font-medium text-sm rounded-lg hover:opacity-90 transition disabled:opacity-50"
          >
            {loading ? 'Saving...' : 'Save Settings'}
          </button>
        </form>
      </div>

      <div className="bg-card border border-border rounded-xl p-6 space-y-4">
        <h3 className="text-lg font-medium border-b border-border pb-2 flex items-center gap-2">
          <Shield className="w-4 h-4 text-primary" /> Account Role info
        </h3>
        <p className="text-sm text-muted-foreground">
          Your current account role is <span className="font-semibold text-foreground">{user?.role}</span>.
        </p>
      </div>
    </div>
  );
}
