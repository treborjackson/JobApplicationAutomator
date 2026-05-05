import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { studyPlanApi } from '../api/studyPlan';
import type { GenerateStudyPlanParams } from '../types/studyPlan';

export const useStudyPlan = () =>
  useQuery({
    queryKey: ['studyPlan'],
    queryFn: () => studyPlanApi.get().then((r) => r.data),
  });

export const useGenerateStudyPlan = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: GenerateStudyPlanParams) =>
      studyPlanApi.generate(data).then((r) => r.data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['studyPlan'] }),
  });
};

export const useMarkTopic = (planId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ topicIndex, done }: { topicIndex: number; done: boolean }) =>
      studyPlanApi.markTopic(planId, topicIndex, done),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['studyPlan'] }),
  });
};
