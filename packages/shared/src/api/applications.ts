import { apiClient } from './client';
import type { Application, ApplicationStats } from '../types/application';

export const applicationsApi = {
  submit: (data: { job_listing_id: string; cover_letter_id?: string; submission_method: string }) =>
    apiClient.post<Application>('/applications/submit', data),
  list: () => apiClient.get<Application[]>('/applications/'),
  getById: (id: string) => apiClient.get<Application>(`/applications/${id}`),
  updateStatus: (id: string, status: string) =>
    apiClient.put<Application>(`/applications/${id}/status`, { status }),
  delete: (id: string) => apiClient.delete(`/applications/${id}`),
  export: () => apiClient.get('/applications/export', { responseType: 'blob' }),
};
