import { useQuery } from '@tanstack/react-query';
import { tagsApi } from '@/api/tags.api';

export const tagsKeys = {
  all: ['tags'] as const,
  list: () => ['tags', 'list'] as const,
};

export function useTags() {
  return useQuery({
    queryKey: tagsKeys.list(),
    queryFn: () => tagsApi.getAll(),
    staleTime: 5 * 60 * 1000,
  });
}
