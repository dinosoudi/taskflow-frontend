import { useInfiniteQuery } from '@tanstack/react-query';
import { notesApi } from '@/api/notes.api';

const PAGE_SIZE = 20;

export const notesKeys = {
  all: ['notes'] as const,
  list: (tagId?: string) => ['notes', 'list', tagId ?? 'all'] as const,
};

export function useNotes(tagId?: string) {
  return useInfiniteQuery({
    queryKey: notesKeys.list(tagId),
    queryFn: ({ pageParam = 0 }) => {
      if (tagId) {
        return notesApi.getByTag(tagId, { page: pageParam as number, size: PAGE_SIZE });
      }
      return notesApi.getAll({ page: pageParam as number, size: PAGE_SIZE, sort: 'updatedAt', direction: 'DESC' });
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage) => {
      if (lastPage.last) return undefined; // no hay más páginas
      return lastPage.page + 1;
    },
    staleTime: 2 * 60 * 1000, // 2 min — notas cambian seguido
  });
}
