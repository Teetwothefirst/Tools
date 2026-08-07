'use client';

import React, { useState } from 'react';
import { Beneficiary, CheckIn, Agent } from '../../types/gvg';
import { Activity, CheckCircle2, XCircle, Camera, AlertTriangle, Send, WifiOff, Clock } from 'lucide-react';

interface AgentCheckInFormProps {
  currentAgent: Agent;
  assignedBeneficiaries: Beneficiary[];
  onSubmitCheckIn: (checkIn: CheckIn) => void;
  isOnline: boolean;
}

const COMMON_CHALLENGES = [
  'Power / Fuel Cost',
  'Broken Spare Parts',
  'Market / Demand Deficit',
  'Illness / Health Challenge',
  'Raw Material Inflation',
  'Capital Constraints',
];

export const AgentCheckInForm: React.FC<AgentCheckInFormProps> = ({
  currentAgent,
  assignedBeneficiaries,
  onSubmitCheckIn,
  isOnline,
}) => {
  const [selectedBenId, setSelectedBenId] = useState<string>('');
  const [channel, setChannel] = useState<CheckIn['channel']>('agent_visit');
  const [businessActive, setBusinessActive] = useState<boolean>(true);
  const [machineInUse, setMachineInUse] = useState<boolean>(true);
  const [income, setIncome] = useState<number>(35000);
  const [selectedChallenges, setSelectedChallenges] = useState<string[]>([]);
  const [needsAssistance, setNeedsAssistance] = useState<boolean>(false);
  const [notes, setNotes] = useState<string>('');
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [submittedMessage, setSubmittedMessage] = useState<string | null>(null);

  const selectedBeneficiary = assignedBeneficiaries.find((b) => b.id === selectedBenId);

  const toggleChallenge = (ch: string) => {
    if (selectedChallenges.includes(ch)) {
      setSelectedChallenges(selectedChallenges.filter((c) => c !== ch));
    } else {
      setSelectedChallenges([...selectedChallenges, ch]);
    }
  };

  const handlePhotoSimulate = () => {
    setPhotoPreview('https://images.unsplash.com/photo-1544717305-2782549b5136?w=400');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBenId) {
      alert('Please select a beneficiary to log check-in for.');
      return;
    }

    const checkIn: CheckIn = {
      id: `chk-${Date.now()}`,
      beneficiary_id: selectedBenId,
      beneficiary_name: selectedBeneficiary?.full_name,
      agent_id: currentAgent.id,
      agent_name: currentAgent.name,
      date: new Date().toISOString(),
      channel,
      business_active: businessActive,
      machine_in_use: machineInUse,
      estimated_monthly_income: Number(income),
      challenges: selectedChallenges,
      needs_assistance: needsAssistance,
      photo_url: photoPreview,
      notes,
    };

    onSubmitCheckIn(checkIn);

    setSubmittedMessage(
      isOnline
        ? 'Check-in submitted & synced successfully!'
        : 'Offline Mode: Saved to Local PWA Queue. Will sync automatically when online.'
    );

    setTimeout(() => {
      setSubmittedMessage(null);
      setSelectedBenId('');
      setNotes('');
      setSelectedChallenges([]);
      setPhotoPreview(null);
    }, 2500);
  };

  return (
    <div className="max-w-lg mx-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-4 sm:p-6 shadow-2xl space-y-5 transition-colors">
      {/* Header */}
      <div className="border-b border-slate-200 dark:border-slate-800 pb-3.5 flex items-center justify-between gap-2">
        <div>
          <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Activity className="w-5 h-5 text-[#008751] dark:text-emerald-400 shrink-0" /> Rapid Mobile Check-in
          </h2>
          <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Target &lt; 2 minutes • Agent: <strong className="text-slate-800 dark:text-slate-200">{currentAgent.name}</strong> ({currentAgent.assigned_lga})
          </p>
        </div>

        {!isOnline && (
          <span className="bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-400 border border-amber-300 dark:border-amber-800 px-2 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1 shrink-0">
            <WifiOff className="w-3 h-3" /> Offline
          </span>
        )}
      </div>

      {submittedMessage ? (
        <div className="bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-500 rounded-2xl p-6 text-center space-y-2">
          <CheckCircle2 className="w-10 h-10 text-[#008751] dark:text-emerald-400 mx-auto animate-bounce" />
          <div className="text-xs sm:text-sm font-bold text-emerald-900 dark:text-emerald-200">{submittedMessage}</div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Beneficiary Selector */}
          <div>
            <label className="block text-slate-800 dark:text-slate-300 font-bold mb-1">
              Select Assigned Beneficiary ({assignedBeneficiaries.length} total) *
            </label>
            <select
              value={selectedBenId}
              onChange={(e) => setSelectedBenId(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 text-xs rounded-xl p-3 focus:outline-none focus:border-[#008751] font-semibold"
              required
            >
              <option value="">-- Choose Beneficiary --</option>
              {assignedBeneficiaries.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.full_name} ({b.category.toUpperCase()}) • {b.phone_number}
                </option>
              ))}
            </select>

            {selectedBeneficiary && (
              <div className="mt-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-2.5 sm:p-3 rounded-xl flex items-center justify-between text-[11px]">
                <div>
                  <span className="text-slate-400">Serial:</span>{' '}
                  <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                    {selectedBeneficiary.machine_serial || 'Unassigned'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400">Status:</span>{' '}
                  <span className="font-bold text-slate-800 dark:text-slate-200 uppercase">{selectedBeneficiary.status}</span>
                </div>
              </div>
            )}
          </div>

          {/* Channel Selection */}
          <div>
            <label className="block text-slate-800 dark:text-slate-300 font-bold mb-1">Check-in Channel *</label>
            <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
              <button
                type="button"
                onClick={() => setChannel('agent_visit')}
                className={`p-2 sm:p-2.5 rounded-xl border text-center font-bold text-[11px] sm:text-xs transition ${
                  channel === 'agent_visit'
                    ? 'bg-[#008751] text-white border-emerald-400 shadow'
                    : 'bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800'
                }`}
              >
                🚶 Physical Visit
              </button>

              <button
                type="button"
                onClick={() => setChannel('agent_call')}
                className={`p-2 sm:p-2.5 rounded-xl border text-center font-bold text-[11px] sm:text-xs transition ${
                  channel === 'agent_call'
                    ? 'bg-[#008751] text-white border-emerald-400 shadow'
                    : 'bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800'
                }`}
              >
                📞 Phone Call
              </button>

              <button
                type="button"
                onClick={() => setChannel('whatsapp_self')}
                className={`p-2 sm:p-2.5 rounded-xl border text-center font-bold text-[11px] sm:text-xs transition ${
                  channel === 'whatsapp_self'
                    ? 'bg-[#008751] text-white border-emerald-400 shadow'
                    : 'bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800'
                }`}
              >
                💬 WhatsApp Bot
              </button>
            </div>
          </div>

          {/* Toggle 1: Business Active */}
          <div>
            <label className="block text-slate-800 dark:text-slate-300 font-bold mb-1">Is business currently running?</label>
            <div className="grid grid-cols-2 gap-2 sm:gap-3">
              <button
                type="button"
                onClick={() => setBusinessActive(true)}
                className={`p-3 rounded-xl border flex items-center justify-center gap-2 font-bold text-xs transition ${
                  businessActive
                    ? 'bg-emerald-100 dark:bg-emerald-950 border-emerald-500 text-emerald-800 dark:text-emerald-300 shadow'
                    : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-400'
                }`}
              >
                <CheckCircle2 className="w-4 h-4 shrink-0" /> YES, Running
              </button>

              <button
                type="button"
                onClick={() => setBusinessActive(false)}
                className={`p-3 rounded-xl border flex items-center justify-center gap-2 font-bold text-xs transition ${
                  !businessActive
                    ? 'bg-red-100 dark:bg-red-950 border-red-500 text-red-800 dark:text-red-300 shadow'
                    : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-400'
                }`}
              >
                <XCircle className="w-4 h-4 shrink-0" /> NO, Stopped
              </button>
            </div>
          </div>

          {/* Toggle 2: Machine in Use */}
          <div>
            <label className="block text-slate-800 dark:text-slate-300 font-bold mb-1">Is sewing/grinding machine in use?</label>
            <div className="grid grid-cols-2 gap-2 sm:gap-3">
              <button
                type="button"
                onClick={() => setMachineInUse(true)}
                className={`p-3 rounded-xl border flex items-center justify-center gap-2 font-bold text-xs transition ${
                  machineInUse
                    ? 'bg-emerald-100 dark:bg-emerald-950 border-emerald-500 text-emerald-800 dark:text-emerald-300 shadow'
                    : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-400'
                }`}
              >
                <CheckCircle2 className="w-4 h-4 shrink-0" /> YES, In Use
              </button>

              <button
                type="button"
                onClick={() => setMachineInUse(false)}
                className={`p-3 rounded-xl border flex items-center justify-center gap-2 font-bold text-xs transition ${
                  !machineInUse
                    ? 'bg-amber-100 dark:bg-amber-950 border-amber-500 text-amber-800 dark:text-amber-300 shadow'
                    : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-400'
                }`}
              >
                <AlertTriangle className="w-4 h-4 shrink-0" /> NO, Unused
              </button>
            </div>
          </div>

          {/* Income Slider */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-slate-800 dark:text-slate-300 font-bold">Estimated Monthly Revenue</label>
              <span className="text-emerald-600 dark:text-emerald-400 font-mono font-bold text-sm">₦{Number(income).toLocaleString()}</span>
            </div>
            <input
              type="range"
              min="0"
              max="150000"
              step="2500"
              value={income}
              onChange={(e) => setIncome(Number(e.target.value))}
              className="w-full accent-[#008751] cursor-pointer"
            />
          </div>

          {/* Challenge Chips */}
          <div>
            <label className="block text-slate-800 dark:text-slate-300 font-bold mb-1">Key Challenges</label>
            <div className="flex flex-wrap gap-1.5">
              {COMMON_CHALLENGES.map((ch) => {
                const isSelected = selectedChallenges.includes(ch);
                return (
                  <button
                    key={ch}
                    type="button"
                    onClick={() => toggleChallenge(ch)}
                    className={`px-2.5 py-1 rounded-lg text-[10px] sm:text-[11px] font-bold border transition ${
                      isSelected
                        ? 'bg-amber-100 dark:bg-amber-950 border-amber-500 text-amber-900 dark:text-amber-300'
                        : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400'
                    }`}
                  >
                    {isSelected ? '✓ ' : '+ '} {ch}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Assistance Needed Checkbox */}
          <div className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-3 rounded-xl flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="needHelp"
                checked={needsAssistance}
                onChange={(e) => setNeedsAssistance(e.target.checked)}
                className="w-4 h-4 accent-amber-500 rounded cursor-pointer shrink-0"
              />
              <label htmlFor="needHelp" className="text-amber-800 dark:text-amber-300 font-bold text-xs cursor-pointer">
                Flag for Admin Assistance Support
              </label>
            </div>
            <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
          </div>

          {/* Notes & Photo */}
          <div>
            <label className="block text-slate-800 dark:text-slate-300 font-bold mb-1">Field Visit Photo & Notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              placeholder="Observation notes, machine condition, apprentice count..."
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-3 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-[#008751]"
            />

            <div className="mt-2 flex items-center gap-3">
              <button
                type="button"
                onClick={handlePhotoSimulate}
                className="bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 text-[11px] font-bold px-3 py-1.5 rounded-xl flex items-center gap-1.5 transition"
              >
                <Camera className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                {photoPreview ? 'Photo Attached ✓' : 'Attach Photo'}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-[#008751] hover:bg-[#006838] text-white font-bold text-sm py-3.5 rounded-2xl shadow-lg flex items-center justify-center gap-2 transition"
          >
            <Send className="w-4 h-4" /> Submit Check-in Record
          </button>
        </form>
      )}
    </div>
  );
};
