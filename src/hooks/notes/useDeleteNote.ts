import { useMutation, useQueryClient } from '@tanstack/react-query';
import { notesApi } from '@/api/notes.api';
import { notesKeys } from './useNotes';
import type { NotePageResponse } from '@/types';
import type { InfiniteData } from '@tanstack/react-query';

export function useDeleteNote(tagId?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (noteId: string) => notesApi.delete(noteId),

    onMutate: async (noteId) => {
      const queryKey = notesKeys.list(tagId);
      await queryClient.cancelQueries({ queryKey });
      const previous = queryClient.getQueryData<InfiniteData<NotePageResponse>>(queryKey);

      queryClient.setQueryData<InfiniteData<NotePageResponse>>(queryKey, (old) => {
        if (!old) return old;
        return {
          ...old,
          pages: old.pages.map((page) => ({
            ...page,
            content: page.content.filter((note) => note.id !== noteId),
            totalElements: page.totalElements - 1,
          })),
        };
      });

      return { previous };
    },

    onError: (_err, _noteId, context) => {
      if (context?.previous) {
        queryClient.setQueryData(notesKeys.list(tagId), context.previous);
      }
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: notesKeys.list(tagId) });
    },
  });
}
