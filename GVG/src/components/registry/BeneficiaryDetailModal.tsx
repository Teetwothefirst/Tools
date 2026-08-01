'use client';

import React from 'react';
import { Beneficiary, CheckIn, Escalation } from '../../types/gvg';
import { X, Calendar, MapPin, Tag, Phone, AlertTriangle, ShieldCheck, DollarSign, Activity } from 'lucide-react';

interface BeneficiaryDetailModalProps {
  beneficiary: Beneficiary | null;
  checkIns: CheckIn[];
  escalations: Escalation[];
  onClose: () => void;
  onUpdateBeneficiary: (id: string, updates: Partial<Beneficiary>) => void;
}

export const BeneficiaryDetailModal: React.FC<BeneficiaryDetailModalProps> = ({
  beneficiary,
  checkIns,
  escalations,
  onClose,
  onUpdateBeneficiary,
}) => {
  if (!beneficiary) return null;

  const benCheckins = checkIns.filter((c) => c.beneficiary_id === beneficiary.id);
  const benEscalations = escalations.filter((e) => e.beneficiary_id === beneficiary.id);

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl space-y-6 p-6">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-800 pb-4">
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-bold text-slate-100">{beneficiary.full_name}</h2>
              <span
                className={`text-xs px-2.5 py-0.5 rounded font-bold uppercase tracking-wider ${
                  beneficiary.status === 'active'
                    ? 'bg-emerald-950 text-emerald-400 border border-emerald-700'
                    : beneficiary.status === 'inactive'
                    ? 'bg-red-950 text-red-400 border border-red-700'
                    : 'bg-amber-950 text-amber-400 border border-amber-700'
                }`}
              >
                {beneficiary.status}
              </span>
            </div>

            <div className="flex items-center gap-4 text-xs text-slate-400 mt-1">
              <span className="flex items-center gap-1 font-mono text-emerald-400">
                <Phone className="w-3.5 h-3.5" /> {beneficiary.phone_number}
              </span>
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5" /> {beneficiary.lga}, {beneficiary.state} State
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Profile Baseline Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-1">
            <div className="text-xs text-slate-400 font-semibold uppercase">Empowerment Asset</div>
            <div className="text-sm font-bold text-slate-200 capitalize">
              {beneficiary.category === 'sewing'
                ? '🧵 Sewing Machine'
                : beneficiary.category === 'grinding'
                ? '⚙️ Grinding Machine'
                : 'Unassigned Asset'}
            </div>
            <div className="text-[11px] font-mono text-slate-500">
              Serial: {beneficiary.machine_serial || 'Not Serialized'}
            </div>
          </div>

          <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-1">
            <div className="text-xs text-slate-400 font-semibold uppercase">Grant Cash Amount</div>
            <div className="text-base font-bold text-emerald-400">
              ₦{beneficiary.amount_received.toLocaleString()}
            </div>
            <div className="text-[11px] text-slate-500">
              Date: {beneficiary.disbursement_date || 'N/A'}
            </div>
          </div>

          <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-1">
            <div className="text-xs text-slate-400 font-semibold uppercase">Assigned Field Agent</div>
            <div className="text-sm font-bold text-slate-200">
              {beneficiary.assigned_agent_name || 'Unassigned'}
            </div>
            <div className="text-[11px] text-slate-500">
              LGA Scope: {beneficiary.lga}
            </div>
          </div>
        </div>

        {/* Photo & Additional Baseline Info */}
        <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 flex flex-col md:flex-row items-center gap-6">
          <div className="w-24 h-24 rounded-lg bg-slate-900 border border-slate-800 overflow-hidden flex items-center justify-center shrink-0">
            {beneficiary.baseline_photo_url ? (
              <img
                src={beneficiary.baseline_photo_url}
                alt={beneficiary.full_name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="text-xs text-slate-500 text-center px-2">No Baseline Photo</div>
            )}
          </div>

          <div className="space-y-2 flex-1 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-slate-400 font-medium">Disability / Social Group:</span>
              <span className="text-slate-200 font-semibold">{beneficiary.disability_status || 'None Specified'}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400 font-medium">Profile Completeness:</span>
              <span
                className={`font-bold ${
                  beneficiary.profile_status === 'complete' ? 'text-emerald-400' : 'text-amber-400'
                }`}
              >
                {beneficiary.profile_status.toUpperCase()}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400 font-medium">Import Source:</span>
              <span className="font-mono text-slate-300">{beneficiary.source}</span>
            </div>
          </div>
        </div>

        {/* Escalation History Section */}
        {benEscalations.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400" /> Escalation History ({benEscalations.length})
            </h3>
            <div className="space-y-2">
              {benEscalations.map((esc) => (
                <div
                  key={esc.id}
                  className="bg-amber-950/30 border border-amber-800/60 rounded-xl p-3.5 text-xs space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-amber-300">{esc.reason}</span>
                    <span className="bg-amber-900/80 text-amber-200 px-2 py-0.5 rounded font-mono text-[10px] uppercase">
                      {esc.status}
                    </span>
                  </div>
                  {esc.resolution_notes && (
                    <p className="text-slate-300 text-[11px] italic pt-1 border-t border-amber-900/40">
                      Resolution Note: {esc.resolution_notes}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Check-in Timeline */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
            <Activity className="w-4 h-4 text-emerald-400" /> Field Check-in History ({benCheckins.length})
          </h3>

          <div className="space-y-3">
            {benCheckins.map((chk) => (
              <div key={chk.id} className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-200 flex items-center gap-1.5">
                    {chk.channel === 'agent_visit'
                      ? '🚶 Physical Field Visit'
                      : chk.channel === 'agent_call'
                      ? '📞 Phone Check-in'
                      : '💬 WhatsApp Bot'}
                    <span className="text-slate-400 font-normal">by {chk.agent_name || 'Field Agent'}</span>
                  </span>
                  <span className="text-slate-400">{new Date(chk.date).toLocaleString('en-GB')}</span>
                </div>

                <div className="grid grid-cols-3 gap-2 text-xs pt-2 border-t border-slate-800/80">
                  <div>
                    <span className="text-slate-400">Business Running:</span>{' '}
                    <strong className={chk.business_active ? 'text-emerald-400' : 'text-red-400'}>
                      {chk.business_active ? 'Yes' : 'No'}
                    </strong>
                  </div>
                  <div>
                    <span className="text-slate-400">Machine in Use:</span>{' '}
                    <strong className={chk.machine_in_use ? 'text-emerald-400' : 'text-red-400'}>
                      {chk.machine_in_use ? 'Yes' : 'No'}
                    </strong>
                  </div>
                  <div>
                    <span className="text-slate-400">Monthly Revenue:</span>{' '}
                    <strong className="text-emerald-400">₦{chk.estimated_monthly_income.toLocaleString()}</strong>
                  </div>
                </div>

                {chk.challenges.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {chk.challenges.map((ch, idx) => (
                      <span
                        key={idx}
                        className="bg-slate-900 border border-slate-800 text-slate-300 text-[10px] px-2 py-0.5 rounded font-medium"
                      >
                        ⚠️ {ch}
                      </span>
                    ))}
                  </div>
                )}

                {chk.notes && <p className="text-xs text-slate-300 italic pt-1">{chk.notes}</p>}
              </div>
            ))}

            {benCheckins.length === 0 && (
              <div className="text-xs text-slate-500 italic p-4 text-center bg-slate-950 border border-slate-800 rounded-xl">
                No periodic check-ins logged yet for this beneficiary.
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex justify-end pt-4 border-t border-slate-800">
          <button
            onClick={onClose}
            className="bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs px-5 py-2 rounded-lg transition"
          >
            Close Profile
          </button>
        </div>
      </div>
    </div>
  );
};
