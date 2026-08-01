'use client';

import React from 'react';
import { UserRole } from '../../types/gvg';
import { ShieldCheck, Wifi, WifiOff, RefreshCw, UserCheck, AlertTriangle, FileSpreadsheet, Activity } from 'lucide-react';

interface NavbarProps {
  currentRole: UserRole;
  onRoleChange: (role: UserRole) => void;
  activeTab: string;
  onTabChange: (tab: string) => void;
  isOnline: boolean;
  offlineQueueCount: number;
  onSyncOfflineQueue: () => void;
  openEscalationsCount: number;
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
}) => {
  return (
    <header className="bg-slate-900 border-b border-slate-800 text-white sticky top-0 z-40 shadow-lg">
      {/* Top Banner */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-wrap items-center justify-between gap-4">
        {/* Logo & Tagline */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-emerald-600 flex items-center justify-center font-black text-xl shadow-md text-white border border-emerald-400">
            GVG
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg tracking-tight text-slate-100">NSIPA GVG Tracker</span>
              <span className="text-xs bg-emerald-950 text-emerald-400 border border-emerald-700/50 px-2 py-0.5 rounded font-semibold">
                Nigeria Civic-Tech
              </span>
            </div>
            <p className="text-xs text-slate-400">Grant for Vulnerable Groups • Post-Disbursement Impact & Monitoring</p>
          </div>
        </div>

        {/* Status Indicators & Role Switcher */}
        <div className="flex items-center gap-3 flex-wrap">
          {/* Offline / Online Sync Badge */}
          <div className="flex items-center gap-2 bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700 text-xs">
            {isOnline ? (
              <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
                <Wifi className="w-3.5 h-3.5" /> Online Mode
              </span>
            ) : (
              <span className="flex items-center gap-1.5 text-amber-400 font-medium animate-pulse">
                <WifiOff className="w-3.5 h-3.5" /> Offline (PWA Ready)
              </span>
            )}

            {offlineQueueCount > 0 && (
              <button
                onClick={onSyncOfflineQueue}
                className="ml-2 flex items-center gap-1 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold px-2 py-0.5 rounded transition text-xs"
              >
                <RefreshCw className="w-3 h-3 animate-spin" />
                Sync {offlineQueueCount} Queued
              </button>
            )}
          </div>

          {/* Role Switcher Pill */}
          <div className="flex items-center gap-2 bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-700">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span className="text-xs text-slate-400 hidden sm:inline">Role:</span>
            <select
              value={currentRole}
              onChange={(e) => onRoleChange(e.target.value as UserRole)}
              className="bg-slate-900 border border-slate-700 text-slate-200 text-xs rounded px-2 py-1 focus:outline-none focus:border-emerald-500 font-semibold"
            >
              <option value="super_admin">Super Admin (All Access)</option>
              <option value="admin">Admin (Import & Triage)</option>
              <option value="agent">Agent (Mobile Field View)</option>
              <option value="beneficiary">Beneficiary (WhatsApp Channel)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Primary Navigation Tabs */}
      <div className="bg-slate-950/60 border-t border-slate-800/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center gap-1 overflow-x-auto py-1 scrollbar-none">
          {/* Tabs based on permissions */}
          {(currentRole === 'super_admin' || currentRole === 'admin') && (
            <>
              <button
                onClick={() => onTabChange('registry')}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-md text-xs font-semibold whitespace-nowrap transition ${
                  activeTab === 'registry'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <UserCheck className="w-4 h-4" /> Beneficiary Registry
              </button>

              <button
                onClick={() => onTabChange('import')}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-md text-xs font-semibold whitespace-nowrap transition ${
                  activeTab === 'import'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <FileSpreadsheet className="w-4 h-4" /> Flexible Import
              </button>

              <button
                onClick={() => onTabChange('escalations')}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-md text-xs font-semibold whitespace-nowrap transition relative ${
                  activeTab === 'escalations'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <AlertTriangle className="w-4 h-4 text-amber-400" /> Escalations
                {openEscalationsCount > 0 && (
                  <span className="ml-1 bg-red-500 text-white font-bold text-[10px] px-1.5 py-0.2 rounded-full">
                    {openEscalationsCount}
                  </span>
                )}
              </button>

              <button
                onClick={() => onTabChange('reports')}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-md text-xs font-semibold whitespace-nowrap transition ${
                  activeTab === 'reports'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <Activity className="w-4 h-4" /> Impact & PDF Reports
              </button>

              <button
                onClick={() => onTabChange('agents')}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-md text-xs font-semibold whitespace-nowrap transition ${
                  activeTab === 'agents'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                Agent Management & Scoping
              </button>
            </>
          )}

          {/* Field Agent Tab */}
          {currentRole === 'agent' && (
            <button
              onClick={() => onTabChange('checkin')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-md text-xs font-semibold whitespace-nowrap transition ${
                activeTab === 'checkin'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Activity className="w-4 h-4" /> Agent Mobile Check-in Flow (&lt; 2 min)
            </button>
          )}

          {/* Beneficiary WhatsApp Simulator Tab */}
          <button
            onClick={() => onTabChange('whatsapp')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-md text-xs font-semibold whitespace-nowrap transition ${
              activeTab === 'whatsapp'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            WhatsApp Bot Channel Simulator
          </button>
        </div>
      </div>
    </header>
  );
};
