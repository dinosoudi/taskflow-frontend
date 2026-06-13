import { useMutation, useQueryClient } from '@tanstack/react-query';
import { notesApi } from '@/api/notes.api';
import { notesKeys } from './useNotes';
import type { NotePageResponse, NoteResponse } from '@/types';
import type { InfiniteData } from '@tanstack/react-query';

function updateNoteInPages(
  old: InfiniteData<NotePageResponse> | undefined,
  noteId: string,
  updater: (note: NoteResponse) => NoteResponse,
): InfiniteData<NotePageResponse> | undefined {
  if (!old) return old;
  return {
    ...old,
    pages: old.pages.map((page) => ({
      ...page,
      content: page.content.map((note) =>
        note.id === noteId ? updater(note) : note,
      ),
    })),
  };
}

export function useUpdateNote(tagId?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ noteId, data }: { noteId: string; data: Parameters<typeof notesApi.update>[1] }) =>
      notesApi.update(noteId, data),

    onMutate: async ({ noteId, data }) => {
      const queryKey = notesKeys.list(tagId);
      await queryClient.cancelQueries({ queryKey });
      const previous = queryClient.getQueryData<InfiniteData<NotePageResponse>>(queryKey);

      queryClient.setQueryData<InfiniteData<NotePageResponse>>(queryKey, (old) =>
        updateNoteInPages(old, noteId, (note) => ({
          ...note,
          content: data.content ?? note.content,
          completed: data.completed ?? note.completed,
          updatedAt: new Date().toISOString(),
        })),
      );

      return { previous };
    },

    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(notesKeys.list(tagId), context.previous);
      }
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: notesKeys.list(tagId) });
    },
  });
}
