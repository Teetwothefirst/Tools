'use client';

import React, { useState } from 'react';
import { Escalation, Beneficiary, Agent } from '../../types/gvg';
import { AlertTriangle, ShieldAlert, CheckCircle2, Clock, MessageSquare, UserCheck } from 'lucide-react';

interface EscalationManagerProps {
  escalations: Escalation[];
  beneficiaries: Beneficiary[];
  agents: Agent[];
  onResolveEscalation: (id: string, status: Escalation['status'], resolutionNotes: string) => void;
}

export const EscalationManager: React.FC<EscalationManagerProps> = ({
  escalations,
  beneficiaries,
  agents,
  onResolveEscalation,
}) => {
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [resolutionInput, setResolutionInput] = useState<{ [id: string]: string }>({});

  const filteredEscalations = escalations.filter((e) => {
    if (filterStatus === 'all') return true;
    return e.status === filterStatus;
  });

  const handleResolveClick = (id: string, targetStatus: Escalation['status']) => {
    const notes = resolutionInput[id] || 'Intervention completed by Admin.';
    onResolveEscalation(id, targetStatus, notes);
    setResolutionInput((prev) => ({ ...prev, [id]: '' }));
  };

  return (
    <div className="space-y-6">
      {/* Overview Banner */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4 transition-colors">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-500" /> Auto-Flagged Beneficiary Escalation Review Board
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Automated alerts triggered by machine non-usage, 2 consecutive business failures, unreachability, or manual agent flags.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-950 p-1.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-bold">
          <button
            onClick={() => setFilterStatus('all')}
            className={`px-3 py-1 rounded-lg transition ${filterStatus === 'all' ? 'bg-emerald-600 text-white shadow' : 'text-slate-600 dark:text-slate-400'}`}
          >
            All ({escalations.length})
          </button>
          <button
            onClick={() => setFilterStatus('open')}
            className={`px-3 py-1 rounded-lg transition ${filterStatus === 'open' ? 'bg-red-600 text-white shadow' : 'text-slate-600 dark:text-slate-400'}`}
          >
            Open ({escalations.filter((e) => e.status === 'open').length})
          </button>
          <button
            onClick={() => setFilterStatus('in_review')}
            className={`px-3 py-1 rounded-lg transition ${filterStatus === 'in_review' ? 'bg-amber-500 text-slate-950 shadow' : 'text-slate-600 dark:text-slate-400'}`}
          >
            In Review ({escalations.filter((e) => e.status === 'in_review').length})
          </button>
          <button
            onClick={() => setFilterStatus('resolved')}
            className={`px-3 py-1 rounded-lg transition ${filterStatus === 'resolved' ? 'bg-emerald-800 text-white shadow' : 'text-slate-600 dark:text-slate-400'}`}
          >
            Resolved ({escalations.filter((e) => e.status === 'resolved').length})
          </button>
        </div>
      </div>

      {/* Escalation Cards List */}
      <div className="space-y-4">
        {filteredEscalations.map((esc) => {
          const ben = beneficiaries.find((b) => b.id === esc.beneficiary_id);
          return (
            <div
              key={esc.id}
              className={`bg-white dark:bg-slate-900 border rounded-2xl p-5 shadow-sm space-y-4 transition ${
                esc.status === 'open'
                  ? 'border-red-300 dark:border-red-900/80 bg-red-50/50 dark:bg-red-950/10'
                  : esc.status === 'in_review'
                  ? 'border-amber-300 dark:border-amber-900/80 bg-amber-50/50 dark:bg-amber-950/10'
                  : 'border-slate-200 dark:border-slate-800'
              }`}
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800/80 pb-3">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
                      esc.status === 'open'
                        ? 'bg-red-100 dark:bg-red-950 border border-red-300 dark:border-red-700 text-red-600 dark:text-red-400'
                        : esc.status === 'in_review'
                        ? 'bg-amber-100 dark:bg-amber-950 border border-amber-300 dark:border-amber-700 text-amber-700 dark:text-amber-400'
                        : 'bg-emerald-100 dark:bg-emerald-950 border border-emerald-300 dark:border-emerald-700 text-emerald-700 dark:text-emerald-400'
                    }`}
                  >
                    {esc.status === 'open' ? <ShieldAlert className="w-5 h-5" /> : <Clock className="w-5 h-5" />}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-extrabold text-slate-900 dark:text-slate-100">{esc.beneficiary_name || ben?.full_name}</h3>
                      <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">LGA: {esc.lga || ben?.lga}</span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      Phone: <strong className="text-emerald-600 dark:text-emerald-400 font-mono">{ben?.phone_number}</strong> • Asset:{' '}
                      <span className="capitalize">{ben?.category}</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`text-xs px-3 py-1 rounded-full font-black uppercase tracking-wider ${
                      esc.status === 'open'
                        ? 'bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300 border border-red-300 dark:border-red-700'
                        : esc.status === 'in_review'
                        ? 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-700'
                        : 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700'
                    }`}
                  >
                    {esc.status.replace('_', ' ')}
                  </span>
                </div>
              </div>

              <div className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-3 rounded-xl text-xs space-y-1">
                <div className="text-slate-400 font-semibold uppercase text-[10px]">Trigger Cause:</div>
                <div className="text-slate-900 dark:text-slate-200 font-medium">{esc.reason}</div>
              </div>

              {esc.resolution_notes && (
                <div className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 p-3 rounded-xl text-xs space-y-1">
                  <div className="text-emerald-700 dark:text-emerald-400 font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Resolution Record:
                  </div>
                  <div className="text-slate-700 dark:text-slate-300 italic">{esc.resolution_notes}</div>
                </div>
              )}

              {esc.status !== 'resolved' && (
                <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center gap-3">
                  <input
                    type="text"
                    value={resolutionInput[esc.id] || ''}
                    onChange={(e) => setResolutionInput({ ...resolutionInput, [esc.id]: e.target.value })}
                    placeholder="Enter resolution notes (e.g. Spare part provided, cash grant aid)..."
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-slate-200 focus:outline-none focus:border-emerald-500"
                  />

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => handleResolveClick(esc.id, 'in_review')}
                      className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs px-3 py-2 rounded-xl transition shadow"
                    >
                      In Review
                    </button>

                    <button
                      onClick={() => handleResolveClick(esc.id, 'resolved')}
                      className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-4 py-2 rounded-xl flex items-center gap-1.5 transition shadow"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" /> Resolve & Close
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {filteredEscalations.length === 0 && (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 text-center text-slate-400 text-xs">
            No escalations match the selected filter status.
          </div>
        )}
      </div>
    </div>
  );
};
