import { useEffect, useState } from 'react';
import { AppRouter } from './router';
import { tokenStore } from './api/client';
import { authApi } from './api/auth.api';
import { useAuthStore } from './store/auth.store';

// ─────────────────────────────────────────────────────────────
// App
//
// Al montar, revisa si hay un refreshToken en localStorage.
// Si lo hay, intenta obtener un nuevo accessToken silenciosamente
// para restaurar la sesión sin que el usuario tenga que loguearse.
//
// Mientras resuelve muestra un loading mínimo para evitar un
// flash de la pantalla de login cuando el usuario sí tiene sesión.
// ─────────────────────────────────────────────────────────────

export default function App() {
  const [isRestoringSession, setIsRestoringSession] = useState(true);
  const setSession = useAuthStore((s) => s.setSession);

  useEffect(() => {
    const restoreSession = async () => {
      const refreshToken = tokenStore.getRefresh();

      if (!refreshToken) {
        setIsRestoringSession(false);
        return;
      }

      try {
        // Obtiene un nuevo accessToken usando el refreshToken guardado
        const tokens = await authApi.refresh({ refreshToken });
        tokenStore.setAccess(tokens.accessToken);
        tokenStore.setRefresh(tokens.refreshToken);

        // Necesitamos el user para el store — lo obtenemos del perfil
        // El interceptor ya inyectará el nuevo accessToken automáticamente
        const { usersApi } = await import('./api/users.api');
        const profile = await usersApi.getProfile();

        setSession(
          {
            id: profile.id,
            name: profile.name,
            email: profile.email,
            phone: profile.phone,
            emailVerified: profile.emailVerified,
            authProvider: profile.authProvider,
            createdAt: profile.createdAt,
          },
          {
            accessToken: tokens.accessToken,
            refreshToken: tokens.refreshToken,
            accessTokenExpiresIn: tokens.accessTokenExpiresIn,
            refreshTokenExpiresIn: tokens.refreshTokenExpiresIn,
          },
        );
      } catch {
        // refreshToken expirado o inválido — limpiar y dejar al usuario en login
        tokenStore.clearAll();
      } finally {
        setIsRestoringSession(false);
      }
    };

    restoreSession();
  }, [setSession]);

  if (isRestoringSession) {
    // Loading mínimo — evita flash de login cuando hay sesión activa
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return <AppRouter />;
}
