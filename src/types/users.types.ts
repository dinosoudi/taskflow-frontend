import type { AuthProvider } from './auth.types';

// ─────────────────────────────────────────────────────────────
// Preferencias de UI — sincronizadas en BD
// ─────────────────────────────────────────────────────────────

export type Language = 'es' | 'en';

export interface PreferencesResponse {
  darkMode: boolean;
  language: Language;
}

// ─────────────────────────────────────────────────────────────
// UserProfileResponse — GET /users/me
// Incluye preferences y deletionScheduledAt que no tiene UserDTO
// ─────────────────────────────────────────────────────────────

export interface UserProfileResponse {
  id: string;
  name: string;
  email: string; // no editable en v1
  phone: string | null;
  emailVerified: boolean;
  authProvider: AuthProvider;
  preferences: PreferencesResponse;
  createdAt: string;
  deletionScheduledAt: string | null; // null = cuenta activa
}

// ─────────────────────────────────────────────────────────────
// Requests de actualización de perfil
// ─────────────────────────────────────────────────────────────

export interface UpdateNameRequest {
  name: string;
}

export interface UpdatePhoneRequest {
  phone: string | null; // null = eliminar teléfono del perfil
}

export interface UpdatePreferencesRequest {
  darkMode: boolean;
  language: Language;
}

// ─────────────────────────────────────────────────────────────
// Cambio de contraseña
// ─────────────────────────────────────────────────────────────

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
  closeOtherSessions?: boolean; // default false
}

// ─────────────────────────────────────────────────────────────
// Eliminación de cuenta
// ─────────────────────────────────────────────────────────────

export interface DeleteAccountRequest {
  password: string;
  confirmation: string; // debe ser exactamente "ELIMINAR"
}
