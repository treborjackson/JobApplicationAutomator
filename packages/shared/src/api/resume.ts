import { apiClient } from './client';
import type { Resume } from '../types/resume';

export const resumeApi = {
  upload: (formData: FormData) =>
    apiClient.post<Resume>('/resume/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  get: () => apiClient.get<Resume>('/resume/'),
  update: (formData: FormData) =>
    apiClient.put<Resume>('/resume/', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  delete: () => apiClient.delete('/resume/'),
};
