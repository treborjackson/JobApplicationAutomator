import { apiClient } from './client';
import type { StudyPlan, GenerateStudyPlanParams } from '../types/studyPlan';

export const studyPlanApi = {
  generate: (data: GenerateStudyPlanParams) =>
    apiClient.post<StudyPlan>('/study-plan/generate', data),
  get: () => apiClient.get<StudyPlan>('/study-plan/'),
  markTopic: (planId: string, topicIndex: number, done: boolean) =>
    apiClient.put(`/study-plan/${planId}/topic/${topicIndex}`, { done }),
  getTemplates: (role?: string) =>
    apiClient.get('/study-plan/templates', { params: role ? { role } : undefined }),
  delete: (planId: string) => apiClient.delete(`/study-plan/${planId}`),
};
