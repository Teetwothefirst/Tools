'use client';

import React, { useState, useEffect } from 'react';
import { UserRole, Beneficiary, Agent, CheckIn, Escalation, ImportBatch } from '../types/gvg';
import { MockDataStore } from '../lib/data/mockStore';
import { OfflineCheckinQueue } from '../lib/offline/checkinQueue';
import { Navbar } from '../components/layout/Navbar';
import { BeneficiaryRegistry } from '../components/registry/BeneficiaryRegistry';
import { BeneficiaryDetailModal } from '../components/registry/BeneficiaryDetailModal';
import { ImportWizard } from '../components/import/ImportWizard';
import { AgentCheckInForm } from '../components/checkin/AgentCheckInForm';
import { EscalationManager } from '../components/escalations/EscalationManager';
import { ReportingDashboard } from '../components/reports/ReportingDashboard';
import { WhatsAppSimulator } from '../components/whatsapp/WhatsAppSimulator';
import { AgentManagement } from '../components/agents/AgentManagement';
import { RotateCcw } from 'lucide-react';

export default function Home() {
  const [store] = useState(() => MockDataStore.getInstance());
  const [offlineQueue] = useState(() => OfflineCheckinQueue.getInstance());

  const [currentRole, setCurrentRole] = useState<UserRole>('super_admin');
  const [activeTab, setActiveTab] = useState<string>('registry');

  // State collections
  const [beneficiaries, setBeneficiaries] = useState<Beneficiary[]>([]);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [checkIns, setCheckIns] = useState<CheckIn[]>([]);
  const [escalations, setEscalations] = useState<Escalation[]>([]);
  const [importBatches, setImportBatches] = useState<ImportBatch[]>([]);

  // PWA Offline Queue State
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [queuedItemsCount, setQueuedItemsCount] = useState<number>(0);

  // Selected Beneficiary Modal
  const [selectedBeneficiary, setSelectedBeneficiary] = useState<Beneficiary | null>(null);

  // Refresh view data from local store
  const refreshData = () => {
    setBeneficiaries(store.getBeneficiaries());
    setAgents(store.getAgents());
    setCheckIns(store.getCheckIns());
    setEscalations(store.getEscalations());
    setImportBatches(store.getImportBatches());
    setQueuedItemsCount(offlineQueue.getQueue().length);
  };

  useEffect(() => {
    refreshData();

    const handleOnline = () => {
      setIsOnline(true);
      syncOfflineQueue();
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    if (typeof window !== 'undefined') {
      setIsOnline(navigator.onLine);
      window.addEventListener('online', handleOnline);
      window.addEventListener('offline', handleOffline);
    }

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
      }
    };
  }, []);

  // Synchronize queued offline check-ins
  const syncOfflineQueue = () => {
    const queue = offlineQueue.getQueue();
    if (queue.length === 0) return;

    queue.forEach((item) => {
      store.addCheckIn(item.checkIn);
    });

    offlineQueue.clearQueue();
    refreshData();
  };

  // Adjust active tab when switching user role
  const handleRoleChange = (role: UserRole) => {
    setCurrentRole(role);
    if (role === 'agent') {
      setActiveTab('checkin');
    } else if (role === 'beneficiary') {
      setActiveTab('whatsapp');
    } else {
      setActiveTab('registry');
    }
  };

  // Handlers
  const handleCommitImport = (newBens: Beneficiary[], batchRecord: ImportBatch) => {
    store.addBeneficiaries(newBens);
    store.addImportBatch(batchRecord);
    refreshData();
  };

  const handleSubmitCheckIn = (checkIn: CheckIn) => {
    if (isOnline) {
      store.addCheckIn(checkIn);
    } else {
      offlineQueue.enqueue(checkIn);
    }
    refreshData();
  };

  const handleResolveEscalation = (
    id: string,
    status: Escalation['status'],
    resolutionNotes: string
  ) => {
    store.updateEscalationStatus(id, status, resolutionNotes);
    refreshData();
  };

  const handleAddAgent = (agent: Agent) => {
    store.addAgent(agent);
    refreshData();
  };

  const handleAssignAgent = (beneficiaryId: string, agentId: string, agentName: string) => {
    store.updateBeneficiary(beneficiaryId, {
      assigned_agent_id: agentId,
      assigned_agent_name: agentName,
    });
    refreshData();
  };

  const handleBeneficiarySelfConfirm = (beneficiaryId: string, isRunning: boolean) => {
    const ben = beneficiaries.find((b) => b.id === beneficiaryId);
    if (ben) {
      store.addCheckIn({
        id: `chk-wa-${Date.now()}`,
        beneficiary_id: ben.id,
        beneficiary_name: ben.full_name,
        agent_id: 'bot-whatsapp',
        agent_name: 'WhatsApp Bot',
        date: new Date().toISOString(),
        channel: 'whatsapp_self',
        business_active: isRunning,
        machine_in_use: isRunning,
        estimated_monthly_income: isRunning ? 35000 : 0,
        challenges: isRunning ? [] : ['Self-reported stopped via WhatsApp'],
        needs_assistance: !isRunning,
        notes: isRunning
          ? 'Beneficiary self-confirmed active business via WhatsApp 1-2-3 bot.'
          : 'Beneficiary self-confirmed business stopped via WhatsApp 1-2-3 bot.',
      });
      refreshData();
    }
  };

  const handleResetDemoData = () => {
    if (confirm('Reset tracker state to initial demo defaults?')) {
      store.resetToDefaults();
      refreshData();
    }
  };

  // Row-Level Security Scoping for Agent role
  const currentAgent = agents[0] || {
    id: 'agent-101',
    name: 'Aminu Bello',
    assigned_lga: 'Kano Municipal',
    phone_number: '+2348031234567',
    state: 'Kano',
  };

  const displayedBeneficiaries =
    currentRole === 'agent'
      ? beneficiaries.filter((b) => b.lga === currentAgent.assigned_lga)
      : beneficiaries;

  const openEscalationsCount = escalations.filter((e) => e.status === 'open').length;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Top Navbar */}
      <Navbar
        currentRole={currentRole}
        onRoleChange={handleRoleChange}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        isOnline={isOnline}
        offlineQueueCount={queuedItemsCount}
        onSyncOfflineQueue={syncOfflineQueue}
        openEscalationsCount={openEscalationsCount}
      />

      {/* Main Container Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Registry Tab */}
        {activeTab === 'registry' && (
          <BeneficiaryRegistry
            beneficiaries={displayedBeneficiaries}
            agents={agents}
            onSelectBeneficiary={(b) => setSelectedBeneficiary(b)}
            onAssignAgent={handleAssignAgent}
          />
        )}

        {/* Flexible Data Import Tab */}
        {activeTab === 'import' && (
          <ImportWizard
            existingBeneficiaries={beneficiaries}
            onCommitImport={handleCommitImport}
            importHistory={importBatches}
          />
        )}

        {/* Escalations Management Tab */}
        {activeTab === 'escalations' && (
          <EscalationManager
            escalations={escalations}
            beneficiaries={beneficiaries}
            agents={agents}
            onResolveEscalation={handleResolveEscalation}
          />
        )}

        {/* Reports & PDF Export Tab */}
        {activeTab === 'reports' && (
          <ReportingDashboard
            beneficiaries={displayedBeneficiaries}
            checkIns={checkIns}
            escalations={escalations}
          />
        )}

        {/* Agent Management Tab */}
        {activeTab === 'agents' && (
          <AgentManagement agents={agents} onAddAgent={handleAddAgent} />
        )}

        {/* Field Agent Mobile Form Tab */}
        {activeTab === 'checkin' && (
          <AgentCheckInForm
            currentAgent={currentAgent}
            assignedBeneficiaries={beneficiaries.filter((b) => b.lga === currentAgent.assigned_lga)}
            onSubmitCheckIn={handleSubmitCheckIn}
            isOnline={isOnline}
          />
        )}

        {/* WhatsApp Bot Channel Simulator Tab */}
        {activeTab === 'whatsapp' && (
          <WhatsAppSimulator
            beneficiaries={beneficiaries}
            onBeneficiarySelfConfirm={handleBeneficiarySelfConfirm}
          />
        )}
      </main>

      {/* Beneficiary Detail Modal */}
      {selectedBeneficiary && (
        <BeneficiaryDetailModal
          beneficiary={selectedBeneficiary}
          checkIns={checkIns}
          escalations={escalations}
          onClose={() => setSelectedBeneficiary(null)}
          onUpdateBeneficiary={(id, updates) => {
            store.updateBeneficiary(id, updates);
            refreshData();
          }}
        />
      )}

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-6 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <strong>NSIPA GVG Progress Tracker</strong> • Independent Civic-Tech Solution for Grant for Vulnerable Groups (Nigeria)
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={handleResetDemoData}
              className="text-slate-400 hover:text-amber-400 flex items-center gap-1 transition"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Reset Demo Datasets
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
