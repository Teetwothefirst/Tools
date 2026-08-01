import { Beneficiary, Agent, CheckIn, Escalation, ImportBatch, ProfileStatus, BeneficiaryStatus } from '../../types/gvg';

const STORAGE_KEY_PREFIX = 'gvg_tracker_data_v1';

export const INITIAL_AGENTS: Agent[] = [
  {
    id: 'agent-101',
    name: 'Aminu Bello',
    phone_number: '+2348031234567',
    assigned_lga: 'Kano Municipal',
    state: 'Kano',
    role: 'agent',
    created_by: 'admin-01',
    active: true,
    created_at: '2026-01-15T09:00:00Z',
  },
  {
    id: 'agent-102',
    name: 'Funke Adeniyi',
    phone_number: '+2348029876543',
    assigned_lga: 'Alimosho',
    state: 'Lagos',
    role: 'agent',
    created_by: 'admin-01',
    active: true,
    created_at: '2026-01-16T10:30:00Z',
  },
  {
    id: 'agent-103',
    name: 'Chidi Okonkwo',
    phone_number: '+2348145551234',
    assigned_lga: 'Enugu North',
    state: 'Enugu',
    role: 'agent',
    created_by: 'admin-01',
    active: true,
    created_at: '2026-01-18T14:15:00Z',
  },
  {
    id: 'agent-104',
    name: 'Taribi Dappa',
    phone_number: '+2348094448899',
    assigned_lga: 'Port Harcourt',
    state: 'Rivers',
    role: 'agent',
    created_by: 'admin-01',
    active: true,
    created_at: '2026-01-20T11:00:00Z',
  },
];

export const INITIAL_BENEFICIARIES: Beneficiary[] = [
  {
    id: 'ben-001',
    full_name: 'Fatima Abubakar',
    phone_number: '+2348039991122',
    lga: 'Kano Municipal',
    state: 'Kano',
    category: 'sewing',
    disability_status: 'Mobility Impairment',
    disbursement_date: '2026-02-10',
    amount_received: 40000,
    machine_serial: 'SEW-KN-9821',
    baseline_photo_url: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=400',
    assigned_agent_id: 'agent-101',
    assigned_agent_name: 'Aminu Bello',
    profile_status: 'complete',
    status: 'active',
    created_at: '2026-02-10T08:00:00Z',
    source: 'batch-001',
    missed_checkins_count: 0,
    last_checkin_date: '2026-07-25T10:30:00Z',
  },
  {
    id: 'ben-002',
    full_name: 'Usman Garba',
    phone_number: '+2348123334455',
    lga: 'Kano Municipal',
    state: 'Kano',
    category: 'grinding',
    disability_status: 'Visual Impairment',
    disbursement_date: '2026-02-10',
    amount_received: 40000,
    machine_serial: 'GRD-KN-4412',
    baseline_photo_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
    assigned_agent_id: 'agent-101',
    assigned_agent_name: 'Aminu Bello',
    profile_status: 'complete',
    status: 'inactive',
    created_at: '2026-02-10T08:30:00Z',
    source: 'batch-001',
    missed_checkins_count: 1,
    last_checkin_date: '2026-07-20T11:00:00Z',
  },
  {
    id: 'ben-003',
    full_name: 'Blessing Ogunleye',
    phone_number: '+2348057778899',
    lga: 'Alimosho',
    state: 'Lagos',
    category: 'sewing',
    disability_status: 'Hearing Impairment',
    disbursement_date: '2026-02-15',
    amount_received: 40000,
    machine_serial: 'SEW-LA-1109',
    baseline_photo_url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400',
    assigned_agent_id: 'agent-102',
    assigned_agent_name: 'Funke Adeniyi',
    profile_status: 'complete',
    status: 'active',
    created_at: '2026-02-15T09:15:00Z',
    source: 'batch-001',
    missed_checkins_count: 0,
    last_checkin_date: '2026-07-28T15:20:00Z',
  },
  {
    id: 'ben-004',
    full_name: 'Emeka Nnamdi',
    phone_number: '+2348186665544',
    lga: 'Enugu North',
    state: 'Enugu',
    category: 'grinding',
    disability_status: null,
    disbursement_date: '2026-02-18',
    amount_received: 40000,
    machine_serial: 'GRD-EN-7731',
    baseline_photo_url: null,
    assigned_agent_id: 'agent-103',
    assigned_agent_name: 'Chidi Okonkwo',
    profile_status: 'complete',
    status: 'unreachable',
    created_at: '2026-02-18T14:00:00Z',
    source: 'batch-002',
    missed_checkins_count: 2,
    last_checkin_date: '2026-05-12T09:00:00Z',
  },
  {
    id: 'ben-005',
    full_name: 'Khadijah Sanusi',
    phone_number: '+2348091112233',
    lga: 'Kano Municipal',
    state: 'Kano',
    category: 'unassigned',
    disability_status: null,
    disbursement_date: null,
    amount_received: 40000,
    machine_serial: null,
    baseline_photo_url: null,
    assigned_agent_id: 'agent-101',
    assigned_agent_name: 'Aminu Bello',
    profile_status: 'incomplete',
    status: 'active',
    created_at: '2026-03-01T10:00:00Z',
    source: 'batch-003',
    missed_checkins_count: 0,
    last_checkin_date: null,
  },
  {
    id: 'ben-006',
    full_name: 'Baridilo Briggs',
    phone_number: '+2348134449900',
    lga: 'Port Harcourt',
    state: 'Rivers',
    category: 'sewing',
    disability_status: 'Senior Citizen (72 yrs)',
    disbursement_date: '2026-02-22',
    amount_received: 40000,
    machine_serial: 'SEW-RV-3012',
    baseline_photo_url: null,
    assigned_agent_id: 'agent-104',
    assigned_agent_name: 'Taribi Dappa',
    profile_status: 'complete',
    status: 'active',
    created_at: '2026-02-22T11:30:00Z',
    source: 'batch-002',
    missed_checkins_count: 0,
    last_checkin_date: '2026-07-29T16:00:00Z',
  },
];

