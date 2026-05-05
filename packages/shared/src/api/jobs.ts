import { apiClient } from './client';
import type { Job, JobSearchParams } from '../types/job';

export const jobsApi = {
  search: (params: JobSearchParams) =>
    apiClient.get<Job[]>('/jobs/search', { params }),
  getById: (id: string) => apiClient.get<Job>(`/jobs/${id}`),
  save: (id: string) => apiClient.post(`/jobs/${id}/save`),
  getSaved: () => apiClient.get<Job[]>('/jobs/saved'),
};
