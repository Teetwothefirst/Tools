'use client';

import React, { useState } from 'react';
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
  ChevronDown,
  ChevronUp,
  Sparkles,
  HelpCircle,
  Menu,
  X,
  Globe,
} from 'lucide-react';

interface GVGLandingPageProps {
  onEnterWorkspace: () => void;
  onQuickRoleLogin: (role: UserRole) => void;
  themeMode: 'dark' | 'light';
  onToggleTheme: () => void;
}

const FAQS = [
  {
    q: 'What is the Grant for Vulnerable Groups (GVG)?',
    a: 'GVG is a flagship social safety-net empowerment programme implemented by the National Social Investment Programme Agency (NSIPA), Nigeria. It provides ₦40,000 direct cash credit alerts alongside industrial sewing machines or agro-grinding machines to low-income vulnerable Nigerians across all 774 Local Government Areas.',
  },
  {
    q: 'How are GVG beneficiaries selected?',
    a: 'Beneficiaries are selected directly from the National Social Register (NSR) across all 36 States and the FCT. Priority is given to Persons with Disabilities (PWDs), senior citizens, widows, internally displaced persons (IDPs), and vulnerable household heads.',
  },
  {
    q: 'Why is post-disbursement tracking necessary?',
    a: 'Disbursing assets is only the first step. This civic-tech tracking system allows NSIPA field agents to conduct periodic check-ins (< 2 mins) from their mobile phones to ensure machines remain operational, businesses generate sustainable income, and broken equipment receives intervention before business failure.',
  },
  {
    q: 'Can beneficiaries self-confirm their status?',
    a: 'Yes! Digitally capable beneficiaries can voluntarily confirm their business status through an optional, lightweight WhatsApp 1-2-3 numeric reply bot without installing any app or filling out complex forms.',
  },
  {
    q: 'How do field agents log check-ins in remote LGAs with low connectivity?',
    a: 'The system features built-in Progressive Web App (PWA) offline queueing. Agents log check-ins offline in remote areas, and records automatically synchronize to the federal database once cellular network connection is restored.',
  },
];

