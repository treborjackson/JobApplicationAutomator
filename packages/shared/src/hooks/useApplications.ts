import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { applicationsApi } from '../api/applications';

export const useApplications = () =>
  useQuery({
    queryKey: ['applications'],
    queryFn: () => applicationsApi.list().then((r) => r.data),
  });

export const useUpdateApplicationStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      applicationsApi.updateStatus(id, status),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['applications'] }),
  });
};
