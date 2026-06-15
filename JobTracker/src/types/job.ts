export type JobStatus = 'Saved' | 'Applied' | 'Interviewing' | 'Offer' | 'Rejected';
export type JobPriority = 'Low' | 'Medium' | 'High';

export interface Job {
  id: string;
  company: string;
  title: string;
  status: JobStatus;
  priority: JobPriority;
  dateAdded: string; // ISO string
  notes?: string;
  description?: string;
  contacts?: string;
  mailUsed?: string;
  payAmount?: string;
  jobLink?: string;
  offerReceivedDate?: string;
  employmentEndDate?: string;
  category?: string;
}

