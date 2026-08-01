'use client';

import React, { useState } from 'react';
import { Agent } from '../../types/gvg';
import { UserCheck, Shield, Plus, MapPin, Phone, CheckCircle2, Lock } from 'lucide-react';

interface AgentManagementProps {
  agents: Agent[];
  onAddAgent: (agent: Agent) => void;
}

export const AgentManagement: React.FC<AgentManagementProps> = ({ agents, onAddAgent }) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [assignedLga, setAssignedLga] = useState('Kano Municipal');
  const [state, setState] = useState('Kano');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone) return;

    const newAgent: Agent = {
      id: `agent-${Date.now()}`,
      name,
      phone_number: phone.startsWith('+234') ? phone : '+234' + phone.replace(/^0/, ''),
      assigned_lga: assignedLga,
      state,
      role: 'agent',
      created_by: 'Admin',
      active: true,
      created_at: new Date().toISOString(),
    };

    onAddAgent(newAgent);
    setName('');
    setPhone('');
    setShowAddForm(false);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-emerald-400" /> LGA Field Agent Management & RLS Scoping
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Agents are restricted at row-level security (RLS) to their assigned LGA & beneficiary list.
          </p>
        </div>

        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-4 py-2.5 rounded-lg flex items-center gap-2 shadow transition"
        >
          <Plus className="w-4 h-4" /> Register New Field Agent
        </button>
      </div>

      {/* Add Agent Form */}
      {showAddForm && (
        <form onSubmit={handleSubmit} className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4 text-xs shadow-lg">
          <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider">Create New Field Agent Account</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-slate-400 font-semibold mb-1">Full Agent Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Ibrahim Danjuma"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200 focus:outline-none focus:border-emerald-500"
                required
              />
            </div>

            <div>
              <label className="block text-slate-400 font-semibold mb-1">Phone Number (+234)</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="08031234567"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200 focus:outline-none focus:border-emerald-500"
                required
              />
            </div>

            <div>
              <label className="block text-slate-400 font-semibold mb-1">Assigned LGA</label>
              <input
                type="text"
                value={assignedLga}
                onChange={(e) => setAssignedLga(e.target.value)}
                placeholder="Kano Municipal"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200 focus:outline-none focus:border-emerald-500"
                required
              />
            </div>

            <div>
              <label className="block text-slate-400 font-semibold mb-1">State</label>
              <input
                type="text"
                value={state}
                onChange={(e) => setState(e.target.value)}
                placeholder="Kano"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200 focus:outline-none focus:border-emerald-500"
                required
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold px-4 py-2 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-5 py-2 rounded-lg shadow"
            >
              Save & Assign Agent Bounds
            </button>
          </div>
        </form>
      )}

      {/* Agents Data Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 text-slate-400 uppercase font-semibold border-b border-slate-800">
              <tr>
                <th className="p-3.5">Agent Name</th>
                <th className="p-3.5">Contact Phone</th>
                <th className="p-3.5">Assigned LGA Scope</th>
                <th className="p-3.5">State</th>
                <th className="p-3.5">System Role</th>
                <th className="p-3.5">Row-Level Security (RLS) Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 bg-slate-900">
              {agents.map((agent) => (
                <tr key={agent.id} className="hover:bg-slate-850">
                  <td className="p-3.5 font-bold text-slate-100">{agent.name}</td>
                  <td className="p-3.5 font-mono text-emerald-400">{agent.phone_number}</td>
                  <td className="p-3.5 font-semibold text-slate-200 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-emerald-400" /> {agent.assigned_lga}
                  </td>
                  <td className="p-3.5">{agent.state} State</td>
                  <td className="p-3.5 capitalize font-mono text-slate-400">{agent.role}</td>
                  <td className="p-3.5">
                    <span className="bg-emerald-950 text-emerald-300 border border-emerald-800 px-2 py-0.5 rounded text-[11px] font-medium inline-flex items-center gap-1">
                      <Lock className="w-3 h-3 text-emerald-400" /> RLS Scoped ({agent.assigned_lga} only)
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
