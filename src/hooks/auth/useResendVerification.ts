import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { authApi } from '@/api/auth.api';
import { isApiError } from '@/lib/utils';

export function useResendVerification() {
  const [countdown, setCountdown] = useState(0);
  const [successMessage, setSuccessMessage] = useState('');

  const startCountdown = (seconds: number) => {
    setCountdown(seconds);
    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const mutation = useMutation({
    mutationFn: (email: string) => authApi.resendVerification({ email }),
    onSuccess: (data) => {
      setSuccessMessage(data.message);
      // Bloquear reenvío por 60 segundos después de un envío exitoso
      startCountdown(60);
    },
    onError: (error) => {
      if (isApiError(error) && error.status === 429 && error.retryAfterSeconds) {
        startCountdown(error.retryAfterSeconds);
      }
    },
  });

  return { mutation, countdown, successMessage };
}
