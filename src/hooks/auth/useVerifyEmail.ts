import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { authApi } from '@/api/auth.api';
import { useAuthStore } from '@/store/auth.store';
import { isApiError } from '@/lib/utils';

export function useVerifyEmail() {
  const navigate = useNavigate();
  const setSession = useAuthStore((s) => s.setSession);

  return useMutation({
    mutationFn: (token: string) => authApi.verifyEmail({ token }),
    onSuccess: (data) => {
      if (data.tokens) {
        setSession(data.user, data.tokens);
        navigate('/dashboard');
      }
    },
    onError: (error) => {
      // El error se maneja en el componente — puede ser token inválido o expirado
      if (!isApiError(error)) {
        console.error('Error inesperado al verificar email:', error);
      }
    },
  });
}
