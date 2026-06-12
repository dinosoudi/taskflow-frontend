// ─────────────────────────────────────────────────────────────
// Tipos base — derivados de ErrorResponse en todos los contratos
// ─────────────────────────────────────────────────────────────

export interface ErrorResponse {
  status: number;
  error: string;
  message: string;
  field?: string | null;
  timestamp: string;
  // Solo en 429 de login y resend-verification
  retryAfterSeconds?: number | null;
  // Solo en verify-reset-code (intentos restantes antes del bloqueo)
  attemptsRemaining?: number | null;
}

// Error tipado que lanza el cliente Axios — envuelve ErrorResponse
export class ApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly error: string,
    public readonly field: string | null | undefined,
    public readonly retryAfterSeconds: number | null | undefined,
    public readonly attemptsRemaining: number | null | undefined,
    message: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// ─────────────────────────────────────────────────────────────
// Paginación — estructura estándar Spring Page (notas)
// ─────────────────────────────────────────────────────────────

export interface PageResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
}

export interface PageParams {
  page?: number;
  size?: number;
  sort?: 'updatedAt' | 'createdAt' | 'completed';
  direction?: 'ASC' | 'DESC';
}
