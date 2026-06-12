import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import type { ApiError } from '../types';

// ─────────────────────────────────────────────────────────────
// cn — merge de clases Tailwind (shadcn/ui standard)
// ─────────────────────────────────────────────────────────────

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// ─────────────────────────────────────────────────────────────
// isApiError — type guard para errores del cliente
// ─────────────────────────────────────────────────────────────

export function isApiError(error: unknown): error is ApiError {
  return error instanceof Error && error.name === 'ApiError';
}

// ─────────────────────────────────────────────────────────────
// formatRetryTimer — convierte segundos a "mm:ss" para los 429
// Ejemplo: formatRetryTimer(900) → "15:00"
// ─────────────────────────────────────────────────────────────

export function formatRetryTimer(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

// ─────────────────────────────────────────────────────────────
// formatDate — ISO string a fecha legible en español
// ─────────────────────────────────────────────────────────────

export function formatDate(isoString: string): string {
  return new Intl.DateTimeFormat('es-MX', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(isoString));
}

// ─────────────────────────────────────────────────────────────
// PASSWORD_REGEX — regla compartida frontend/validación Zod
// Mínimo 8 chars, al menos 1 mayúscula, 1 número
// ─────────────────────────────────────────────────────────────

export const PASSWORD_REGEX = /^(?=.*[A-Z])(?=.*\d).{8,72}$/;
export const PASSWORD_HINT = 'Mínimo 8 caracteres, una mayúscula y un número';

// ─────────────────────────────────────────────────────────────
// HEX_COLOR_REGEX — validación de color para tags
// ─────────────────────────────────────────────────────────────

export const HEX_COLOR_REGEX = /^#[0-9A-Fa-f]{6}$/;
