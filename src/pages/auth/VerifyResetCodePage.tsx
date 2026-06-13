import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import { Loader2, CheckSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FormField } from '@/components/common/FormField';
import { useForgotPasswordStep2 } from '@/hooks/auth/useForgotPassword';
import { useForgotPassword } from '@/contexts/ForgotPasswordContext';

const schema = z.object({
  code: z
    .string()
    .length(6, 'El código debe ser de 6 dígitos')
    .regex(/^\d{6}$/, 'El código solo debe contener números'),
});

type FormValues = z.infer<typeof schema>;

export default function VerifyResetCodePage() {
  const navigate = useNavigate();
  const { email } = useForgotPassword();

  // Si no hay email en context (recarga de página), regresar al paso 1
  useEffect(() => {
    if (!email) navigate('/forgot-password', { replace: true });
  }, [email, navigate]);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const mutation = useForgotPasswordStep2(setError);

  const onSubmit = ({ code }: FormValues) => {
    mutation.mutate(code);
  };

  if (!email) return null;

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
            Revisa<br />
            <span className="text-indigo-400">tu correo.</span>
          </p>
          <p className="text-slate-400 text-lg">
            Te enviamos un código de 6 dígitos a{' '}
            <span className="text-white font-medium">{email}</span>.
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
              Paso 2 de 3
            </p>
            <h1 className="text-2xl font-bold tracking-tight">Ingresa el código</h1>
            <p className="text-sm text-muted-foreground">
              Enviamos un código a{' '}
              <span className="font-medium text-foreground">{email}</span>.
              Expira en 10 minutos.
            </p>
          </div>

          {errors.root && (
            <div className="rounded-md bg-destructive/10 border border-destructive/20 px-4 py-3">
              <p className="text-sm text-destructive">{errors.root.message}</p>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
            <FormField id="code" label="Código de 6 dígitos" error={errors.code?.message}>
              <Input
                id="code"
                placeholder="482931"
                maxLength={6}
                autoComplete="one-time-code"
                inputMode="numeric"
                autoFocus
                className="text-center text-lg tracking-widest font-mono"
                {...register('code')}
              />
            </FormField>

            <Button
              type="submit"
              className="w-full bg-indigo-600 hover:bg-indigo-700"
              disabled={isSubmitting || mutation.isPending}
            >
              {(isSubmitting || mutation.isPending) && <Loader2 className="animate-spin" />}
              Verificar código
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground">
            ¿No recibiste el código?{' '}
            <button
              type="button"
              onClick={() => navigate('/forgot-password')}
              className="font-medium text-indigo-600 hover:text-indigo-700 underline-offset-4 hover:underline"
            >
              Solicitar otro
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
