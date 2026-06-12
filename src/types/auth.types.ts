// ─────────────────────────────────────────────────────────────
// Shared DTOs
// ─────────────────────────────────────────────────────────────

export type AuthProvider = 'EMAIL' | 'GOOGLE';

export interface UserDTO {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  emailVerified: boolean;
  authProvider: AuthProvider;
  createdAt: string;
}

export interface TokensDTO {
  accessToken: string;
  refreshToken: string;
  accessTokenExpiresIn: number;
  refreshTokenExpiresIn: number;
}

// AuthResponse — tokens es null en /register, presente en /verify-email y /login
export interface AuthResponse {
  message: string;
  user: UserDTO;
  tokens: TokensDTO | null;
}

// ─────────────────────────────────────────────────────────────
// /auth/register
// ─────────────────────────────────────────────────────────────

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  phone?: string | null;
}

// ─────────────────────────────────────────────────────────────
// /auth/verify-email
// ─────────────────────────────────────────────────────────────

export interface VerifyEmailRequest {
  token: string;
}

// ─────────────────────────────────────────────────────────────
// /auth/resend-verification
// ─────────────────────────────────────────────────────────────

export interface ResendVerificationRequest {
  email: string;
}

export interface MessageResponse {
  message: string;
  expiresInMinutes?: number | null;
  sessionsClosedCount?: number | null;
  deletionScheduledAt?: string | null;
}

// ─────────────────────────────────────────────────────────────
// /auth/login
// ─────────────────────────────────────────────────────────────

export interface LoginRequest {
  identifier: string; // email en v1, teléfono en v2
  password: string;
}

// ─────────────────────────────────────────────────────────────
// /auth/refresh
// ─────────────────────────────────────────────────────────────

export interface RefreshRequest {
  refreshToken: string;
}

export interface RefreshResponse {
  accessToken: string;
  refreshToken: string;
  accessTokenExpiresIn: number;
  refreshTokenExpiresIn: number;
}

// ─────────────────────────────────────────────────────────────
// /auth/forgot-password  (paso 1)
// ─────────────────────────────────────────────────────────────

export interface ForgotPasswordRequest {
  email: string;
}

// ─────────────────────────────────────────────────────────────
// /auth/verify-reset-code  (paso 2)
// ─────────────────────────────────────────────────────────────

export interface VerifyResetCodeRequest {
  email: string;
  code: string; // 6 dígitos numéricos
}

export interface VerifyResetCodeResponse {
  message: string;
  resetToken: string; // UUID — expira en 15 min, guardar en memoria
  expiresInMinutes: number;
}

// ─────────────────────────────────────────────────────────────
// /auth/reset-password  (paso 3)
// ─────────────────────────────────────────────────────────────

export interface ResetPasswordRequest {
  resetToken: string;
  newPassword: string;
  confirmPassword: string;
}

// ─────────────────────────────────────────────────────────────
// /auth/logout  /  /auth/logout-all
// ─────────────────────────────────────────────────────────────

export interface LogoutRequest {
  refreshToken: string;
}
