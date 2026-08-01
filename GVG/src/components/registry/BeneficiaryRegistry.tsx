'use client';

import React, { useState } from 'react';
import { Beneficiary, Agent } from '../../types/gvg';
import { Search, Filter, UserCheck, AlertTriangle, Eye, ShieldAlert, CheckCircle2, UserPlus } from 'lucide-react';

interface BeneficiaryRegistryProps {
  beneficiaries: Beneficiary[];
  agents: Agent[];
  onSelectBeneficiary: (beneficiary: Beneficiary) => void;
  onAssignAgent: (beneficiaryId: string, agentId: string, agentName: string) => void;
}

export const BeneficiaryRegistry: React.FC<BeneficiaryRegistryProps> = ({
  beneficiaries,
  agents,
  onSelectBeneficiary,
  onAssignAgent,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLga, setSelectedLga] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedProfileStatus, setSelectedProfileStatus] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Extract unique LGAs
  const uniqueLgas = Array.from(new Set(beneficiaries.map((b) => b.lga))).filter(Boolean);

  const filteredBeneficiaries = beneficiaries.filter((b) => {
    const matchesSearch =
      b.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.phone_number.includes(searchTerm) ||
      (b.machine_serial && b.machine_serial.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesLga = selectedLga === 'all' || b.lga === selectedLga;
    const matchesStatus = selectedStatus === 'all' || b.status === selectedStatus;
    const matchesProfileStatus = selectedProfileStatus === 'all' || b.profile_status === selectedProfileStatus;
    const matchesCategory = selectedCategory === 'all' || b.category === selectedCategory;

    return matchesSearch && matchesLga && matchesStatus && matchesProfileStatus && matchesCategory;
  });

  return (
    <div className="space-y-6">
      {/* Top Filter & Search Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Search Input */}
          <div className="relative w-full md:w-96">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by Name, Phone, or Serial No..."
              className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-4 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500 font-medium"
            />
          </div>

          {/* Filter Options */}
          <div className="flex items-center gap-3 flex-wrap w-full md:w-auto">
            {/* LGA Filter */}
            <select
              value={selectedLga}
              onChange={(e) => setSelectedLga(e.target.value)}
              className="bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-lg px-3 py-2 focus:outline-none focus:border-emerald-500 font-medium"
            >
              <option value="all">All LGAs ({uniqueLgas.length})</option>
              {uniqueLgas.map((lga) => (
                <option key={lga} value={lga}>
                  {lga}
                </option>
              ))}
            </select>

            {/* Profile Status Filter */}
            <select
              value={selectedProfileStatus}
              onChange={(e) => setSelectedProfileStatus(e.target.value)}
              className="bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-lg px-3 py-2 focus:outline-none focus:border-emerald-500 font-medium"
            >
              <option value="all">All Profile States</option>
              <option value="complete">Complete Profile</option>
              <option value="incomplete">Incomplete Profile (Partial)</option>
            </select>

            {/* Business Status Filter */}
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-lg px-3 py-2 focus:outline-none focus:border-emerald-500 font-medium"
            >
              <option value="all">All Business Statuses</option>
              <option value="active">Active Business</option>
              <option value="inactive">Inactive / Failed</option>
              <option value="unreachable">Unreachable</option>
            </select>

            {/* Category Filter */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-lg px-3 py-2 focus:outline-none focus:border-emerald-500 font-medium"
            >
              <option value="all">All Assets</option>
              <option value="sewing">Sewing Machine</option>
              <option value="grinding">Grinding Machine</option>
              <option value="unassigned">Unassigned</option>
            </select>
          </div>
        </div>

        {/* Counter Summary */}
        <div className="flex items-center justify-between text-xs text-slate-400 border-t border-slate-800/80 pt-3">
          <div>
            Showing <strong className="text-slate-200">{filteredBeneficiaries.length}</strong> of{' '}
            <strong className="text-slate-200">{beneficiaries.length}</strong> Beneficiaries
          </div>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Active:{' '}
              {beneficiaries.filter((b) => b.status === 'active').length}
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-red-500"></span> Inactive:{' '}
              {beneficiaries.filter((b) => b.status === 'inactive').length}
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-500"></span> Incomplete Profiles:{' '}
              {beneficiaries.filter((b) => b.profile_status === 'incomplete').length}
            </span>
          </div>
        </div>
      </div>

      {/* Main Beneficiary Data Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 text-slate-400 uppercase font-semibold border-b border-slate-800">
              <tr>
                <th className="p-3.5">Beneficiary & Phone</th>
                <th className="p-3.5">LGA / State</th>
                <th className="p-3.5">Asset Category</th>
                <th className="p-3.5">Disability / Group</th>
                <th className="p-3.5">Assigned Field Agent</th>
                <th className="p-3.5">Profile Baseline</th>
                <th className="p-3.5">Current Status</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 bg-slate-900">
              {filteredBeneficiaries.map((b) => (
                <tr key={b.id} className="hover:bg-slate-850 transition">
                  <td className="p-3.5">
                    <div className="font-bold text-slate-100 text-sm">{b.full_name}</div>
                    <div className="font-mono text-emerald-400 text-xs mt-0.5">{b.phone_number}</div>
                  </td>
                  <td className="p-3.5">
                    <div className="font-medium text-slate-200">{b.lga}</div>
                    <div className="text-[11px] text-slate-400">{b.state} State</div>
                  </td>
                  <td className="p-3.5">
                    {b.category === 'sewing' && (
                      <span className="bg-blue-950/80 text-blue-300 border border-blue-800 px-2 py-0.5 rounded font-semibold text-[11px] inline-block">
                        🧵 Sewing Machine
                      </span>
                    )}
                    {b.category === 'grinding' && (
                      <span className="bg-amber-950/80 text-amber-300 border border-amber-800 px-2 py-0.5 rounded font-semibold text-[11px] inline-block">
                        ⚙️ Grinding Machine
                      </span>
                    )}
                    {b.category === 'unassigned' && (
                      <span className="bg-slate-800 text-slate-400 px-2 py-0.5 rounded font-medium text-[11px]">
                        Unassigned
                      </span>
                    )}
                    {b.machine_serial && (
                      <div className="font-mono text-[10px] text-slate-400 mt-1">SN: {b.machine_serial}</div>
                    )}
                  </td>
                  <td className="p-3.5">
                    {b.disability_status ? (
                      <span className="text-slate-300 font-medium bg-slate-800/80 px-2 py-0.5 rounded text-[11px]">
                        {b.disability_status}
                      </span>
                    ) : (
                      <span className="text-slate-500 italic text-[11px]">None Specified</span>
                    )}
                  </td>
                  <td className="p-3.5">
                    <select
                      value={b.assigned_agent_id || ''}
                      onChange={(e) => {
                        const agent = agents.find((a) => a.id === e.target.value);
                        if (agent) {
                          onAssignAgent(b.id, agent.id, agent.name);
                        }
                      }}
                      className="bg-slate-950 border border-slate-800 text-slate-200 text-[11px] rounded px-2 py-1 focus:outline-none focus:border-emerald-500 font-medium"
                    >
                      <option value="">-- Unassigned Agent --</option>
                      {agents.map((a) => (
                        <option key={a.id} value={a.id}>
                          {a.name} ({a.assigned_lga})
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="p-3.5">
                    {b.profile_status === 'incomplete' ? (
                      <span className="bg-amber-950/80 text-amber-300 border border-amber-800/60 px-2 py-0.5 rounded text-[11px] font-semibold inline-flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" /> Incomplete
                      </span>
                    ) : (
                      <span className="bg-emerald-950/80 text-emerald-300 border border-emerald-800/60 px-2 py-0.5 rounded text-[11px] font-semibold inline-flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Complete
                      </span>
                    )}
                  </td>
                  <td className="p-3.5">
                    {b.status === 'active' && (
                      <span className="bg-emerald-950 text-emerald-400 border border-emerald-700/60 px-2 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider">
                        Active
                      </span>
                    )}
                    {b.status === 'inactive' && (
                      <span className="bg-red-950 text-red-400 border border-red-700/60 px-2 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider">
                        Inactive
                      </span>
                    )}
                    {b.status === 'unreachable' && (
                      <span className="bg-amber-950 text-amber-400 border border-amber-700/60 px-2 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider">
                        Unreachable
                      </span>
                    )}
                  </td>
                  <td className="p-3.5 text-right">
                    <button
                      onClick={() => onSelectBeneficiary(b)}
                      className="bg-slate-800 hover:bg-emerald-600 hover:text-white text-slate-200 px-3 py-1.5 rounded text-xs font-semibold inline-flex items-center gap-1.5 transition"
                    >
                      <Eye className="w-3.5 h-3.5" /> View Profile & Logs
                    </button>
                  </td>
                </tr>
              ))}

              {filteredBeneficiaries.length === 0 && (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-500 text-sm">
                    No beneficiaries match the selected query or LGA filter bounds.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
