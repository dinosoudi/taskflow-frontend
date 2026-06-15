import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import axios from 'axios';
import { tokenStore } from './api/client';
import { useAuthStore } from './store/auth.store';
import App from './App';
import './index.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 5 * 60 * 1000,
    },
    mutations: {
      retry: 0,
    },
  },
});

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080/api/v1';

// ─────────────────────────────────────────────────────────────
// Restore de sesión — corre UNA sola vez antes de montar React
// Fuera del árbol de componentes = sin StrictMode double-invoke
// ─────────────────────────────────────────────────────────────
async function restoreSessionAndRender() {
  const refreshToken = tokenStore.getRefresh();

  if (refreshToken) {
    try {
      const refreshRes = await axios.post(
        `${BASE_URL}/auth/refresh`,
        { refreshToken },
        { headers: { 'Content-Type': 'application/json' } },
      );

      const tokens = refreshRes.data;
      tokenStore.setAccess(tokens.accessToken);
      tokenStore.setRefresh(tokens.refreshToken);

      const profileRes = await axios.get(`${BASE_URL}/users/me`, {
        headers: { Authorization: `Bearer ${tokens.accessToken}` },
      });

      const profile = profileRes.data;

      // Setear directamente en el store sin hooks
      useAuthStore.setState({
        user: {
          id: profile.id,
          name: profile.name,
          email: profile.email,
          phone: profile.phone,
          emailVerified: profile.emailVerified,
          authProvider: profile.authProvider,
          createdAt: profile.createdAt,
        },
        isAuthenticated: true,
      });
    } catch {
      // Token expirado o inválido — limpiar y dejar al usuario en login
      tokenStore.clearAll();
    }
  }

  // Montar React DESPUÉS de resolver la sesión
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <QueryClientProvider client={queryClient}>
        <App />
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </StrictMode>,
  );
}

restoreSessionAndRender();