export const GVGLandingPage: React.FC<GVGLandingPageProps> = ({
  onEnterWorkspace,
  onQuickRoleLogin,
  themeMode,
  onToggleTheme,
}) => {
  const [expandedFaq, setExpandedFaq] = useState<number | null>(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors duration-300 overflow-x-hidden">
      {/* 1. Official NSIPA Top Primary Contact Bar */}
      <div className="bg-[#006838] dark:bg-emerald-950 text-white text-xs py-2 px-4 shadow-sm border-b border-emerald-700/50">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-center sm:text-left">
          <div className="flex items-center gap-2 flex-wrap justify-center sm:justify-start">
            <span className="bg-amber-400 text-slate-950 px-2 py-0.5 rounded font-black text-[10px] uppercase tracking-wider">
              FEDERAL REPUBLIC OF NIGERIA
            </span>
            <span className="font-bold text-[11px] sm:text-xs">
              National Social Investment Programme Agency (NSIPA)
            </span>
          </div>

          <div className="flex items-center justify-center space-x-4 sm:space-x-6 text-[11px] font-medium flex-wrap">
            <span className="flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-amber-300 shrink-0" /> +234 802 126 6483 | +234 806 199 5335
            </span>
            <span className="flex items-center gap-1.5 hidden md:inline-flex">
              <Mail className="w-3.5 h-3.5 text-amber-300 shrink-0" /> info@nsipa.gov.ng
            </span>
          </div>
        </div>
      </div>

      {/* 2. Main Navigation Bar (NSIPA Style Header - Fully Responsive) */}
      <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-50 shadow-md transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-4">
          {/* Logo & Emblem */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-[#008751] flex items-center justify-center font-black text-xl sm:text-2xl text-white shadow-md border-2 border-amber-400 shrink-0">
              GVG
            </div>
            <div>
              <div className="flex items-center gap-1.5 sm:gap-2">
                <span className="font-black text-base sm:text-xl tracking-tight text-[#008751] dark:text-emerald-400">
                  NSIPA GVG
                </span>
                {/* <span className="text-[9px] sm:text-[10px] bg-amber-100 dark:bg-amber-950 text-amber-900 dark:text-amber-300 border border-amber-300 dark:border-amber-700 px-2 py-0.5 rounded-full font-extrabold uppercase">
                  Flagship Drive
                </span> */}
              </div>
              <p className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 font-semibold line-clamp-1">
                Grant for Vulnerable Groups • Post-Disbursement Tracking
              </p>
            </div>
          </div>

          {/* Desktop Navigation Links & Action */}
          <div className="hidden lg:flex items-center gap-6">
            <nav className="flex items-center space-x-6 text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              <a href="#about" className="hover:text-[#008751] dark:hover:text-emerald-400 transition">About</a>
              <a href="#package" className="hover:text-[#008751] dark:hover:text-emerald-400 transition">Programme Package</a>
              <a href="#lgas" className="hover:text-[#008751] dark:hover:text-emerald-400 transition">774 LGAs Scope</a>
              <a href="#faqs" className="hover:text-[#008751] dark:hover:text-emerald-400 transition">FAQs</a>
            </nav>

            <button
              onClick={onToggleTheme}
              className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:text-[#008751] dark:hover:text-emerald-400 transition shadow-sm"
              title="Toggle Light / Dark Mode"
            >
              {themeMode === 'dark' ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-indigo-600" />
              )}
            </button>

            <button
              onClick={onEnterWorkspace}
              className="bg-[#008751] hover:bg-[#006838] text-white font-extrabold text-xs px-5 py-2.5 rounded-xl shadow-md flex items-center gap-2 transition shrink-0"
            >
              <ShieldCheck className="w-4 h-4" /> Agent & Admin Portal
            </button>
          </div>

          {/* Mobile Hamburger & Controls */}
          <div className="flex lg:hidden items-center gap-2">
            <button
              onClick={onToggleTheme}
              className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 transition"
            >
              {themeMode === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-600" />}
            </button>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 focus:outline-none"
              aria-label="Toggle Mobile Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer Dropdown */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 py-4 space-y-4 animate-in slide-in-from-top-2 duration-200">
            <nav className="flex flex-col space-y-3 text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
              <a
                href="#about"
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition"
              >
                About GVG Programme
              </a>
              <a
                href="#package"
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition"
              >
                ₦40,000 + Machine Package
              </a>
              <a
                href="#lgas"
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition"
              >
                774 LGAs Coverage
              </a>
              <a
                href="#faqs"
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition"
              >
                FAQs
              </a>
            </nav>

            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex flex-col gap-2">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onEnterWorkspace();
                }}
                className="w-full bg-[#008751] hover:bg-[#006838] text-white font-extrabold text-xs py-3 rounded-xl shadow-md flex items-center justify-center gap-2 transition"
              >
                <ShieldCheck className="w-4 h-4" /> Enter Agent & Admin Portal
              </button>

              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onQuickRoleLogin('beneficiary');
                }}
                className="w-full bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-bold text-xs py-3 rounded-xl flex items-center justify-center gap-2 transition"
              >
                <Bot className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /> WhatsApp Bot Self-Checkin
              </button>
            </div>
          </div>
        )}
      </header>

      {/* 3. Hero Showcase Section (Fully Responsive Banner) */}
      <section id="about" className="relative overflow-hidden bg-gradient-to-br from-[#005e38] via-[#008751] to-[#004d2e] text-white py-12 sm:py-16 lg:py-24 shadow-inner">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* Left Hero Content */}
            <div className="lg:col-span-7 space-y-5 sm:space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 bg-amber-400/20 border border-amber-400/40 text-amber-300 px-3.5 py-1.5 rounded-full text-xs font-bold shadow-sm">
                <Sparkles className="w-4 h-4 text-amber-300 shrink-0" />
                Federal Republic of Nigeria • NSIPA
              </div>

              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-tight sm:leading-none">
                Grant for Vulnerable Groups{' '}
                <span className="text-amber-300 block mt-2 text-2xl sm:text-4xl font-extrabold">
                  (GVG Programme)
                </span>
              </h1>

              <p className="text-emerald-100 text-xs sm:text-base leading-relaxed max-w-2xl mx-auto lg:mx-0">
                Providing <strong> direct financial support</strong> and <strong>starter trade equipment</strong> (industrial sewing machines, agro-grinding mills etc) to low-income households, persons with disabilities, senior citizens, and widows across all <strong>774 Local Government Areas</strong> in Nigeria.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 pt-2">
                <button
                  onClick={onEnterWorkspace}
                  className="w-full sm:w-auto bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs sm:text-sm px-7 py-3.5 rounded-2xl shadow-2xl flex items-center justify-center gap-2 transition transform hover:-translate-y-0.5"
                >
                  Enter Field Tracking Workspace <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  onClick={() => onQuickRoleLogin('beneficiary')}
                  className="w-full sm:w-auto bg-white/10 hover:bg-white/20 border border-white/30 text-white font-bold text-xs sm:text-sm px-6 py-3.5 rounded-2xl backdrop-blur-md flex items-center justify-center gap-2 transition"
                >
                  <Bot className="w-4 h-4 text-amber-300" /> Beneficiary WhatsApp Bot
                </button>
              </div>

              {/* Stats Highlights */}
              <div className="pt-6 grid grid-cols-3 gap-2 sm:gap-4 border-t border-emerald-600/60">
                <div className="p-2 sm:p-0">
                  {/* <div className="text-xl sm:text-3xl font-black text-amber-300">₦40,000</div> */}
                  <div className="text-xl sm:text-3xl font-black text-amber-300">80+</div>
                  <div className="text-[10px] sm:text-xs text-emerald-100 font-medium">Directly impacted</div>
                </div>
                <div className="p-2 sm:p-0">
                  <div className="text-xl sm:text-3xl font-black text-white">774 LGAs</div>
                  <div className="text-[10px] sm:text-xs text-emerald-100 font-medium">Nationwide Federal Scope</div>
                </div>
                <div className="p-2 sm:p-0">
                  <div className="text-xl sm:text-3xl font-black text-amber-300">2 Assets</div>
                  <div className="text-[10px] sm:text-xs text-emerald-100 font-medium">Sewing & Grinding Mills</div>
                </div>
              </div>
            </div>

            {/* Right Card Panel: Quick Role Login & Objective */}
            <div className="lg:col-span-5">
              <div className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 sm:p-8 shadow-2xl space-y-5">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-[#008751] text-white flex items-center justify-center font-bold shrink-0">
                      <ShieldCheck className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-extrabold text-slate-900 dark:text-slate-100 text-xs sm:text-sm">
                        NSIPA Field Tracking Gateway
                      </h3>
                      <p className="text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400">
                        Post-Disbursement Asset Protection
                      </p>
                    </div>
                  </div>
                  <span className="text-[9px] sm:text-[10px] bg-amber-100 dark:bg-amber-950 text-amber-900 dark:text-amber-300 border border-amber-300 dark:border-amber-700 px-2 py-0.5 rounded font-black uppercase">
                    Live System
                  </span>
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  Enables NSIPA field officers to log periodic check-ins (&lt; 2 mins), automatically flagging non-functional equipment or business failures for swift assistance.
                </p>

                {/* Quick Role Login Buttons */}
                <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <div className="text-[10px] text-slate-400 font-black uppercase tracking-wider text-center">
                    ⚡ Quick Demo Access Launchpad
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <button
                      onClick={() => onQuickRoleLogin('super_admin')}
                      className="bg-slate-50 dark:bg-slate-950 hover:bg-emerald-50 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 p-2.5 sm:p-3 rounded-xl text-left transition font-bold text-slate-800 dark:text-slate-200"
                    >
                      👑 Super Admin
                    </button>
                    <button
                      onClick={() => onQuickRoleLogin('admin')}
                      className="bg-slate-50 dark:bg-slate-950 hover:bg-emerald-50 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 p-2.5 sm:p-3 rounded-xl text-left transition font-bold text-slate-800 dark:text-slate-200"
                    >
                      🛡️ Agency Admin
                    </button>
                    <button
                      onClick={() => onQuickRoleLogin('agent')}
                      className="bg-slate-50 dark:bg-slate-950 hover:bg-emerald-50 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 p-2.5 sm:p-3 rounded-xl text-left transition font-bold text-slate-800 dark:text-slate-200"
                    >
                      🚶 LGA Agent Form
                    </button>
                    <button
                      onClick={() => onQuickRoleLogin('beneficiary')}
                      className="bg-slate-50 dark:bg-slate-950 hover:bg-emerald-50 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 p-2.5 sm:p-3 rounded-xl text-left transition font-bold text-slate-800 dark:text-slate-200"
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

      {/* 4. Programme Pillars Section (Responsive Grid) */}
      <section id="package" className="py-12 sm:py-16 lg:py-20 bg-white dark:bg-slate-900 transition-colors border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <span className="text-[10px] sm:text-xs bg-emerald-100 dark:bg-emerald-950 text-[#008751] dark:text-emerald-400 font-extrabold px-3 py-1 rounded-full uppercase tracking-wider">
              Empowerment Core Pillars
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-slate-100">
              The GVG Beneficiary Package Breakdown
            </h2>
            <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm">
              Designed to help vulnerable households transition from basic survival to sustained economic self-reliance.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            <div className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-5 sm:p-6 rounded-3xl space-y-3 shadow-sm hover:border-[#008751] transition">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-950 text-[#008751] dark:text-emerald-400 flex items-center justify-center font-black text-xl">
                ₦
              </div>
              <h3 className="font-extrabold text-slate-900 dark:text-slate-100 text-base sm:text-lg">
                {/* ₦40,000  */}
                Direct Cash Credit
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Direct financial grant credited to beneficiary bank accounts to cover working capital, raw materials, and initial operational setup costs.
              </p>
            </div>

            <div className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-5 sm:p-6 rounded-3xl space-y-3 shadow-sm hover:border-[#008751] transition">
              <div className="w-12 h-12 rounded-2xl bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center font-black text-xl">
                🧵
              </div>
              <h3 className="font-extrabold text-slate-900 dark:text-slate-100 text-base sm:text-lg">
                Industrial Sewing Machines
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                High-grade manual and electric sewing machines distributed to beneficiaries interested in tailoring, apparel repair, and fashion micro-enterprises.
              </p>
            </div>

            <div className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-5 sm:p-6 rounded-3xl space-y-3 shadow-sm hover:border-[#008751] transition">
              <div className="w-12 h-12 rounded-2xl bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-400 flex items-center justify-center font-black text-xl">
                ⚙️
              </div>
              <h3 className="font-extrabold text-slate-900 dark:text-slate-100 text-base sm:text-lg">
                Agro-Grinding Machines
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Heavy-duty motor grinding mills provided for food processing, pepper grinding, cassava milling, and community grain processing businesses.
              </p>
            </div>

            <div className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-5 sm:p-6 rounded-3xl space-y-3 shadow-sm hover:border-[#008751] transition">
              <div className="w-12 h-12 rounded-2xl bg-purple-100 dark:bg-purple-950 text-purple-600 dark:text-purple-400 flex items-center justify-center font-black text-xl">
                📱
              </div>
              <h3 className="font-extrabold text-slate-900 dark:text-slate-100 text-base sm:text-lg">
                Field Agent Rapid Check-ins
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Periodic agent visits (&lt; 2 mins) ensuring equipment is active, income is logged, and broken parts receive intervention before business failure.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. 774 Local Government Areas Scope & Map Showcase */}
      <section id="lgas" className="py-12 sm:py-16 lg:py-20 bg-slate-100/60 dark:bg-slate-950 transition-colors border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-10 items-center">
            <div className="space-y-4 text-center lg:text-left">
              <span className="text-[10px] sm:text-xs bg-amber-100 dark:bg-amber-950 text-amber-900 dark:text-amber-300 font-extrabold px-3 py-1 rounded-full uppercase">
                100% Federal Coverage
              </span>
              <h2 className="text-2xl sm:text-4xl font-black text-slate-900 dark:text-slate-100">
                Spanning All 774 Local Government Areas in Nigeria
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                The GVG programme is deployed across all 36 States and the Federal Capital Territory (FCT). Our field agents operate in every LGA, ensuring even the most remote rural communities are monitored and supported.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs font-bold">
                <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center gap-3">
                  <MapPin className="w-5 h-5 text-[#008751] dark:text-emerald-400 shrink-0" />
                  <div className="text-left">
                    <div className="text-slate-900 dark:text-slate-100 font-black">36 States + FCT</div>
                    <div className="text-slate-500 text-[11px] font-normal">Nationwide Deployment</div>
                  </div>
                </div>

                <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center gap-3">
                  <Users className="w-5 h-5 text-[#008751] dark:text-emerald-400 shrink-0" />
                  <div className="text-left">
                    <div className="text-slate-900 dark:text-slate-100 font-black">NSR Verified</div>
                    <div className="text-slate-500 text-[11px] font-normal">National Social Register</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Sample LGA Active Matrix Box */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl space-y-4">
              <h3 className="font-extrabold text-slate-900 dark:text-slate-100 text-xs sm:text-sm flex items-center justify-between">
                <span>Sample LGA Active Monitoring Stream</span>
                <span className="text-xs text-[#008751] dark:text-emerald-400 font-mono font-bold">Live Data</span>
              </h3>

              <div className="space-y-3 text-xs">
                <div>
                  <div className="flex justify-between font-bold text-slate-800 dark:text-slate-200 mb-1">
                    <span>Kano Municipal (Kano)</span>
                    <span className="text-[#008751] dark:text-emerald-400">92% Active</span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-950 h-2 rounded-full overflow-hidden">
                    <div className="bg-[#008751] h-full w-[92%]"></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between font-bold text-slate-800 dark:text-slate-200 mb-1">
                    <span>Alimosho (Lagos)</span>
                    <span className="text-[#008751] dark:text-emerald-400">88% Active</span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-950 h-2 rounded-full overflow-hidden">
                    <div className="bg-[#008751] h-full w-[88%]"></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between font-bold text-slate-800 dark:text-slate-200 mb-1">
                    <span>Enugu North (Enugu)</span>
                    <span className="text-[#008751] dark:text-emerald-400">85% Active</span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-950 h-2 rounded-full overflow-hidden">
                    <div className="bg-[#008751] h-full w-[85%]"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Frequently Asked Questions (FAQ Accordion) */}
      <section id="faqs" className="py-12 sm:py-16 lg:py-20 bg-white dark:bg-slate-900 transition-colors border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="text-center space-y-2">
            <span className="text-[10px] sm:text-xs bg-amber-100 dark:bg-amber-950 text-amber-900 dark:text-amber-300 font-bold px-3 py-1 rounded-full uppercase">
              Got Questions?
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-slate-100">
              Frequently Asked Questions (FAQs)
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Clear answers regarding the GVG Programme, equipment handovers, and tracking.
            </p>
          </div>

          <div className="space-y-3">
            {FAQS.map((faq, idx) => {
              const isExpanded = expandedFaq === idx;
              return (
                <div
                  key={idx}
                  className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden transition"
                >
                  <button
                    onClick={() => setExpandedFaq(isExpanded ? null : idx)}
                    className="w-full p-4 text-left font-bold text-slate-900 dark:text-slate-100 text-xs sm:text-sm flex items-center justify-between gap-4"
                  >
                    <span>{faq.q}</span>
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4 text-[#008751] shrink-0" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                    )}
                  </button>

                  {isExpanded && (
                    <div className="px-4 pb-4 text-xs text-slate-600 dark:text-slate-400 leading-relaxed border-t border-slate-200/60 dark:border-slate-800/60 pt-3">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 7. Official NSIPA Deep Green Footer */}
      <footer className="bg-[#005e38] dark:bg-slate-950 text-white py-10 sm:py-12 text-xs transition-colors mt-auto border-t border-emerald-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pb-8 border-b border-emerald-600/60 dark:border-slate-800">
            {/* Agency Info */}
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white text-[#008751] flex items-center justify-center font-black text-xl border-2 border-amber-400 shrink-0">
                  GVG
                </div>
                <div>
                  <strong className="text-white text-sm block font-extrabold">
                    NSIPA — GVG Programme
                  </strong>
                  <span className="text-emerald-100 text-[11px]">
                    National Social Investment Programme Agency
                  </span>
                </div>
              </div>
              <p className="text-emerald-100 text-[11px] leading-relaxed">
                Empowering vulnerable Nigerians across 774 Local Government Areas through direct grants, vocational tools, and continuous post-disbursement monitoring.
              </p>
            </div>

            {/* Quick Links */}
            <div className="space-y-2">
              <h4 className="font-extrabold text-amber-300 uppercase tracking-wider text-xs">Navigation Links</h4>
              <ul className="space-y-1.5 text-emerald-100">
                <li><a href="#about" className="hover:text-white transition">About GVG Programme</a></li>
                <li><a href="#package" className="hover:text-white transition">₦40,000 + Machine Package</a></li>
                <li><a href="#lgas" className="hover:text-white transition">774 LGA Scope</a></li>
                <li><a href="#faqs" className="hover:text-white transition">Frequently Asked Questions</a></li>
              </ul>
            </div>

            {/* Official Contact Info */}
            <div className="space-y-2">
              <h4 className="font-extrabold text-amber-300 uppercase tracking-wider text-xs">Official NSIPA Contacts</h4>
              <div className="space-y-1.5 text-emerald-100">
                <div className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-amber-300 shrink-0" />
                  <span>+234 802 126 6483 | +234 806 199 5335</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-amber-300 shrink-0" />
                  <span>info@nsipa.gov.ng</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-amber-300 shrink-0" />
                  <span>Federal Secretariat, Abuja, Nigeria</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-emerald-200 dark:text-slate-400 text-center sm:text-left">
            <div>
              © {new Date().getFullYear()} National Social Investment Programme Agency (NSIPA). All Rights Reserved.
            </div>
            <div>
              Protected under Federal Civic-Tech Data Guidelines & Row-Level Security (RLS).
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
