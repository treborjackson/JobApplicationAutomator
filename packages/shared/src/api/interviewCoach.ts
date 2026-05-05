import { apiClient } from './client';
import type {
  InterviewSession,
  InterviewType,
  AnswerFeedback,
  InterviewTips,
} from '../types/interviewCoach';

export const interviewCoachApi = {
  startSession: (data: { role_title: string; interview_type: InterviewType; job_id?: string }) =>
    apiClient.post<InterviewSession>('/interview/session/start', data),
  submitAnswer: (sessionId: string, answer: string) =>
    apiClient.post<AnswerFeedback>(`/interview/session/${sessionId}/answer`, { answer }),
  getSession: (sessionId: string) =>
    apiClient.get<InterviewSession>(`/interview/session/${sessionId}`),
  listSessions: () => apiClient.get<InterviewSession[]>('/interview/sessions'),
  getTips: (data: { role_title: string; interview_type: InterviewType }) =>
    apiClient.post<InterviewTips>('/interview/tips', data),
  getQuestionBank: (params: { role: string; type: InterviewType; difficulty?: string }) =>
    apiClient.get('/interview/questions/bank', { params }),
};
