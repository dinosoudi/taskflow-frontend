import axios, {
  AxiosError,
  type AxiosInstance,
  type AxiosRequestConfig,
  type InternalAxiosRequestConfig,
} from 'axios';
import { ApiError, type ErrorResponse } from '../types';

// ─────────────────────────────────────────────────────────────
// Constantes
// ─────────────────────────────────────────────────────────────

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080/api/v1';
const REFRESH_TOKEN_KEY = 'taskflow_refresh_token';

// ─────────────────────────────────────────────────────────────
// Token store en memoria
// El accessToken NUNCA toca localStorage — solo vive en RAM.
// El refreshToken sí va a localStorage (sobrevive F5).
// ─────────────────────────────────────────────────────────────

let _accessToken: string | null = null;

export const tokenStore = {
  getAccess: () => _accessToken,
  setAccess: (token: string | null) => { _accessToken = token; },

  getRefresh: (): string | null =>
    localStorage.getItem(REFRESH_TOKEN_KEY),
  setRefresh: (token: string | null) => {
    if (token) localStorage.setItem(REFRESH_TOKEN_KEY, token);
    else localStorage.removeItem(REFRESH_TOKEN_KEY);
  },

  clearAll: () => {
    _accessToken = null;
    localStorage.removeItem(REFRESH_TOKEN_KEY);
  },
};

// ─────────────────────────────────────────────────────────────
// Instancia Axios principal
// ─────────────────────────────────────────────────────────────

export const apiClient: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15_000,
});

// ─────────────────────────────────────────────────────────────
// Interceptor de REQUEST — inyecta el accessToken en cada llamada
// ─────────────────────────────────────────────────────────────

apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = tokenStore.getAccess();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// ─────────────────────────────────────────────────────────────
// Refresh silencioso
// Cola de requests que fallaron con 401 mientras se refresheaba,
// para reintentarlos todos cuando el nuevo token llegue.
// ─────────────────────────────────────────────────────────────

let _isRefreshing = false;
let _refreshQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: unknown) => void;
}> = [];

function processQueue(error: unknown, token: string | null = null) {
  _refreshQueue.forEach(({ resolve, reject }) => {
    if (error) reject(error);
    else resolve(token!);
  });
  _refreshQueue = [];
}

async function silentRefresh(): Promise<string> {
  const refreshToken = tokenStore.getRefresh();
  if (!refreshToken) throw new Error('No refresh token available');

  // Llamada directa con axios (sin interceptores) para evitar loop infinito
  const response = await axios.post(`${BASE_URL}/auth/refresh`, { refreshToken });
  const { accessToken, refreshToken: newRefresh } = response.data;

  tokenStore.setAccess(accessToken);
  tokenStore.setRefresh(newRefresh);

  return accessToken;
}

// ─────────────────────────────────────────────────────────────
// Interceptor de RESPONSE
// 1. Convierte errores del backend en ApiError tipados
// 2. En 401: intenta refresh silencioso y reintenta el request
// 3. Si el refresh también falla: limpia tokens y redirige al login
// ─────────────────────────────────────────────────────────────

// Flag para requests que NO deben triggear el refresh (son ellos mismos de auth)
const NO_REFRESH_URLS = ['/auth/login', '/auth/register', '/auth/refresh'];

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<ErrorResponse>) => {
    const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };
    const status = error.response?.status;
    const data = error.response?.data;

    // ── Intentar refresh silencioso en 401 ──────────────────
    const requestUrl = originalRequest.url ?? '';
    const shouldRefresh =
      status === 401 &&
      !originalRequest._retry &&
      !NO_REFRESH_URLS.some((url) => requestUrl.includes(url)) &&
      tokenStore.getRefresh() !== null;

    if (shouldRefresh) {
      if (_isRefreshing) {
        // Ya hay un refresh en vuelo: meter este request en cola
        return new Promise((resolve, reject) => {
          _refreshQueue.push({
            resolve: (token) => {
              originalRequest._retry = true;
              if (originalRequest.headers) {
                originalRequest.headers.Authorization = `Bearer ${token}`;
              }
              resolve(apiClient(originalRequest));
            },
            reject,
          });
        });
      }

      originalRequest._retry = true;
      _isRefreshing = true;

      try {
        const newToken = await silentRefresh();
        processQueue(null, newToken);
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
        }
        return apiClient(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        tokenStore.clearAll();
        // Redirigir al login sin usar React Router (estamos fuera de componentes)
        window.location.href = '/login';
        return Promise.reject(refreshError);
      } finally {
        _isRefreshing = false;
      }
    }

    // ── Convertir error del backend a ApiError tipado ───────
    if (data && typeof data === 'object' && 'message' in data) {
      throw new ApiError(
        data.status ?? status ?? 0,
        data.error ?? 'UNKNOWN_ERROR',
        data.field,
        data.retryAfterSeconds,
        data.attemptsRemaining,
        data.message,
      );
    }

    // Error de red o timeout (sin respuesta del backend)
    throw new ApiError(
      0,
      'NETWORK_ERROR',
      null,
      null,
      null,
      'No se pudo conectar con el servidor. Verifica tu conexión.',
    );
  },
);
