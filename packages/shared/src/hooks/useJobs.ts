import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { jobsApi } from '../api/jobs';
import type { JobSearchParams } from '../types/job';

export const useJobSearch = (params: JobSearchParams, enabled = true) =>
  useQuery({
    queryKey: ['jobs', 'search', params],
    queryFn: () => jobsApi.search(params).then((r) => r.data),
    enabled,
  });

export const useSavedJobs = () =>
  useQuery({
    queryKey: ['jobs', 'saved'],
    queryFn: () => jobsApi.getSaved().then((r) => r.data),
  });

export const useSaveJob = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => jobsApi.save(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['jobs', 'saved'] }),
  });
};
