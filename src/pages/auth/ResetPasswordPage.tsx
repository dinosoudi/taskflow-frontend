import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import { Loader2, CheckSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PasswordInput } from '@/components/common/PasswordInput';
import { FormField } from '@/components/common/FormField';
import { useForgotPasswordStep3 } from '@/hooks/auth/useForgotPassword';
import { useForgotPassword } from '@/contexts/ForgotPasswordContext';
import { PASSWORD_REGEX, PASSWORD_HINT } from '@/lib/utils';

const schema = z
  .object({
    newPassword: z.string().regex(PASSWORD_REGEX, PASSWORD_HINT),
    confirmPassword: z.string(),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: 'Las contraseñas no coinciden',
    path: ['confirmPassword'],
  });

type FormValues = z.infer<typeof schema>;

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const { resetToken } = useForgotPassword();

  // Si no hay resetToken en context (recarga de página), regresar al paso 1
  useEffect(() => {
    if (!resetToken) navigate('/forgot-password', { replace: true });
  }, [resetToken, navigate]);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const mutation = useForgotPasswordStep3(setError);

  const onSubmit = (data: FormValues) => {
    mutation.mutate(data);
  };

  if (!resetToken) return null;

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* ── Panel izquierdo ───────────────────────────────────────────────── */}
      <div className="hidden lg:flex flex-col justify-between bg-slate-950 p-12 text-white">
        <div className="flex items-center gap-2">
          <CheckSquare className="h-6 w-6 text-indigo-400" />
          <span className="text-lg font-semibold tracking-tight">TaskFlow</span>
        </div>
        <div className="space-y-4">
          <p className="text-4xl font-bold leading-tight">
            Elige una<br />
            <span className="text-indigo-400">contraseña segura.</span>
          </p>
          <p className="text-slate-400 text-lg">
            Tienes 15 minutos para completar este paso.
          </p>
        </div>
        <p className="text-slate-600 text-sm">© {new Date().getFullYear()} TaskFlow</p>
      </div>

      {/* ── Panel derecho ─────────────────────────────────────────────────── */}
      <div className="flex items-center justify-center p-8">
        <div className="w-full max-w-sm space-y-6">

          <div className="space-y-1">
            <div className="flex items-center gap-2 mb-6 lg:hidden">
              <CheckSquare className="h-5 w-5 text-indigo-600" />
              <span className="font-semibold tracking-tight">TaskFlow</span>
            </div>
            <p className="text-xs font-medium text-indigo-600 uppercase tracking-wider">
              Paso 3 de 3
            </p>
            <h1 className="text-2xl font-bold tracking-tight">Nueva contraseña</h1>
            <p className="text-sm text-muted-foreground">
              Elige una contraseña nueva. Al guardarla quedarás con sesión iniciada.
            </p>
          </div>

          {/* Error global — incluye resetToken expirado */}
          {errors.root && (
            <div className="rounded-md bg-destructive/10 border border-destructive/20 px-4 py-3">
              <p className="text-sm text-destructive">{errors.root.message}</p>
              {errors.root.message?.includes('expirado') && (
                <button
                  type="button"
                  onClick={() => navigate('/forgot-password')}
                  className="mt-1 text-xs font-medium text-indigo-600 hover:underline"
                >
                  Solicitar un código nuevo
                </button>
              )}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
            <FormField
              id="newPassword"
              label="Nueva contraseña"
              error={errors.newPassword?.message}
              hint={PASSWORD_HINT}
            >
              <PasswordInput
                id="newPassword"
                placeholder="••••••••"
                autoComplete="new-password"
                autoFocus
                {...register('newPassword')}
              />
            </FormField>

            <FormField
              id="confirmPassword"
              label="Confirmar contraseña"
              error={errors.confirmPassword?.message}
            >
              <PasswordInput
                id="confirmPassword"
                placeholder="••••••••"
                autoComplete="new-password"
                {...register('confirmPassword')}
              />
            </FormField>

            <Button
              type="submit"
              className="w-full bg-indigo-600 hover:bg-indigo-700"
              disabled={isSubmitting || mutation.isPending}
            >
              {(isSubmitting || mutation.isPending) && <Loader2 className="animate-spin" />}
              Guardar contraseña
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
