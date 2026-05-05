import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { interviewCoachApi } from '../api/interviewCoach';
import type { InterviewType } from '../types/interviewCoach';

export const useInterviewSessions = () =>
  useQuery({
    queryKey: ['interview', 'sessions'],
    queryFn: () => interviewCoachApi.listSessions().then((r) => r.data),
  });

export const useInterviewSession = (sessionId: string) =>
  useQuery({
    queryKey: ['interview', 'session', sessionId],
    queryFn: () => interviewCoachApi.getSession(sessionId).then((r) => r.data),
    enabled: !!sessionId,
  });

export const useStartInterviewSession = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { role_title: string; interview_type: InterviewType; job_id?: string }) =>
      interviewCoachApi.startSession(data).then((r) => r.data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['interview', 'sessions'] }),
  });
};

export const useSubmitAnswer = (sessionId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (answer: string) =>
      interviewCoachApi.submitAnswer(sessionId, answer).then((r) => r.data),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ['interview', 'session', sessionId] }),
  });
};