export const INITIAL_CHECKINS: CheckIn[] = [
  {
    id: 'chk-001',
    beneficiary_id: 'ben-001',
    beneficiary_name: 'Fatima Abubakar',
    agent_id: 'agent-101',
    agent_name: 'Aminu Bello',
    date: '2026-07-25T10:30:00Z',
    channel: 'agent_visit',
    business_active: true,
    machine_in_use: true,
    estimated_monthly_income: 38000,
    challenges: ['High electricity bills', 'Need more fabric supply'],
    needs_assistance: false,
    photo_url: 'https://images.unsplash.com/photo-1556740758-90de374c12ad?w=400',
    notes: 'Fatima has taken 3 local sewing apprentices and expanded her workshop space.',
  },
  {
    id: 'chk-002',
    beneficiary_id: 'ben-002',
    beneficiary_name: 'Usman Garba',
    agent_id: 'agent-101',
    agent_name: 'Aminu Bello',
    date: '2026-06-15T11:00:00Z',
    channel: 'agent_visit',
    business_active: false,
    machine_in_use: false,
    estimated_monthly_income: 0,
    challenges: ['Motor spark plug broken', 'Lack of capital for repair'],
    needs_assistance: true,
    photo_url: null,
    notes: 'Grinding machine belt damaged. Beneficiary currently lacks ₦3,500 for replacement parts.',
  },
  {
    id: 'chk-003',
    beneficiary_id: 'ben-002',
    beneficiary_name: 'Usman Garba',
    agent_id: 'agent-101',
    agent_name: 'Aminu Bello',
    date: '2026-07-20T11:00:00Z',
    channel: 'agent_visit',
    business_active: false,
    machine_in_use: false,
    estimated_monthly_income: 0,
    challenges: ['Motor spark plug broken', 'Machine stored in shed'],
    needs_assistance: true,
    photo_url: null,
    notes: 'Second consecutive visit confirming machine idle. Auto-flagged for escalation review.',
  },
  {
    id: 'chk-004',
    beneficiary_id: 'ben-003',
    beneficiary_name: 'Blessing Ogunleye',
    agent_id: 'agent-102',
    agent_name: 'Funke Adeniyi',
    date: '2026-07-28T15:20:00Z',
    channel: 'agent_visit',
    business_active: true,
    machine_in_use: true,
    estimated_monthly_income: 52000,
    challenges: [],
    needs_assistance: false,
    photo_url: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=400',
    notes: 'Excellent progress. Blessing is making school uniforms for two local primary schools.',
  },
];

export const INITIAL_ESCALATIONS: Escalation[] = [
  {
    id: 'esc-001',
    beneficiary_id: 'ben-002',
    beneficiary_name: 'Usman Garba',
    lga: 'Kano Municipal',
    triggered_by: 'chk-003',
    reason: 'Two consecutive check-ins reported business inactive & machine not in use (Needs ₦3,500 repair)',
    status: 'open',
    assigned_to: 'admin-01',
    resolution_notes: null,
    created_at: '2026-07-20T11:05:00Z',
  },
  {
    id: 'esc-002',
    beneficiary_id: 'ben-004',
    beneficiary_name: 'Emeka Nnamdi',
    lga: 'Enugu North',
    triggered_by: 'system_missed',
    reason: 'Unreachable for 2+ scheduled check-in cycles (Phone switched off / relocated)',
    status: 'in_review',
    assigned_to: 'agent-103',
    resolution_notes: 'Agent contacting LGA community liaison for updated contact address.',
    created_at: '2026-07-01T09:00:00Z',
  },
];

