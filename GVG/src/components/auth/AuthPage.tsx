'use client';

import React, { useState } from 'react';
import { UserRole } from '../../types/gvg';
import { ShieldCheck, Phone, Lock, ArrowRight, Sun, Moon, Sparkles, CheckCircle2, User, KeyRound } from 'lucide-react';
import { GVGLogo } from '../common/GVGLogo';

interface AuthPageProps {
  onLogin: (role: UserRole, userDetails: { name: string; emailOrPhone: string; lga?: string }) => void;
  themeMode: 'dark' | 'light';
  onToggleTheme: () => void;
}

export const AuthPage: React.FC<AuthPageProps> = ({ onLogin, themeMode, onToggleTheme }) => {
  const [authTab, setAuthTab] = useState<'staff' | 'agent' | 'whatsapp'>('staff');
  const [emailOrPhone, setEmailOrPhone] = useState('');
  const [passwordOrOtp, setPasswordOrOtp] = useState('');

  const handleStaffSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailOrPhone) return;
    const isSuperAdmin = emailOrPhone.toLowerCase().includes('super') || emailOrPhone.toLowerCase().includes('director');
    const role: UserRole = isSuperAdmin ? 'super_admin' : 'admin';

    onLogin(role, {
      name: isSuperAdmin ? 'Director General (NSIPA)' : 'NSIPA Admin User',
      emailOrPhone,
    });
  };

  const handleAgentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailOrPhone) return;

    onLogin('agent', {
      name: 'Aminu Bello (Agent)',
      emailOrPhone,
      lga: 'Kano Municipal',
    });
  };

  const handleWhatsAppSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin('beneficiary', {
      name: 'Fatima Abubakar',
      emailOrPhone: emailOrPhone || '+2348031234567',
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col justify-between font-sans transition-colors duration-300">
      {/* Header */}
      <header className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between border-b border-slate-200 dark:border-slate-800">
        <GVGLogo size="md" variant="full" />

        <button
          onClick={onToggleTheme}
          className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 transition"
          title="Toggle Theme"
        >
          {themeMode === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-600" />}
        </button>
      </header>

      {/* Main Login Card Container */}
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
          {/* Logo Badge Banner */}
          <div className="text-center space-y-2">
            <div className="flex justify-center">
              <GVGLogo size="lg" variant="icon" />
            </div>

            <h2 className="text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
              NSIPA GVG Portal Sign In
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Grant for Vulnerable Groups • Post-Disbursement Platform
            </p>
          </div>

          {/* Authentication Mode Tabs */}
          <div className="grid grid-cols-3 gap-1 bg-slate-100 dark:bg-slate-950 p-1 rounded-2xl border border-slate-200 dark:border-slate-800 text-xs font-bold">
            <button
              onClick={() => setAuthTab('staff')}
              className={`py-2 rounded-xl transition ${
                authTab === 'staff'
                  ? 'bg-white dark:bg-slate-800 text-[#008751] dark:text-emerald-400 shadow-sm'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              🛡️ Admin
            </button>
            <button
              onClick={() => setAuthTab('agent')}
              className={`py-2 rounded-xl transition ${
                authTab === 'agent'
                  ? 'bg-white dark:bg-slate-800 text-[#008751] dark:text-emerald-400 shadow-sm'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              🚶 Agent
            </button>
            <button
              onClick={() => setAuthTab('whatsapp')}
              className={`py-2 rounded-xl transition ${
                authTab === 'whatsapp'
                  ? 'bg-white dark:bg-slate-800 text-[#008751] dark:text-emerald-400 shadow-sm'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              💬 WhatsApp
            </button>
          </div>

          {/* TAB 1: STAFF / ADMIN LOGIN */}
          {authTab === 'staff' && (
            <form onSubmit={handleStaffSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">Official Email Address</label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                  <input
                    type="email"
                    value={emailOrPhone}
                    onChange={(e) => setEmailOrPhone(e.target.value)}
                    placeholder="admin@nsipa.gov.ng"
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl pl-9 pr-4 py-2.5 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-[#008751] font-medium"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">Password</label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                  <input
                    type="password"
                    value={passwordOrOtp}
                    onChange={(e) => setPasswordOrOtp(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl pl-9 pr-4 py-2.5 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-[#008751] font-medium"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-[#008751] hover:bg-[#006838] text-white font-bold text-xs py-3 rounded-xl shadow-lg transition flex items-center justify-center gap-2"
              >
                <ShieldCheck className="w-4 h-4" /> Authenticate Admin Credentials
              </button>
            </form>
          )}

          {/* TAB 2: FIELD AGENT PHONE LOGIN */}
          {authTab === 'agent' && (
            <form onSubmit={handleAgentSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">Registered Agent Phone Number</label>
                <div className="relative">
                  <Phone className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                  <input
                    type="text"
                    value={emailOrPhone}
                    onChange={(e) => setEmailOrPhone(e.target.value)}
                    placeholder="08031234567 (+234)"
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl pl-9 pr-4 py-2.5 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-[#008751] font-mono font-medium"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-[#008751] hover:bg-[#006838] text-white font-bold text-xs py-3 rounded-xl shadow-lg transition flex items-center justify-center gap-2"
              >
                <Phone className="w-4 h-4" /> Enter Mobile Agent Form Gateway
              </button>
            </form>
          )}

          {/* TAB 3: WHATSAPP BOT SELF CHECK-IN */}
          {authTab === 'whatsapp' && (
            <form onSubmit={handleWhatsAppSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">Beneficiary WhatsApp Number</label>
                <div className="relative">
                  <Phone className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                  <input
                    type="text"
                    value={emailOrPhone}
                    onChange={(e) => setEmailOrPhone(e.target.value)}
                    placeholder="+234 803 123 4567"
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl pl-9 pr-4 py-2.5 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-[#008751] font-mono font-medium"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-[#008751] hover:bg-[#006838] text-white font-bold text-xs py-3 rounded-xl shadow-lg transition flex items-center justify-center gap-2"
              >
                Open WhatsApp Bot Simulator &rarr;
              </button>
            </form>
          )}

          {/* Quick Demo Access Preset */}
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 text-center space-y-2">
            <span className="text-[10px] text-slate-400 uppercase font-black tracking-wider">
              ⚡ Or Instant 1-Click Demo Login
            </span>
            <div className="flex justify-center gap-2">
              <button
                type="button"
                onClick={() => onLogin('super_admin', { name: 'Director General (NSIPA)', emailOrPhone: 'superadmin@nsipa.gov.ng' })}
                className="bg-slate-100 dark:bg-slate-800 hover:bg-emerald-100 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold px-3 py-1.5 rounded-xl text-[11px] transition"
              >
                👑 Super Admin
              </button>

              <button
                type="button"
                onClick={() => onLogin('agent', { name: 'Aminu Bello (Agent)', emailOrPhone: '+2348031234567', lga: 'Kano Municipal' })}
                className="bg-slate-100 dark:bg-slate-800 hover:bg-emerald-100 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold px-3 py-1.5 rounded-xl text-[11px] transition"
              >
                🚶 Field Agent
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-4 text-center text-xs text-slate-400 border-t border-slate-200 dark:border-slate-800">
        NSIPA Grant for Vulnerable Groups (GVG) • Official Federal Portal
      </footer>
    </div>
  );
};
