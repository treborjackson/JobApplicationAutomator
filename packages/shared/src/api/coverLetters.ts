import { apiClient } from './client';

export interface CoverLetter {
  id: string;
  user_id: string;
  job_listing_id: string;
  content: string;
  generated_at: string;
  edited_at?: string;
}

export const coverLettersApi = {
  generate: (data: { job_listing_id: string }) =>
    apiClient.post<CoverLetter>('/cover-letters/generate', data),
  getById: (id: string) => apiClient.get<CoverLetter>(`/cover-letters/${id}`),
  update: (id: string, content: string) =>
    apiClient.put<CoverLetter>(`/cover-letters/${id}`, { content }),
};
