import { useMutation, useQueryClient } from '@tanstack/react-query';
import { tagsApi } from '@/api/tags.api';
import { tagsKeys } from './useTags';
import { notesKeys } from '@/hooks/notes/useNotes';
import type { TagRequest } from '@/types';

// ─────────────────────────────────────────────────────────────
// useCreateTag
// ─────────────────────────────────────────────────────────────

export function useCreateTag() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: TagRequest) => tagsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tagsKeys.all });
    },
  });
}

// ─────────────────────────────────────────────────────────────
// useUpdateTag
// ─────────────────────────────────────────────────────────────

export function useUpdateTag() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ tagId, data }: { tagId: string; data: TagRequest }) =>
      tagsApi.update(tagId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tagsKeys.all });
      // Invalidar notas también porque el TagSummary embebido puede haber cambiado
      queryClient.invalidateQueries({ queryKey: notesKeys.all });
    },
  });
}

// ─────────────────────────────────────────────────────────────
// useDeleteTag
//
// Devuelve el noteCount si el tag tiene notas (409 con force=false).
// El componente muestra un modal de confirmación y llama
// deleteWithForce() si el usuario confirma.
// ─────────────────────────────────────────────────────────────

export function useDeleteTag() {
  const queryClient = useQueryClient();

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: tagsKeys.all });
    queryClient.invalidateQueries({ queryKey: notesKeys.all });
  };

  const deleteMutation = useMutation({
    mutationFn: (tagId: string) => tagsApi.delete(tagId, false),
    onSuccess: (result) => {
      // result === void → borrado directo (tag sin notas)
      // result === number → 409, hay notas — el componente maneja el modal
      if (result === undefined) invalidate();
    },
  });

  const deleteForceMutation = useMutation({
    mutationFn: (tagId: string) => tagsApi.delete(tagId, true),
    onSuccess: () => invalidate(),
  });

  return { deleteMutation, deleteForceMutation };
}
