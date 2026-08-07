'use client';

import React from 'react';
import { UserRole } from '../../types/gvg';
import {
  ShieldCheck,
  Award,
  Users,
  MapPin,
  CheckCircle2,
  Phone,
  Mail,
  ArrowRight,
  TrendingUp,
  Activity,
  Bot,
  Sun,
  Moon,
  ChevronRight,
  Sparkles,
  Zap,
  Lock,
} from 'lucide-react';

interface GVGLandingPageProps {
  onEnterWorkspace: () => void;
  onQuickRoleLogin: (role: UserRole) => void;
  themeMode: 'dark' | 'light';
  onToggleTheme: () => void;
}

export const GVGLandingPage: React.FC<GVGLandingPageProps> = ({
  onEnterWorkspace,
  onQuickRoleLogin,
  themeMode,
  onToggleTheme,
}) => {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors duration-300">
      {/* Top Announcement Bar */}
      <div className="bg-emerald-800 text-white text-xs py-2 px-4 shadow-sm">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2 font-medium">
            <span className="bg-emerald-900 text-emerald-200 px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider">
              Official Civic-Tech Portal
            </span>
            <span>National Social Investment Programme Agency (NSIPA) • GVG Programme</span>
          </div>

          <div className="flex items-center space-x-6 text-[11px]">
            <span className="flex items-center gap-1">
              <Phone className="w-3 h-3 text-emerald-300" /> +234 802 126 6483 | +234 806 199 5335
            </span>
            <span className="flex items-center gap-1 hidden sm:inline-flex">
              <Mail className="w-3 h-3 text-emerald-300" /> info@nsipa.gov.ng
            </span>
          </div>
        </div>
      </div>

      {/* Main Header / Navigation */}
      <header className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 sticky top-0 z-40 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center font-black text-xl text-white shadow-md border border-emerald-400">
              GVG
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-lg tracking-tight text-slate-900 dark:text-slate-100">
                  NSIPA GVG
                </span>
                <span className="text-xs bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700/50 px-2.5 py-0.5 rounded-full font-bold">
                  Flagship Empowerment
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Grant for Vulnerable Groups • Post-Disbursement Tracking System
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Theme Toggle */}
            <button
              onClick={onToggleTheme}
              className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 transition"
              title="Toggle Light / Dark Mode"
            >
              {themeMode === 'dark' ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-indigo-600" />
              )}
            </button>

            {/* Portal Action Button */}
            <button
              onClick={onEnterWorkspace}
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-md flex items-center gap-2 transition"
            >
              <ShieldCheck className="w-4 h-4" /> Agent & Admin Sign In
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden py-16 lg:py-24 bg-gradient-to-b from-slate-100/50 via-slate-50 to-slate-100/30 dark:from-slate-900/60 dark:via-slate-950 dark:to-slate-950 border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 bg-emerald-100 dark:bg-emerald-950/80 border border-emerald-300 dark:border-emerald-700/60 text-emerald-800 dark:text-emerald-300 px-3.5 py-1.5 rounded-full text-xs font-bold shadow-sm">
                <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                Federal Social Investment Safety-Net Initiative
              </div>

              <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-slate-900 dark:text-slate-100 leading-tight">
                Empowering Vulnerable Nigerians Across All{' '}
                <span className="text-emerald-600 dark:text-emerald-400 underline decoration-emerald-500/40">
                  774 Local Government Areas
                </span>
              </h1>

              <p className="text-slate-600 dark:text-slate-300 text-base leading-relaxed">
                The <strong>Grant for Vulnerable Groups (GVG)</strong> is NSIPA's flagship post-disbursement empowerment programme. Providing <strong>₦40,000 cash grants</strong> alongside <strong>industrial sewing machines</strong> or <strong>agro-grinding machines</strong> to vulnerable households, senior citizens, widows, and persons with disabilities.
              </p>

              <div className="flex flex-wrap items-center gap-4 pt-2">
                <button
                  onClick={onEnterWorkspace}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm px-6 py-3.5 rounded-2xl shadow-xl flex items-center gap-2 transition transform hover:-translate-y-0.5"
                >
                  Enter Field Tracking Portal <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  onClick={() => onQuickRoleLogin('beneficiary')}
                  className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 font-bold text-sm px-6 py-3.5 rounded-2xl shadow-sm flex items-center gap-2 transition"
                >
                  <Bot className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /> WhatsApp Bot Self-Checkin
                </button>
              </div>

              {/* Key Highlights Pill */}
              <div className="pt-4 grid grid-cols-3 gap-4 border-t border-slate-200 dark:border-slate-800/80">
                <div>
                  <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400">₦40,000</div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">Direct Cash Support</div>
                </div>
                <div>
                  <div className="text-2xl font-black text-slate-900 dark:text-slate-100">774 LGAs</div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">Nationwide Scope</div>
                </div>
                <div>
                  <div className="text-2xl font-black text-amber-500">2 Equipment</div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">Sewing & Grinding</div>
                </div>
              </div>
            </div>

            {/* Right Feature Card */}
            <div className="lg:col-span-5">
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 relative">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
                      <Activity className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-extrabold text-slate-900 dark:text-slate-100 text-sm">
                        Why Post-Disbursement Tracking?
                      </h3>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        Bridging the Post-Grant Operational Gap
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800 px-2 py-0.5 rounded font-bold uppercase">
                    Impact Gap
                  </span>
                </div>

                <div className="space-y-4 text-xs text-slate-600 dark:text-slate-300">
                  <p>
                    Without periodic field tracking, agencies cannot determine if starter machines remain active, if micro-businesses generate revenue, or if beneficiaries require spare part support.
                  </p>

                  <div className="space-y-2 bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
                    <div className="flex items-center gap-2 font-bold text-slate-800 dark:text-slate-200">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /> Key Solution Deliverables:
                    </div>
                    <ul className="space-y-1.5 text-[11px] text-slate-500 dark:text-slate-400 pl-6 list-disc">
                      <li>Flexible dataset imports (.xlsx, .csv, .docx, pasted text).</li>
                      <li>Rapid &lt; 2-minute mobile agent field check-ins.</li>
                      <li>PWA Offline support for remote low-connectivity LGAs.</li>
                      <li>Auto-flagging logic for business failures & machine non-usage.</li>
                      <li>Executive PDF & Excel impact evidence exports.</li>
                    </ul>
                  </div>
                </div>

                {/* Quick Role Login Portal Buttons */}
                <div className="border-t border-slate-100 dark:border-slate-800 pt-4 space-y-2">
                  <div className="text-[10px] text-slate-400 uppercase font-extrabold tracking-wider text-center">
                    Quick Role Demo Launch Pad
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <button
                      onClick={() => onQuickRoleLogin('super_admin')}
                      className="bg-slate-100 dark:bg-slate-950 hover:bg-slate-200 dark:hover:bg-slate-800 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-left transition font-bold text-slate-800 dark:text-slate-200"
                    >
                      👑 Super Admin
                    </button>
                    <button
                      onClick={() => onQuickRoleLogin('admin')}
                      className="bg-slate-100 dark:bg-slate-950 hover:bg-slate-200 dark:hover:bg-slate-800 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-left transition font-bold text-slate-800 dark:text-slate-200"
                    >
                      🛡️ Agency Admin
                    </button>
                    <button
                      onClick={() => onQuickRoleLogin('agent')}
                      className="bg-slate-100 dark:bg-slate-950 hover:bg-slate-200 dark:hover:bg-slate-800 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-left transition font-bold text-slate-800 dark:text-slate-200"
                    >
                      🚶 LGA Agent Form
                    </button>
                    <button
                      onClick={() => onQuickRoleLogin('beneficiary')}
                      className="bg-slate-100 dark:bg-slate-950 hover:bg-slate-200 dark:hover:bg-slate-800 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-left transition font-bold text-slate-800 dark:text-slate-200"
                    >
                      💬 WhatsApp Bot
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Target Beneficiaries Demographics Section */}
      <section className="py-16 bg-white dark:bg-slate-900 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <h2 className="text-3xl font-black text-slate-900 dark:text-slate-100">
              Target Beneficiary Demographics
            </h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm">
              Beneficiaries are selected directly from the <strong>National Social Register (NSR)</strong>, focusing on the most vulnerable population groups across Nigeria.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl space-y-3">
              <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-xl">
                ♿
              </div>
              <h3 className="font-extrabold text-slate-900 dark:text-slate-100 text-base">
                Persons With Disabilities (PWDs)
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Mobility, hearing, and visual impairment beneficiaries provided tailored starter equipment to enable home-based trade.
              </p>
            </div>

            <div className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl space-y-3">
              <div className="w-12 h-12 rounded-xl bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold text-xl">
                👵
              </div>
              <h3 className="font-extrabold text-slate-900 dark:text-slate-100 text-base">
                Senior Citizens & Retirees
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Elderly individuals needing non-strenuous micro-business starter tools to maintain social independence.
              </p>
            </div>

            <div className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl space-y-3">
              <div className="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-xl">
                👩‍👧
              </div>
              <h3 className="font-extrabold text-slate-900 dark:text-slate-100 text-base">
                Widows & Female Heads
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Female household heads supported with tailoring sewing machines or grain grinding mills for food security.
              </p>
            </div>

            <div className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl space-y-3">
              <div className="w-12 h-12 rounded-xl bg-purple-100 dark:bg-purple-950 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold text-xl">
                📋
              </div>
              <h3 className="font-extrabold text-slate-900 dark:text-slate-100 text-base">
                National Social Register (NSR)
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Indigent households verified through federal social safety-net register databases across all 36 states.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Official NSIPA Support Bar & Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 py-10 text-xs text-slate-500 transition-colors mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-6 border-b border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center font-black text-xl text-white">
                GVG
              </div>
              <div>
                <strong className="text-slate-900 dark:text-slate-100 text-sm block">
                  National Social Investment Programme Agency (NSIPA)
                </strong>
                <span>Federal Republic of Nigeria • Grant for Vulnerable Groups (GVG)</span>
              </div>
            </div>

            {/* Official Support Line Bar */}
            <div className="flex flex-wrap items-center gap-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-4 py-2.5 rounded-2xl text-slate-700 dark:text-slate-300">
              <span className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> NSIPA Support Line:
              </span>
              <span className="font-mono text-emerald-700 dark:text-emerald-300 font-bold">
                +234 802 126 6483 | +234 806 199 5335
              </span>
              <span className="text-slate-400">|</span>
              <span className="flex items-center gap-1 font-medium">
                <Mail className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> info@nsipa.gov.ng
              </span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-400">
            <div>
              Protected under NSIPA Civic-Tech Data Protection Guidelines & Row-Level Security Scoping (RLS).
            </div>
            <div>
              Post-Disbursement Beneficiary Progress & Impact Evaluation System MVP
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
