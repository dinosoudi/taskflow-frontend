import { useMutation, useQueryClient } from '@tanstack/react-query';
import { usersApi } from '@/api/users.api';
import { useAuthStore } from '@/store/auth.store';
import { profileKeys } from './useProfile';
import type {
  ChangePasswordRequest,
  DeleteAccountRequest,
  UpdateNameRequest,
  UpdatePhoneRequest,
  UpdatePreferencesRequest,
} from '@/types';

// ─────────────────────────────────────────────────────────────
// useUpdateName
// ─────────────────────────────────────────────────────────────

export function useUpdateName() {
  const queryClient = useQueryClient();
  const updateUser = useAuthStore((s) => s.updateUser);

  return useMutation({
    mutationFn: (data: UpdateNameRequest) => usersApi.updateName(data),
    onSuccess: (profile) => {
      // Actualizar el store de auth para que el sidebar refleje el nuevo nombre
      updateUser({
        id: profile.id,
        name: profile.name,
        email: profile.email,
        phone: profile.phone,
        emailVerified: profile.emailVerified,
        authProvider: profile.authProvider,
        createdAt: profile.createdAt,
      });
      queryClient.invalidateQueries({ queryKey: profileKeys.me() });
    },
  });
}

// ─────────────────────────────────────────────────────────────
// useUpdatePhone
// ─────────────────────────────────────────────────────────────

export function useUpdatePhone() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdatePhoneRequest) => usersApi.updatePhone(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: profileKeys.me() });
    },
  });
}

// ─────────────────────────────────────────────────────────────
// useChangePassword
// ─────────────────────────────────────────────────────────────

export function useChangePassword() {
  return useMutation({
    mutationFn: (data: ChangePasswordRequest) => usersApi.changePassword(data),
  });
}

// ─────────────────────────────────────────────────────────────
// useUpdatePreferences — con optimistic update
// El contrato dice que el frontend aplica el cambio de inmediato
// y llama al backend en segundo plano
// ─────────────────────────────────────────────────────────────

export function useUpdatePreferences() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdatePreferencesRequest) => usersApi.updatePreferences(data),
    onMutate: async (newPrefs) => {
      await queryClient.cancelQueries({ queryKey: profileKeys.me() });
      const previous = queryClient.getQueryData(profileKeys.me());

      queryClient.setQueryData(profileKeys.me(), (old: any) => {
        if (!old) return old;
        return { ...old, preferences: newPrefs };
      });

      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(profileKeys.me(), context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: profileKeys.me() });
    },
  });
}

// ─────────────────────────────────────────────────────────────
// useDeleteAccount
// ─────────────────────────────────────────────────────────────

export function useDeleteAccount() {
  const queryClient = useQueryClient();
  const clearSession = useAuthStore((s) => s.clearSession);

  return useMutation({
    mutationFn: (data: DeleteAccountRequest) => usersApi.deleteAccount(data),
    onSuccess: () => {
      queryClient.clear();
      clearSession();
    },
  });
}

// ─────────────────────────────────────────────────────────────
// useCancelDeletion
// ─────────────────────────────────────────────────────────────

export function useCancelDeletion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => usersApi.cancelDeletion(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: profileKeys.me() });
    },
  });
}