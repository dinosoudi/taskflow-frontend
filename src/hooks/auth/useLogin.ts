import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { authApi } from '@/api/auth.api';
import { useAuthStore } from '@/store/auth.store';
import { isApiError } from '@/lib/utils';
import type { LoginRequest } from '@/types';
import type { UseFormSetError } from 'react-hook-form';

interface LoginFormValues {
  identifier: string;
  password: string;
}

export function useLogin(setError: UseFormSetError<LoginFormValues>) {
  const navigate = useNavigate();
  const setSession = useAuthStore((s) => s.setSession);

  return useMutation({
    mutationFn: (data: LoginRequest) => authApi.login(data),
    onSuccess: (data) => {
      // tokens siempre presente en login exitoso (a diferencia de register)
      if (data.tokens) {
        setSession(data.user, data.tokens);
        navigate('/dashboard');
      }
    },
    onError: (error) => {
      if (isApiError(error)) {
        switch (error.status) {
          case 401:
            // Incluye: credenciales incorrectas Y cuenta de Google
            // El backend ya devuelve el mensaje correcto para cada caso
            setError('root', { type: 'server', message: error.message });
            break;

          case 403:
            // Email no verificado — navegamos a verify-email-sent con el identifier
            // para que pueda reenviar el correo de verificación
            navigate('/verify-email-sent', {
              state: { email: error.message, unverified: true },
            });
            break;

          case 429:
            // Cuenta bloqueada — el mensaje ya incluye el tiempo (15 minutos)
            setError('root', { type: 'server', message: error.message });
            break;

          default:
            if (error.field) {
              setError(error.field as keyof LoginFormValues, {
                type: 'server',
                message: error.message,
              });
            } else {
              setError('root', { type: 'server', message: error.message });
            }
        }
      } else {
        setError('root', {
          type: 'server',
          message: 'No se pudo conectar con el servidor. Intenta de nuevo.',
        });
      }
    },
  });
}
