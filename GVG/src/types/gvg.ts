export type UserRole = 'super_admin' | 'admin' | 'agent' | 'beneficiary';

export type BeneficiaryCategory = 'sewing' | 'grinding' | 'unassigned';

export type ProfileStatus = 'incomplete' | 'complete';

export type BeneficiaryStatus = 'active' | 'inactive' | 'unreachable';

export type CheckinChannel = 'agent_visit' | 'agent_call' | 'whatsapp_self';

export type EscalationStatus = 'open' | 'in_review' | 'resolved';

export interface Agent {
  id: string;
  name: string;
  phone_number: string;
  assigned_lga: string;
  state: string;
  role: 'agent' | 'admin' | 'super_admin';
  created_by: string;
  active: boolean;
  created_at: string;
}

export interface Beneficiary {
  id: string;
  full_name: string;
  phone_number: string;
  lga: string;
  state: string;
  category: BeneficiaryCategory;
  disability_status: string | null;
  disbursement_date: string | null;
  amount_received: number;
  machine_serial: string | null;
  baseline_photo_url: string | null;
  assigned_agent_id: string | null;
  assigned_agent_name?: string;
  profile_status: ProfileStatus;
  status: BeneficiaryStatus;
  created_at: string;
  source: string; // import_batch_id or 'manual'
  missed_checkins_count: number;
  last_checkin_date?: string | null;
}

export interface CheckIn {
  id: string;
  beneficiary_id: string;
  beneficiary_name?: string;
  agent_id: string;
  agent_name?: string;
  date: string;
  channel: CheckinChannel;
  business_active: boolean;
  machine_in_use: boolean;
  estimated_monthly_income: number;
  challenges: string[];
  needs_assistance: boolean;
  photo_url?: string | null;
  notes: string;
  is_offline_queued?: boolean;
}

export interface Escalation {
  id: string;
  beneficiary_id: string;
  beneficiary_name?: string;
  lga?: string;
  triggered_by: string; // checkin_id or 'manual' or 'system_missed'
  reason: string;
  status: EscalationStatus;
  assigned_to?: string | null;
  resolution_notes?: string | null;
  created_at: string;
  resolved_at?: string | null;
}

export interface ImportBatch {
  id: string;
  uploaded_by: string;
  filename: string;
  format: 'xlsx' | 'xls' | 'csv' | 'docx' | 'pasted';
  rows_total: number;
  rows_added: number;
  rows_flagged: number;
  created_at: string;
}

export interface RawImportRow {
  [key: string]: any;
}

export interface ColumnMapping {
  fileHeader: string;
  targetField: keyof Beneficiary | 'ignore';
}

export interface DeduplicationItem {
  row: RawImportRow;
  mappedBeneficiary: Partial<Beneficiary>;
  matchedExisting?: Beneficiary;
  issue: 'exact_duplicate' | 'phone_match' | 'incomplete_fields' | 'valid';
  selectedAction: 'import' | 'overwrite' | 'skip';
}

export interface OfflineCheckInQueueItem {
  id: string;
  checkIn: CheckIn;
  createdAt: string;
}
