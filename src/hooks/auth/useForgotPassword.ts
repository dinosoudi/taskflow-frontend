import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { authApi } from '@/api/auth.api';
import { useAuthStore } from '@/store/auth.store';
import { useForgotPassword } from '@/contexts/ForgotPasswordContext';
import { isApiError } from '@/lib/utils';
import type { UseFormSetError } from 'react-hook-form';

// ─────────────────────────────────────────────────────────────
// Paso 1 — /auth/forgot-password
// Guarda el email en context y navega al paso 2
// ─────────────────────────────────────────────────────────────

interface Step1FormValues { email: string }

export function useForgotPasswordStep1(setError: UseFormSetError<Step1FormValues>) {
  const navigate = useNavigate();
  const { setEmail } = useForgotPassword();

  return useMutation({
    mutationFn: (email: string) => authApi.forgotPassword({ email }),
    onSuccess: (_data, email) => {
      setEmail(email);
      navigate('/forgot-password/verify');
    },
    onError: (error) => {
      if (isApiError(error)) {
        if (error.status === 429) {
          setError('root', { type: 'server', message: error.message });
        } else if (error.field) {
          setError(error.field as keyof Step1FormValues, {
            type: 'server',
            message: error.message,
          });
        } else {
          setError('root', { type: 'server', message: error.message });
        }
      }
    },
  });
}

// ─────────────────────────────────────────────────────────────
// Paso 2 — /auth/verify-reset-code
// Guarda el resetToken en context y navega al paso 3
// ─────────────────────────────────────────────────────────────

interface Step2FormValues { code: string }

export function useForgotPasswordStep2(setError: UseFormSetError<Step2FormValues>) {
  const navigate = useNavigate();
  const { email, setResetToken } = useForgotPassword();

  return useMutation({
    mutationFn: (code: string) => authApi.verifyResetCode({ email, code }),
    onSuccess: (data) => {
      setResetToken(data.resetToken);
      navigate('/forgot-password/reset');
    },
    onError: (error) => {
      if (isApiError(error)) {
        // El 401 incluye attemptsRemaining — lo incorporamos al mensaje
        if (error.status === 401) {
          const extra = error.attemptsRemaining != null
            ? ` Te quedan ${error.attemptsRemaining} intentos.`
            : '';
          setError('code', {
            type: 'server',
            message: error.message + extra,
          });
        } else if (error.status === 429) {
          setError('root', { type: 'server', message: error.message });
        } else {
          setError('root', { type: 'server', message: error.message });
        }
      }
    },
  });
}

// ─────────────────────────────────────────────────────────────
// Paso 3 — /auth/reset-password
// Recibe tokens — login automático y navega al dashboard
// ─────────────────────────────────────────────────────────────

interface Step3FormValues {
  newPassword: string;
  confirmPassword: string;
}

export function useForgotPasswordStep3(setError: UseFormSetError<Step3FormValues>) {
  const navigate = useNavigate();
  const { resetToken, reset: resetFlow } = useForgotPassword();
  const setSession = useAuthStore((s) => s.setSession);

  return useMutation({
    mutationFn: (data: Step3FormValues) =>
      authApi.resetPassword({ resetToken, ...data }),
    onSuccess: (data) => {
      if (data.tokens) {
        setSession(data.user, data.tokens);
        resetFlow(); // limpiar el context
        navigate('/dashboard');
      }
    },
    onError: (error) => {
      if (isApiError(error)) {
        if (error.field) {
          setError(error.field as keyof Step3FormValues, {
            type: 'server',
            message: error.message,
          });
        } else if (error.status === 401) {
          // resetToken expirado — volver al inicio del flujo
          setError('root', {
            type: 'server',
            message: error.message,
          });
        } else {
          setError('root', { type: 'server', message: error.message });
        }
      }
    },
  });
}
