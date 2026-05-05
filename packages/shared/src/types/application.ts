export type ApplicationStatus =
  | 'pending'
  | 'interview'
  | 'rejected'
  | 'offer'
  | 'withdrawn';

export interface Application {
  id: string;
  user_id: string;
  job_listing_id: string;
  cover_letter_id?: string;
  status: ApplicationStatus;
  submission_method: 'auto' | 'manual' | 'package';
  submitted_at: string;
  last_updated_at: string;
  notes?: string;
  job?: import('./job').Job;
}

export interface ApplicationStats {
  total_applied: number;
  interviews: number;
  offers: number;
  rejection_rate: number;
}