export const INITIAL_IMPORT_BATCHES: ImportBatch[] = [
  {
    id: 'batch-001',
    uploaded_by: 'Super Admin',
    filename: 'Kano_Lagos_GVG_Phase1_Disbursement.xlsx',
    format: 'xlsx',
    rows_total: 120,
    rows_added: 118,
    rows_flagged: 2,
    created_at: '2026-02-10T08:00:00Z',
  },
  {
    id: 'batch-002',
    uploaded_by: 'Admin',
    filename: 'Enugu_Rivers_Beneficiaries_WordTable.docx',
    format: 'docx',
    rows_total: 85,
    rows_added: 82,
    rows_flagged: 3,
    created_at: '2026-02-18T14:00:00Z',
  },
  {
    id: 'batch-003',
    uploaded_by: 'Admin',
    filename: 'Raw_LGA_Phone_List_Pasted.csv',
    format: 'csv',
    rows_total: 45,
    rows_added: 45,
    rows_flagged: 0,
    created_at: '2026-03-01T10:00:00Z',
  },
];

export class MockDataStore {
  private static instance: MockDataStore;

  private beneficiaries: Beneficiary[] = [];
  private agents: Agent[] = [];
  private checkIns: CheckIn[] = [];
  private escalations: Escalation[] = [];
  private importBatches: ImportBatch[] = [];

  private constructor() {
    this.loadFromStorage();
  }

  public static getInstance(): MockDataStore {
    if (!MockDataStore.instance) {
      MockDataStore.instance = new MockDataStore();
    }
    return MockDataStore.instance;
  }

  private loadFromStorage() {
    if (typeof window === 'undefined') {
      this.beneficiaries = [...INITIAL_BENEFICIARIES];
      this.agents = [...INITIAL_AGENTS];
      this.checkIns = [...INITIAL_CHECKINS];
      this.escalations = [...INITIAL_ESCALATIONS];
      this.importBatches = [...INITIAL_IMPORT_BATCHES];
      return;
    }

    try {
      const storedBens = localStorage.getItem(`${STORAGE_KEY_PREFIX}_beneficiaries`);
      const storedAgents = localStorage.getItem(`${STORAGE_KEY_PREFIX}_agents`);
      const storedCheckins = localStorage.getItem(`${STORAGE_KEY_PREFIX}_checkins`);
      const storedEscalations = localStorage.getItem(`${STORAGE_KEY_PREFIX}_escalations`);
      const storedBatches = localStorage.getItem(`${STORAGE_KEY_PREFIX}_batches`);

      this.beneficiaries = storedBens ? JSON.parse(storedBens) : [...INITIAL_BENEFICIARIES];
      this.agents = storedAgents ? JSON.parse(storedAgents) : [...INITIAL_AGENTS];
      this.checkIns = storedCheckins ? JSON.parse(storedCheckins) : [...INITIAL_CHECKINS];
      this.escalations = storedEscalations ? JSON.parse(storedEscalations) : [...INITIAL_ESCALATIONS];
      this.importBatches = storedBatches ? JSON.parse(storedBatches) : [...INITIAL_IMPORT_BATCHES];
    } catch (err) {
      console.warn('Error reading from localStorage, using initial mock defaults', err);
      this.beneficiaries = [...INITIAL_BENEFICIARIES];
      this.agents = [...INITIAL_AGENTS];
      this.checkIns = [...INITIAL_CHECKINS];
      this.escalations = [...INITIAL_ESCALATIONS];
      this.importBatches = [...INITIAL_IMPORT_BATCHES];
    }
  }

