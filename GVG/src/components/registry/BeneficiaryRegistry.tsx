'use client';

import React, { useState } from 'react';
import { Beneficiary, Agent } from '../../types/gvg';
import { Search, Filter, UserCheck, AlertTriangle, Eye, ShieldAlert, CheckCircle2, LayoutGrid, List, Download, UserPlus, X } from 'lucide-react';
import { exportBeneficiariesToCSV } from '../../lib/export/excelGenerator';

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
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [bulkAgentId, setBulkAgentId] = useState<string>('');

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

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredBeneficiaries.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredBeneficiaries.map((b) => b.id));
    }
  };

  const toggleSelectId = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((i) => i !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const handleBulkAssign = () => {
    if (!bulkAgentId || selectedIds.length === 0) return;
    const agent = agents.find((a) => a.id === bulkAgentId);
    if (!agent) return;

    selectedIds.forEach((id) => {
      onAssignAgent(id, agent.id, agent.name);
    });

    setSelectedIds([]);
    setBulkAgentId('');
    alert(`Successfully assigned ${selectedIds.length} beneficiaries to ${agent.name}.`);
  };

  const handleBulkExport = () => {
    const selectedBens = beneficiaries.filter((b) => selectedIds.includes(b.id));
    exportBeneficiariesToCSV(selectedBens.length > 0 ? selectedBens : filteredBeneficiaries);
  };

  return (
    <div className="space-y-6">
      {/* Top Filter & Search Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-sm space-y-4 transition-colors">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 sm:gap-4">
          {/* Search Input */}
          <div className="relative w-full lg:w-96">
            <Search className="w-4 h-4 absolute left-3 top-3.5 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search Name, Phone, or Serial No..."
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl pl-9 pr-4 py-2.5 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-[#008751] font-medium"
            />
          </div>

          {/* Filter Dropdowns & View Mode */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:flex items-center gap-2 sm:gap-3 w-full lg:w-auto">
            <select
              value={selectedLga}
              onChange={(e) => setSelectedLga(e.target.value)}
              className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 text-[11px] sm:text-xs rounded-xl px-2.5 py-2 focus:outline-none font-semibold truncate"
            >
              <option value="all">All LGAs ({uniqueLgas.length})</option>
              {uniqueLgas.map((lga) => (
                <option key={lga} value={lga}>
                  {lga}
                </option>
              ))}
            </select>

            <select
              value={selectedProfileStatus}
              onChange={(e) => setSelectedProfileStatus(e.target.value)}
              className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 text-[11px] sm:text-xs rounded-xl px-2.5 py-2 focus:outline-none font-semibold truncate"
            >
              <option value="all">All Profile States</option>
              <option value="complete">Complete Profile</option>
              <option value="incomplete">Incomplete Profile</option>
            </select>

            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 text-[11px] sm:text-xs rounded-xl px-2.5 py-2 focus:outline-none font-semibold truncate"
            >
              <option value="all">All Statuses</option>
              <option value="active">Active Business</option>
              <option value="inactive">Inactive / Failed</option>
              <option value="unreachable">Unreachable</option>
            </select>

            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 text-[11px] sm:text-xs rounded-xl px-2.5 py-2 focus:outline-none font-semibold truncate"
            >
              <option value="all">All Assets</option>
              <option value="sewing">Sewing Machine</option>
              <option value="grinding">Grinding Machine</option>
              <option value="unassigned">Unassigned</option>
            </select>

            {/* View Mode Toggle Switch */}
            <div className="col-span-2 sm:col-span-4 lg:col-span-1 flex items-center justify-end gap-1 bg-slate-100 dark:bg-slate-950 p-1 rounded-xl border border-slate-200 dark:border-slate-800">
              <button
                onClick={() => setViewMode('table')}
                className={`flex-1 lg:flex-initial p-1.5 rounded-lg transition flex items-center justify-center gap-1 text-xs font-bold ${
                  viewMode === 'table' ? 'bg-white dark:bg-slate-800 text-[#008751] dark:text-emerald-400 shadow-sm' : 'text-slate-400'
                }`}
                title="Table View"
              >
                <List className="w-4 h-4" /> <span className="lg:hidden">Table</span>
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`flex-1 lg:flex-initial p-1.5 rounded-lg transition flex items-center justify-center gap-1 text-xs font-bold ${
                  viewMode === 'grid' ? 'bg-white dark:bg-slate-800 text-[#008751] dark:text-emerald-400 shadow-sm' : 'text-slate-400'
                }`}
                title="Grid Cards View"
              >
                <LayoutGrid className="w-4 h-4" /> <span className="lg:hidden">Cards</span>
              </button>
            </div>
          </div>
        </div>

        {/* Counter Summary & Bulk Toolbar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between text-xs text-slate-500 dark:text-slate-400 border-t border-slate-200 dark:border-slate-800 pt-3 gap-3">
          <div>
            Showing <strong className="text-slate-900 dark:text-slate-100">{filteredBeneficiaries.length}</strong> of{' '}
            <strong className="text-slate-900 dark:text-slate-100">{beneficiaries.length}</strong> Beneficiaries
          </div>

          {selectedIds.length > 0 ? (
            <div className="flex items-center gap-2 bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-300 dark:border-emerald-700/60 px-3 py-1.5 rounded-xl flex-wrap w-full sm:w-auto">
              <span className="font-bold text-emerald-800 dark:text-emerald-300">{selectedIds.length} Selected</span>
              <select
                value={bulkAgentId}
                onChange={(e) => setBulkAgentId(e.target.value)}
                className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 text-xs rounded-lg px-2 py-1 focus:outline-none"
              >
                <option value="">-- Assign Agent --</option>
                {agents.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name} ({a.assigned_lga})
                  </option>
                ))}
              </select>
              <button
                onClick={handleBulkAssign}
                disabled={!bulkAgentId}
                className="bg-[#008751] hover:bg-[#006838] disabled:opacity-40 text-white font-bold px-2.5 py-1 rounded-lg text-xs transition"
              >
                Apply
              </button>
              <button
                onClick={handleBulkExport}
                className="bg-slate-800 hover:bg-slate-700 text-white font-bold px-2.5 py-1 rounded-lg text-xs flex items-center gap-1 transition"
              >
                <Download className="w-3 h-3" /> Export
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3 sm:gap-4 flex-wrap text-[11px]">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Active:{' '}
                {beneficiaries.filter((b) => b.status === 'active').length}
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-red-500"></span> Inactive:{' '}
                {beneficiaries.filter((b) => b.status === 'inactive').length}
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-amber-500"></span> Incomplete:{' '}
                {beneficiaries.filter((b) => b.profile_status === 'incomplete').length}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* TABLE VIEW MODE */}
      {viewMode === 'table' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto scrollbar-thin">
            <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300 min-w-[700px]">
              <thead className="bg-slate-50 dark:bg-slate-950 text-slate-500 dark:text-slate-400 uppercase font-bold border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="p-3.5">
                    <input
                      type="checkbox"
                      checked={selectedIds.length === filteredBeneficiaries.length && filteredBeneficiaries.length > 0}
                      onChange={toggleSelectAll}
                      className="accent-emerald-600 rounded cursor-pointer"
                    />
                  </th>
                  <th className="p-3.5">Beneficiary & Phone</th>
                  <th className="p-3.5">LGA / State</th>
                  <th className="p-3.5">Asset Category</th>
                  <th className="p-3.5">Disability / Group</th>
                  <th className="p-3.5">Assigned Agent</th>
                  <th className="p-3.5">Baseline Status</th>
                  <th className="p-3.5">Current Status</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800/60 bg-white dark:bg-slate-900">
                {filteredBeneficiaries.map((b) => (
                  <tr key={b.id} className="hover:bg-slate-100 dark:hover:bg-slate-800/80 transition">
                    <td className="p-3.5">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(b.id)}
                        onChange={() => toggleSelectId(b.id)}
                        className="accent-emerald-600 rounded cursor-pointer"
                      />
                    </td>
                    <td className="p-3.5">
                      <div className="font-bold text-slate-900 dark:text-slate-100 text-sm">{b.full_name}</div>
                      <div className="font-mono text-emerald-600 dark:text-emerald-400 text-xs mt-0.5">{b.phone_number}</div>
                    </td>
                    <td className="p-3.5">
                      <div className="font-semibold text-slate-800 dark:text-slate-200">{b.lga}</div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400">{b.state} State</div>
                    </td>
                    <td className="p-3.5">
                      {b.category === 'sewing' && (
                        <span className="bg-blue-100 dark:bg-blue-950/80 text-blue-800 dark:text-blue-300 border border-blue-300 dark:border-blue-800 px-2 py-0.5 rounded-lg font-bold text-[11px] inline-block">
                          🧵 Sewing Machine
                        </span>
                      )}
                      {b.category === 'grinding' && (
                        <span className="bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800 px-2 py-0.5 rounded-lg font-bold text-[11px] inline-block">
                          ⚙️ Grinding Machine
                        </span>
                      )}
                      {b.category === 'unassigned' && (
                        <span className="bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-2 py-0.5 rounded-lg font-medium text-[11px]">
                          Unassigned
                        </span>
                      )}
                      {b.machine_serial && (
                        <div className="font-mono text-[10px] text-slate-400 dark:text-slate-500 mt-1">
                          SN: {b.machine_serial}
                        </div>
                      )}
                    </td>
                    <td className="p-3.5">
                      {b.disability_status ? (
                        <span className="bg-slate-100 dark:bg-slate-800/80 text-slate-800 dark:text-slate-300 font-semibold px-2 py-0.5 rounded-lg text-[11px]">
                          {b.disability_status}
                        </span>
                      ) : (
                        <span className="text-slate-400 italic text-[11px]">None Specified</span>
                      )}
                    </td>
                    <td className="p-3.5">
                      <select
                        value={b.assigned_agent_id || ''}
                        onChange={(e) => {
                          const agent = agents.find((a) => a.id === e.target.value);
                          if (agent) onAssignAgent(b.id, agent.id, agent.name);
                        }}
                        className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 text-[11px] rounded-lg px-2 py-1 focus:outline-none font-medium"
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
                        <span className="bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800/60 px-2 py-0.5 rounded-lg text-[11px] font-bold inline-flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" /> Incomplete
                        </span>
                      ) : (
                        <span className="bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800/60 px-2 py-0.5 rounded-lg text-[11px] font-bold inline-flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> Complete
                        </span>
                      )}
                    </td>
                    <td className="p-3.5">
                      {b.status === 'active' && (
                        <span className="bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-700/60 px-2.5 py-0.5 rounded-full text-[11px] font-black uppercase tracking-wider">
                          Active
                        </span>
                      )}
                      {b.status === 'inactive' && (
                        <span className="bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-400 border border-red-300 dark:border-red-700/60 px-2.5 py-0.5 rounded-full text-[11px] font-black uppercase tracking-wider">
                          Inactive
                        </span>
                      )}
                      {b.status === 'unreachable' && (
                        <span className="bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-400 border border-amber-300 dark:border-amber-700/60 px-2.5 py-0.5 rounded-full text-[11px] font-black uppercase tracking-wider">
                          Unreachable
                        </span>
                      )}
                    </td>
                    <td className="p-3.5 text-right">
                      <button
                        onClick={() => onSelectBeneficiary(b)}
                        className="bg-slate-100 dark:bg-slate-800 hover:bg-[#008751] hover:text-white dark:hover:bg-[#008751] dark:hover:text-white text-slate-800 dark:text-slate-200 px-3 py-1.5 rounded-xl text-xs font-bold inline-flex items-center gap-1.5 transition shadow-sm"
                      >
                        <Eye className="w-3.5 h-3.5" /> View Profile
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* GRID CARDS VIEW MODE */}
      {viewMode === 'grid' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredBeneficiaries.map((b) => (
            <div
              key={b.id}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-3 hover:border-[#008751]/50 dark:hover:border-[#008751]/80 transition"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-extrabold text-slate-900 dark:text-slate-100 text-base">{b.full_name}</h3>
                  <p className="font-mono text-emerald-600 dark:text-emerald-400 text-xs mt-0.5">{b.phone_number}</p>
                </div>

                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full font-black uppercase tracking-wider ${
                    b.status === 'active'
                      ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-700'
                      : b.status === 'inactive'
                      ? 'bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-400 border border-red-300 dark:border-red-700'
                      : 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-400 border border-amber-300 dark:border-amber-700'
                  }`}
                >
                  {b.status}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs border-t border-b border-slate-100 dark:border-slate-800 py-2.5">
                <div>
                  <span className="text-slate-400 block text-[10px]">LGA & State</span>
                  <strong className="text-slate-800 dark:text-slate-200">{b.lga}, {b.state}</strong>
                </div>

                <div>
                  <span className="text-slate-400 block text-[10px]">Asset Category</span>
                  <strong className="text-slate-800 dark:text-slate-200 capitalize">{b.category}</strong>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <span className="text-[11px] text-slate-500 dark:text-slate-400">
                  Agent: <strong>{b.assigned_agent_name || 'Unassigned'}</strong>
                </span>

                <button
                  onClick={() => onSelectBeneficiary(b)}
                  className="bg-[#008751] hover:bg-[#006838] text-white font-bold text-xs px-3 py-1.5 rounded-xl shadow transition flex items-center gap-1"
                >
                  <Eye className="w-3 h-3" /> View
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
