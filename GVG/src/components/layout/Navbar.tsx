'use client';

import React from 'react';
import { UserRole } from '../../types/gvg';
import { ShieldCheck, Wifi, WifiOff, RefreshCw, UserCheck, AlertTriangle, FileSpreadsheet, Activity, Sun, Moon, LogOut, User, Globe, Phone } from 'lucide-react';

interface NavbarProps {
  currentRole: UserRole;
  onRoleChange: (role: UserRole) => void;
  activeTab: string;
  onTabChange: (tab: string) => void;
  isOnline: boolean;
  offlineQueueCount: number;
  onSyncOfflineQueue: () => void;
  openEscalationsCount: number;
  themeMode: 'dark' | 'light';
  onToggleTheme: () => void;
  loggedInUser?: { name: string; emailOrPhone: string };
  onLogout: () => void;
  onGoToLanding: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentRole,
  onRoleChange,
  activeTab,
  onTabChange,
  isOnline,
  offlineQueueCount,
  onSyncOfflineQueue,
  openEscalationsCount,
  themeMode,
  onToggleTheme,
  loggedInUser,
  onLogout,
  onGoToLanding,
}) => {
  return (
    <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white sticky top-0 z-40 shadow-sm transition-colors duration-300">
      {/* Top Banner */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-wrap items-center justify-between gap-4">
        {/* Logo & Tagline */}
        <div className="flex items-center gap-3">
          <button
            onClick={onGoToLanding}
            className="w-10 h-10 rounded-xl bg-emerald-600 hover:bg-emerald-500 flex items-center justify-center font-black text-xl text-white shadow-md border border-emerald-400 transition"
            title="Return to GVG Overview Landing Page"
          >
            GVG
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-lg tracking-tight text-slate-900 dark:text-slate-100">
                NSIPA GVG Tracker
              </span>
              <span className="text-xs bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700/50 px-2 py-0.5 rounded-full font-bold">
                Nigeria Civic-Tech
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Grant for Vulnerable Groups • Support: +234 802 126 6483 | info@nsipa.gov.ng
            </p>
          </div>
        </div>

        {/* Status Indicators, Theme Toggle & User Account Pill */}
        <div className="flex items-center gap-3 flex-wrap">
          {/* Public Landing Link */}
          <button
            onClick={onGoToLanding}
            className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold transition"
          >
            <Globe className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> Public GVG Page
          </button>

          {/* Offline / Online Sync Badge */}
          <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs">
            {isOnline ? (
              <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-semibold">
                <Wifi className="w-3.5 h-3.5" /> Online Mode
              </span>
            ) : (
              <span className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400 font-semibold animate-pulse">
                <WifiOff className="w-3.5 h-3.5" /> Offline PWA
              </span>
            )}

            {offlineQueueCount > 0 && (
              <button
                onClick={onSyncOfflineQueue}
                className="ml-2 flex items-center gap-1 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold px-2 py-0.5 rounded-lg transition text-xs shadow-sm"
              >
                <RefreshCw className="w-3 h-3 animate-spin" />
                Sync {offlineQueueCount} Queued
              </button>
            )}
          </div>

          {/* Theme Switcher Button */}
          <button
            onClick={onToggleTheme}
            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 transition"
            title="Toggle Light / Dark Mode"
          >
            {themeMode === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-600" />}
          </button>

          {/* Role Switcher Select Pill */}
          <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700">
            <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <select
              value={currentRole}
              onChange={(e) => onRoleChange(e.target.value as UserRole)}
              className="bg-transparent text-slate-800 dark:text-slate-200 text-xs focus:outline-none font-bold cursor-pointer"
            >
              <option value="super_admin" className="bg-white dark:bg-slate-900">
                Super Admin
              </option>
              <option value="admin" className="bg-white dark:bg-slate-900">
                Agency Admin
              </option>
              <option value="agent" className="bg-white dark:bg-slate-900">
                LGA Field Agent
              </option>
              <option value="beneficiary" className="bg-white dark:bg-slate-900">
                Beneficiary WhatsApp Bot
              </option>
            </select>
          </div>

          {/* User Account & Logout */}
          <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 pl-3 pr-1.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs">
            <User className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
            <span className="font-bold text-slate-800 dark:text-slate-200 hidden sm:inline">
              {loggedInUser?.name || 'Authorized User'}
            </span>
            <button
              onClick={onLogout}
              className="p-1 rounded-lg bg-red-100 dark:bg-red-950/60 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900 transition"
              title="Sign Out to Auth Portal"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Primary Navigation Tabs */}
      <div className="bg-slate-50 dark:bg-slate-950/80 border-t border-slate-200 dark:border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center gap-1.5 overflow-x-auto py-1.5 scrollbar-none">
          {(currentRole === 'super_admin' || currentRole === 'admin') && (
            <>
              <button
                onClick={() => onTabChange('registry')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition ${
                  activeTab === 'registry'
                    ? 'bg-emerald-600 text-white shadow-md'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800'
                }`}
              >
                <UserCheck className="w-4 h-4" /> Beneficiary Registry
              </button>

              <button
                onClick={() => onTabChange('import')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition ${
                  activeTab === 'import'
                    ? 'bg-emerald-600 text-white shadow-md'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800'
                }`}
              >
                <FileSpreadsheet className="w-4 h-4" /> Flexible Import
              </button>

              <button
                onClick={() => onTabChange('escalations')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition relative ${
                  activeTab === 'escalations'
                    ? 'bg-emerald-600 text-white shadow-md'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800'
                }`}
              >
                <AlertTriangle className="w-4 h-4 text-amber-500" /> Escalation Triage
                {openEscalationsCount > 0 && (
                  <span className="ml-1 bg-red-500 text-white font-black text-[10px] px-1.5 py-0.2 rounded-full shadow">
                    {openEscalationsCount}
                  </span>
                )}
              </button>

              <button
                onClick={() => onTabChange('reports')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition ${
                  activeTab === 'reports'
                    ? 'bg-emerald-600 text-white shadow-md'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800'
                }`}
              >
                <Activity className="w-4 h-4" /> Impact & PDF Reports
              </button>

              <button
                onClick={() => onTabChange('agents')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition ${
                  activeTab === 'agents'
                    ? 'bg-emerald-600 text-white shadow-md'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800'
                }`}
              >
                Agent RLS Scoping
              </button>
            </>
          )}

          {currentRole === 'agent' && (
            <button
              onClick={() => onTabChange('checkin')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition ${
                activeTab === 'checkin'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800'
              }`}
            >
              <Activity className="w-4 h-4" /> Mobile Check-in Flow (&lt; 2 min)
            </button>
          )}

          <button
            onClick={() => onTabChange('whatsapp')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition ${
              activeTab === 'whatsapp'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800'
            }`}
          >
            WhatsApp Bot Channel Simulator
          </button>
        </div>
      </div>
    </header>
  );
};