  private saveToStorage() {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(`${STORAGE_KEY_PREFIX}_beneficiaries`, JSON.stringify(this.beneficiaries));
      localStorage.setItem(`${STORAGE_KEY_PREFIX}_agents`, JSON.stringify(this.agents));
      localStorage.setItem(`${STORAGE_KEY_PREFIX}_checkins`, JSON.stringify(this.checkIns));
      localStorage.setItem(`${STORAGE_KEY_PREFIX}_escalations`, JSON.stringify(this.escalations));
      localStorage.setItem(`${STORAGE_KEY_PREFIX}_batches`, JSON.stringify(this.importBatches));
    } catch (err) {
      console.error('Failed saving to localStorage', err);
    }
  }

  // --- Beneficiaries ---
  public getBeneficiaries(agentLgaFilter?: string | null): Beneficiary[] {
    if (agentLgaFilter) {
      return this.beneficiaries.filter((b) => b.lga === agentLgaFilter);
    }
    return [...this.beneficiaries];
  }

  public getBeneficiaryById(id: string): Beneficiary | undefined {
    return this.beneficiaries.find((b) => b.id === id);
  }

  public addBeneficiaries(newBens: Beneficiary[]): void {
    this.beneficiaries = [...newBens, ...this.beneficiaries];
    this.saveToStorage();
  }

  public updateBeneficiary(id: string, updates: Partial<Beneficiary>): void {
    this.beneficiaries = this.beneficiaries.map((b) => (b.id === id ? { ...b, ...updates } : b));
    this.saveToStorage();
  }

  // --- Agents ---
  public getAgents(): Agent[] {
    return [...this.agents];
  }

  public addAgent(agent: Agent): void {
    this.agents = [agent, ...this.agents];
    this.saveToStorage();
  }

  // --- Check-ins ---
  public getCheckIns(beneficiaryId?: string): CheckIn[] {
    if (beneficiaryId) {
      return this.checkIns.filter((c) => c.beneficiary_id === beneficiaryId);
    }
    return [...this.checkIns];
  }

  public addCheckIn(checkIn: CheckIn): void {
    this.checkIns = [checkIn, ...this.checkIns];

    // Update beneficiary status & last check-in date
    const ben = this.getBeneficiaryById(checkIn.beneficiary_id);
    if (ben) {
      const newStatus: BeneficiaryStatus = checkIn.business_active ? 'active' : 'inactive';
      this.updateBeneficiary(ben.id, {
        status: newStatus,
        last_checkin_date: checkIn.date,
        missed_checkins_count: 0,
      });

      // Check auto-escalation trigger logic
      this.evaluateEscalation(ben, checkIn);
    }

    this.saveToStorage();
  }

  private evaluateEscalation(beneficiary: Beneficiary, latestCheckin: CheckIn) {
    const benCheckins = this.getCheckIns(beneficiary.id);
    const recent2 = benCheckins.slice(0, 2);

    let shouldEscalate = false;
    let reason = '';

    // Condition 1: 2 consecutive check-ins report business_active: false
    if (recent2.length >= 2 && recent2.every((c) => !c.business_active)) {
      shouldEscalate = true;
      reason = '2 consecutive check-ins reported inactive business';
    }

    // Condition 2: machine_in_use: false reported at all
    if (!latestCheckin.machine_in_use) {
      shouldEscalate = true;
      reason = 'Beneficiary machine reported NOT in use';
    }

    // Condition 3: Agent manually flags needs_assistance
    if (latestCheckin.needs_assistance) {
      shouldEscalate = true;
      reason = `Field Agent requested assistance: ${latestCheckin.notes || 'No notes provided'}`;
    }

    if (shouldEscalate) {
      // Check if open escalation already exists for this beneficiary
      const existingOpen = this.escalations.find(
        (e) => e.beneficiary_id === beneficiary.id && e.status !== 'resolved'
      );
      if (!existingOpen) {
        const newEsc: Escalation = {
          id: `esc-${Date.now()}`,
          beneficiary_id: beneficiary.id,
          beneficiary_name: beneficiary.full_name,
          lga: beneficiary.lga,
          triggered_by: latestCheckin.id,
          reason,
          status: 'open',
          assigned_to: 'admin-01',
          created_at: new Date().toISOString(),
        };
        this.escalations = [newEsc, ...this.escalations];
      }
    }
  }

  // --- Escalations ---
  public getEscalations(): Escalation[] {
    return [...this.escalations];
  }

  public updateEscalationStatus(
    id: string,
    status: Escalation['status'],
    resolutionNotes?: string,
    assignedTo?: string
  ): void {
    this.escalations = this.escalations.map((e) => {
      if (e.id === id) {
        return {
          ...e,
          status,
          resolution_notes: resolutionNotes !== undefined ? resolutionNotes : e.resolution_notes,
          assigned_to: assignedTo !== undefined ? assignedTo : e.assigned_to,
          resolved_at: status === 'resolved' ? new Date().toISOString() : e.resolved_at,
        };
      }
      return e;
    });
    this.saveToStorage();
  }

  // --- Batches ---
  public getImportBatches(): ImportBatch[] {
    return [...this.importBatches];
  }

  public addImportBatch(batch: ImportBatch): void {
    this.importBatches = [batch, ...this.importBatches];
    this.saveToStorage();
  }

  public resetToDefaults(): void {
    this.beneficiaries = [...INITIAL_BENEFICIARIES];
    this.agents = [...INITIAL_AGENTS];
    this.checkIns = [...INITIAL_CHECKINS];
    this.escalations = [...INITIAL_ESCALATIONS];
    this.importBatches = [...INITIAL_IMPORT_BATCHES];
    this.saveToStorage();
  }
}
