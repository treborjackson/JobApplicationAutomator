export interface Job {
  id: string;
  external_id: string;
  source: string;
  title: string;
  company: string;
  location: string;
  remote_type: 'remote' | 'hybrid' | 'onsite';
  salary_min?: number;
  salary_max?: number;
  description: string;
  url: string;
  posted_at: string;
  fetched_at: string;
  match_score?: number;
}

export interface JobSearchParams {
  query: string;
  location?: string;
  remote_type?: string;
  salary_min?: number;
  salary_max?: number;
  page?: number;
  limit?: number;
}
