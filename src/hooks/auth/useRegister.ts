import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { authApi } from '@/api/auth.api';
import { isApiError } from '@/lib/utils';
import type { RegisterRequest } from '@/types';
import type { UseFormSetError } from 'react-hook-form';

export function useRegister(setError: UseFormSetError<RegisterRequest>) {
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (data: RegisterRequest) => authApi.register(data),
    onSuccess: (_data, variables) => {
      // El backend devuelve 201 con tokens: null
      // El usuario debe verificar su email antes de poder entrar
      // Pasamos el email por state para mostrarlo en la pantalla siguiente
      navigate('/verify-email-sent', { state: { email: variables.email } });
    },
    onError: (error) => {
      if (isApiError(error)) {
        // El backend devuelve field: "email" | "confirmPassword" | null
        // Si tiene field lo mapeamos directo al campo del formulario
        if (error.field) {
          setError(error.field as keyof RegisterRequest, {
            type: 'server',
            message: error.message,
          });
        } else {
          // Error general (500, etc.) — lo mapeamos a root para mostrarlo arriba del form
          setError('root', { type: 'server', message: error.message });
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
