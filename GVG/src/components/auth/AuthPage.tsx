'use client';

import React, { useState } from 'react';
import { UserRole } from '../../types/gvg';
import { ShieldCheck, Lock, Mail, Phone, ArrowRight, Sun, Moon, Bot } from 'lucide-react';

interface AuthPageProps {
  onLogin: (role: UserRole, userDetails: { name: string; emailOrPhone: string; lga?: string }) => void;
  themeMode: 'dark' | 'light';
  onToggleTheme: () => void;
}

export const AuthPage: React.FC<AuthPageProps> = ({ onLogin, themeMode, onToggleTheme }) => {
  const [selectedTab, setSelectedTab] = useState<'agency' | 'agent' | 'beneficiary'>('agency');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');

  const handleQuickLogin = (role: UserRole, name: string, contact: string, lga?: string) => {
    onLogin(role, { name, emailOrPhone: contact, lga });
  };

  const handleAgencySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin('admin', { name: email.split('@')[0] || 'Agency Admin', emailOrPhone: email });
  };

  const handleAgentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin('agent', { name: 'Field Agent', emailOrPhone: phone, lga: 'Kano Municipal' });
  };

  const handleBeneficiarySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin('beneficiary', { name: 'GVG Beneficiary', emailOrPhone: phone });
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col justify-between p-4 sm:p-6 transition-colors duration-300">
      {/* Top Header */}
      <header className="max-w-7xl w-full mx-auto flex items-center justify-between py-2">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center font-black text-xl text-white shadow-lg border border-emerald-400">
            GVG
          </div>
          <div>
            <span className="font-extrabold text-lg text-slate-900 dark:text-slate-100">NSIPA GVG Portal</span>
            <p className="text-xs text-slate-500 dark:text-slate-400">National Social Investment Programme Agency, Nigeria</p>
          </div>
        </div>

        {/* Theme Mode Toggle Button */}
        <button
          onClick={onToggleTheme}
          className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 transition shadow-sm flex items-center gap-2 text-xs font-bold"
        >
          {themeMode === 'dark' ? (
            <>
              <Sun className="w-4 h-4 text-amber-400" /> Light Theme
            </>
          ) : (
            <>
              <Moon className="w-4 h-4 text-indigo-600" /> Dark Theme
            </>
          )}
        </button>
      </header>

      {/* Main Login Card */}
      <div className="max-w-md w-full mx-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 my-auto transition-colors">
        {/* Title Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-emerald-50 dark:bg-emerald-950 border border-emerald-300 dark:border-emerald-700 text-emerald-600 dark:text-emerald-400 shadow-inner mb-2">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-slate-100">GVG Progress Tracker</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Post-Disbursement Beneficiary Monitoring & Impact Evaluation System
          </p>
        </div>

        {/* Tab Buttons */}
        <div className="grid grid-cols-3 gap-1 bg-slate-100 dark:bg-slate-950 p-1 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-bold">
          <button
            onClick={() => setSelectedTab('agency')}
            className={`py-2 rounded-lg transition ${
              selectedTab === 'agency' ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            🏛️ Staff
          </button>
          <button
            onClick={() => setSelectedTab('agent')}
            className={`py-2 rounded-lg transition ${
              selectedTab === 'agent' ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            🚶 Field Agent
          </button>
          <button
            onClick={() => setSelectedTab('beneficiary')}
            className={`py-2 rounded-lg transition ${
              selectedTab === 'beneficiary' ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            💬 Beneficiary
          </button>
        </div>

        {/* Agency Login Form */}
        {selectedTab === 'agency' && (
          <form onSubmit={handleAgencySubmit} className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">Official NSIPA Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3 top-3.5 text-slate-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin.gvg@nsipa.gov.ng"
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl pl-9 pr-4 py-2.5 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-emerald-500 font-medium"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3 top-3.5 text-slate-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl pl-9 pr-4 py-2.5 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-emerald-500 font-medium"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm py-3 rounded-xl shadow-lg flex items-center justify-center gap-2 transition"
            >
              Sign In to Agency Dashboard <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}

        {/* Agent Form */}
        {selectedTab === 'agent' && (
          <form onSubmit={handleAgentSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">Registered Field Phone Number</label>
              <div className="relative">
                <Phone className="w-4 h-4 absolute left-3 top-3.5 text-slate-400" />
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+234 803 123 4567"
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl pl-9 pr-4 py-2.5 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-emerald-500 font-mono font-medium"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm py-3 rounded-xl shadow-lg flex items-center justify-center gap-2 transition"
            >
              Open Mobile Field Agent App <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}

        {/* Beneficiary Form */}
        {selectedTab === 'beneficiary' && (
          <form onSubmit={handleBeneficiarySubmit} className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">Beneficiary Phone Number</label>
              <div className="relative">
                <Phone className="w-4 h-4 absolute left-3 top-3.5 text-slate-400" />
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="0803 999 1122"
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl pl-9 pr-4 py-2.5 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-emerald-500 font-mono font-medium"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm py-3 rounded-xl shadow-lg flex items-center justify-center gap-2 transition"
            >
              Access WhatsApp Self Check-in <Bot className="w-4 h-4" />
            </button>
          </form>
        )}

        {/* One-Click Presets */}
        <div className="border-t border-slate-200 dark:border-slate-800 pt-4 space-y-2">
          <div className="text-[11px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider text-center">
            ⚡ Quick Demo One-Click Access
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              onClick={() => handleQuickLogin('super_admin', 'Director General (NSIPA)', 'superadmin@nsipa.gov.ng')}
              className="bg-slate-50 dark:bg-slate-950 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 p-2.5 rounded-xl text-left transition group"
            >
              <div className="font-bold text-slate-800 dark:text-slate-200 group-hover:text-emerald-600 dark:group-hover:text-emerald-400">
                👑 Super Admin
              </div>
              <div className="text-[10px] text-slate-500">Full System & Roles</div>
            </button>

            <button
              onClick={() => handleQuickLogin('admin', 'Kano State Admin', 'kano.admin@nsipa.gov.ng')}
              className="bg-slate-50 dark:bg-slate-950 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 p-2.5 rounded-xl text-left transition group"
            >
              <div className="font-bold text-slate-800 dark:text-slate-200 group-hover:text-emerald-600 dark:group-hover:text-emerald-400">
                🛡️ Agency Admin
              </div>
              <div className="text-[10px] text-slate-500">Imports & Triage</div>
            </button>

            <button
              onClick={() => handleQuickLogin('agent', 'Aminu Bello (Agent)', '+2348031234567', 'Kano Municipal')}
              className="bg-slate-50 dark:bg-slate-950 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 p-2.5 rounded-xl text-left transition group"
            >
              <div className="font-bold text-slate-800 dark:text-slate-200 group-hover:text-emerald-600 dark:group-hover:text-emerald-400">
                🚶 LGA Agent
              </div>
              <div className="text-[10px] text-slate-500">Mobile Form (&lt; 2 min)</div>
            </button>

            <button
              onClick={() => handleQuickLogin('beneficiary', 'Fatima Abubakar', '+2348039991122')}
              className="bg-slate-50 dark:bg-slate-950 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 p-2.5 rounded-xl text-left transition group"
            >
              <div className="font-bold text-slate-800 dark:text-slate-200 group-hover:text-emerald-600 dark:group-hover:text-emerald-400">
                💬 Beneficiary
              </div>
              <div className="text-[10px] text-slate-500">WhatsApp 1-2-3 Bot</div>
            </button>
          </div>
        </div>
      </div>

      <footer className="text-center text-xs text-slate-400 dark:text-slate-500 py-2">
        Protected under NSIPA Civic-Tech Data Protection Guidelines • Federal Republic of Nigeria
      </footer>
    </div>
  );
};
