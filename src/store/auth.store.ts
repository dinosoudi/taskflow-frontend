import { create } from 'zustand';
import { tokenStore } from '../api/client';
import type { UserDTO } from '../types';
import type { TokensDTO } from '../types';

// ─────────────────────────────────────────────────────────────
// State shape
// ─────────────────────────────────────────────────────────────

interface AuthState {
  user: UserDTO | null;
  isAuthenticated: boolean;

  // Actions
  setSession: (user: UserDTO, tokens: TokensDTO) => void;
  updateUser: (user: UserDTO) => void;
  clearSession: () => void;
}

// ─────────────────────────────────────────────────────────────
// Store
// No se usa persist middleware — el accessToken nunca debe tocar
// localStorage. Al recargar la página el usuario debe re-autenticar
// vía el refreshToken (que sí está en localStorage) usando el
// interceptor de Axios o el AuthProvider al montar la app.
// ─────────────────────────────────────────────────────────────

export const useAuthStore = create<AuthState>()((set) => ({
  user: null,
  isAuthenticated: false,

  setSession: (user, tokens) => {
    tokenStore.setAccess(tokens.accessToken);
    tokenStore.setRefresh(tokens.refreshToken);
    set({ user, isAuthenticated: true });
  },

  updateUser: (user) => {
    set({ user });
  },

  clearSession: () => {
    tokenStore.clearAll();
    set({ user: null, isAuthenticated: false });
  },
}));
