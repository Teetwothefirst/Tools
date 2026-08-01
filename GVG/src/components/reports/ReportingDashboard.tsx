'use client';

import React from 'react';
import { Beneficiary, CheckIn, Escalation } from '../../types/gvg';
import { generateImpactPDFReport } from '../../lib/export/pdfGenerator';
import { exportBeneficiariesToCSV } from '../../lib/export/excelGenerator';
import { FileText, Download, TrendingUp, Users, DollarSign, AlertCircle, CheckCircle2, ShieldCheck } from 'lucide-react';

interface ReportingDashboardProps {
  beneficiaries: Beneficiary[];
  checkIns: CheckIn[];
  escalations: Escalation[];
}

export const ReportingDashboard: React.FC<ReportingDashboardProps> = ({
  beneficiaries,
  checkIns,
  escalations,
}) => {
  const totalBeneficiaries = beneficiaries.length || 1;
  const activeCount = beneficiaries.filter((b) => b.status === 'active').length;
  const inactiveCount = beneficiaries.filter((b) => b.status === 'inactive').length;
  const unreachableCount = beneficiaries.filter((b) => b.status === 'unreachable').length;

  const activeRate = Math.round((activeCount / totalBeneficiaries) * 100);

  const totalIncome = checkIns.reduce((acc, curr) => acc + (curr.estimated_monthly_income || 0), 0);
  const avgIncome = checkIns.length ? Math.round(totalIncome / checkIns.length) : 0;

  const resolvedEscalations = escalations.filter((e) => e.status === 'resolved').length;
  const resolutionRate = escalations.length ? Math.round((resolvedEscalations / escalations.length) * 100) : 100;

  // Breakdown by LGA
  const lgaMap: { [lga: string]: { total: number; active: number } } = {};
  beneficiaries.forEach((b) => {
    if (!lgaMap[b.lga]) {
      lgaMap[b.lga] = { total: 0, active: 0 };
    }
    lgaMap[b.lga].total += 1;
    if (b.status === 'active') lgaMap[b.lga].active += 1;
  });

  return (
    <div className="space-y-6">
      {/* Header Banner with PDF / Excel Download Actions */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-emerald-400" /> Executive Programme Impact & Monitoring Dashboard
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Real-time analytics for NSIPA GVG Officers • Export high-fidelity evidence reports for federal review.
          </p>
        </div>

        {/* Export Buttons */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => exportBeneficiariesToCSV(beneficiaries)}
            className="bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-bold text-xs px-4 py-2.5 rounded-lg flex items-center gap-2 transition"
          >
            <Download className="w-4 h-4 text-emerald-400" /> Export Excel / CSV
          </button>

          <button
            onClick={() => generateImpactPDFReport(beneficiaries, checkIns, escalations)}
            className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-5 py-2.5 rounded-lg flex items-center gap-2 shadow-lg transition"
          >
            <FileText className="w-4 h-4" /> Print / Export Official PDF
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-2 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Active Business Rate</span>
            <Users className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-3xl font-extrabold text-slate-100">{activeRate}%</div>
          <div className="text-[11px] text-slate-400">
            <strong className="text-emerald-400">{activeCount}</strong> active out of {beneficiaries.length} tracked
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-2 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Avg Monthly Revenue</span>
            <DollarSign className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-3xl font-extrabold text-emerald-400">₦{avgIncome.toLocaleString()}</div>
          <div className="text-[11px] text-slate-400">Estimated income generated per active beneficiary</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-2 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Escalation Triage Rate</span>
            <CheckCircle2 className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-3xl font-extrabold text-amber-400">{resolutionRate}%</div>
          <div className="text-[11px] text-slate-400">
            <strong className="text-slate-200">{resolvedEscalations}</strong> resolved of {escalations.length} total flags
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-2 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Total Grants Tracked</span>
            <ShieldCheck className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-3xl font-extrabold text-slate-100">{beneficiaries.length}</div>
          <div className="text-[11px] text-slate-400">₦40,000 disbursement + sewing/grinding machine</div>
        </div>
      </div>

      {/* LGA Performance Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4 shadow-sm">
          <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider">
            LGA Active Business Performance Breakdown
          </h3>

          <div className="space-y-3">
            {Object.entries(lgaMap).map(([lga, data]) => {
              const percent = Math.round((data.active / (data.total || 1)) * 100);
              return (
                <div key={lga} className="space-y-1 text-xs">
                  <div className="flex justify-between font-medium">
                    <span className="text-slate-200 font-bold">{lga}</span>
                    <span className="text-slate-400">
                      {data.active} / {data.total} Active ({percent}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-950 rounded-full h-2.5 overflow-hidden border border-slate-800">
                    <div
                      className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                      style={{ width: `${percent}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Asset Category Distribution */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4 shadow-sm">
          <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider">
            Empowerment Asset Type Distribution
          </h3>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl space-y-1">
              <div className="text-xs text-slate-400 font-semibold">🧵 Sewing Machines</div>
              <div className="text-2xl font-bold text-blue-400">
                {beneficiaries.filter((b) => b.category === 'sewing').length}
              </div>
              <div className="text-[11px] text-slate-500">Tailoring & Apparel Micro-businesses</div>
            </div>

            <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl space-y-1">
              <div className="text-xs text-slate-400 font-semibold">⚙️ Grinding Machines</div>
              <div className="text-2xl font-bold text-amber-400">
                {beneficiaries.filter((b) => b.category === 'grinding').length}
              </div>
              <div className="text-[11px] text-slate-500">Agro-processing & Grain Mills</div>
            </div>
          </div>

          <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl space-y-2 text-xs text-slate-400">
            <div className="font-bold text-slate-200">Federal Audit Summary Note:</div>
            <p>
              This tracking platform ensures full transparency for NSIPA's GVG programme by continuously auditing post-disbursement economic activity across all 774 LGAs.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
