'use client';

import React, { useState, useEffect } from 'react';
import { UserRole, Beneficiary, Agent, CheckIn, Escalation, ImportBatch } from '../types/gvg';
import { MockDataStore } from '../lib/data/mockStore';
import { OfflineCheckinQueue } from '../lib/offline/checkinQueue';
import { Navbar } from '../components/layout/Navbar';
import { GVGLandingPage } from '../components/landing/GVGLandingPage';
import { AuthPage } from '../components/auth/AuthPage';
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

  // View Navigation State: 'landing' | 'auth' | 'workspace'
  const [viewMode, setViewMode] = useState<'landing' | 'auth' | 'workspace'>('landing');

  // Auth Session State
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [loggedInUser, setLoggedInUser] = useState<{ name: string; emailOrPhone: string; lga?: string }>({
    name: 'Director General (NSIPA)',
    emailOrPhone: 'superadmin@nsipa.gov.ng',
  });

  // Theme Mode State
  const [themeMode, setThemeMode] = useState<'dark' | 'light'>('dark');

  // Role & Navigation Tabs
  const [currentRole, setCurrentRole] = useState<UserRole>('super_admin');
  const [activeTab, setActiveTab] = useState<string>('registry');

  // Data Collections
  const [beneficiaries, setBeneficiaries] = useState<Beneficiary[]>([]);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [checkIns, setCheckIns] = useState<CheckIn[]>([]);
  const [escalations, setEscalations] = useState<Escalation[]>([]);
  const [importBatches, setImportBatches] = useState<ImportBatch[]>([]);

  // Network & Queue
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [queuedItemsCount, setQueuedItemsCount] = useState<number>(0);

  // Selected Beneficiary Modal
  const [selectedBeneficiary, setSelectedBeneficiary] = useState<Beneficiary | null>(null);

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

    if (typeof window !== 'undefined') {
      const savedTheme = (localStorage.getItem('gvg_theme_mode') as 'dark' | 'light') || 'dark';
      setThemeMode(savedTheme);
      if (savedTheme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }

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

  const handleToggleTheme = () => {
    const nextTheme = themeMode === 'dark' ? 'light' : 'dark';
    setThemeMode(nextTheme);
    if (typeof window !== 'undefined') {
      localStorage.setItem('gvg_theme_mode', nextTheme);
      if (nextTheme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  };

  const handleLogin = (
    role: UserRole,
    userDetails: { name: string; emailOrPhone: string; lga?: string }
  ) => {
    setCurrentRole(role);
    setLoggedInUser(userDetails);
    setIsAuthenticated(true);
    setViewMode('workspace');

    if (role === 'agent') {
      setActiveTab('checkin');
    } else if (role === 'beneficiary') {
      setActiveTab('whatsapp');
    } else {
      setActiveTab('registry');
    }
  };

  const handleQuickRoleLogin = (role: UserRole) => {
    const name =
      role === 'super_admin'
        ? 'Director General (NSIPA)'
        : role === 'admin'
        ? 'Kano State Admin'
        : role === 'agent'
        ? 'Aminu Bello (Agent)'
        : 'Fatima Abubakar';

    const contact =
      role === 'super_admin'
        ? 'superadmin@nsipa.gov.ng'
        : role === 'admin'
        ? 'admin.kano@nsipa.gov.ng'
        : '+2348031234567';

    handleLogin(role, { name, emailOrPhone: contact, lga: 'Kano Municipal' });
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setViewMode('auth');
  };

  const syncOfflineQueue = () => {
    const queue = offlineQueue.getQueue();
    if (queue.length === 0) return;

    queue.forEach((item) => {
      store.addCheckIn(item.checkIn);
    });

    offlineQueue.clearQueue();
    refreshData();
  };

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

  const currentAgent = agents[0] || {
    id: 'agent-101',
    name: 'Aminu Bello',
    assigned_lga: loggedInUser.lga || 'Kano Municipal',
    phone_number: loggedInUser.emailOrPhone || '+2348031234567',
    state: 'Kano',
  };

  const displayedBeneficiaries =
    currentRole === 'agent'
      ? beneficiaries.filter((b) => b.lga === currentAgent.assigned_lga)
      : beneficiaries;

  const openEscalationsCount = escalations.filter((e) => e.status === 'open').length;

  // View 1: Public Landing Page
  if (viewMode === 'landing') {
    return (
      <GVGLandingPage
        onEnterWorkspace={() => setViewMode('auth')}
        onQuickRoleLogin={handleQuickRoleLogin}
        themeMode={themeMode}
        onToggleTheme={handleToggleTheme}
      />
    );
  }

  // View 2: Authentication Portal
  if (viewMode === 'auth' || !isAuthenticated) {
    return (
      <AuthPage
        onLogin={handleLogin}
        themeMode={themeMode}
        onToggleTheme={handleToggleTheme}
      />
    );
  }

  // View 3: Operational Field & Admin Tracking Workspace
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors duration-300">
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
        themeMode={themeMode}
        onToggleTheme={handleToggleTheme}
        loggedInUser={loggedInUser}
        onLogout={handleLogout}
        onGoToLanding={() => setViewMode('landing')}
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
      <footer className="border-t border-slate-200 dark:border-slate-900 bg-white dark:bg-slate-950 py-6 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <strong>NSIPA GVG Progress Tracker</strong> • Support: +234 802 126 6483 | info@nsipa.gov.ng
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setViewMode('landing')}
              className="text-slate-400 hover:text-emerald-500 transition"
            >
              Public GVG Overview
            </button>
            <button
              onClick={handleResetDemoData}
              className="text-slate-400 hover:text-amber-500 flex items-center gap-1 transition"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Reset Demo Datasets
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
