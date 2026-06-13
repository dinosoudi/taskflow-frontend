import { useMutation, useQueryClient } from '@tanstack/react-query';
import { notesApi } from '@/api/notes.api';
import { notesKeys } from './useNotes';
import type { NotePageResponse, NoteRequest, NoteResponse } from '@/types';
import type { InfiniteData } from '@tanstack/react-query';

export function useCreateNote(tagId?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: NoteRequest) => notesApi.create(data),

    // Optimistic update — insertar la nota al tope de la lista antes de la respuesta
    onMutate: async (newNote) => {
      const queryKey = notesKeys.list(tagId);
      await queryClient.cancelQueries({ queryKey });

      const previous = queryClient.getQueryData<InfiniteData<NotePageResponse>>(queryKey);

      const optimisticNote: NoteResponse = {
        id: `optimistic-${Date.now()}`,
        content: newNote.content,
        completed: false,
        tag: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      queryClient.setQueryData<InfiniteData<NotePageResponse>>(queryKey, (old) => {
        if (!old) return old;
        const firstPage = {
          ...old.pages[0],
          content: [optimisticNote, ...old.pages[0].content],
          totalElements: old.pages[0].totalElements + 1,
        };
        return { ...old, pages: [firstPage, ...old.pages.slice(1)] };
      });

      return { previous };
    },

    // Si falla, revertir al estado anterior
    onError: (_err, _newNote, context) => {
      if (context?.previous) {
        queryClient.setQueryData(notesKeys.list(tagId), context.previous);
      }
    },

    // Siempre sincronizar con el servidor al terminar
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: notesKeys.list(tagId) });
    },
  });
}
