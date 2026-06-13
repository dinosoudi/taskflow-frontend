import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link } from 'react-router-dom';
import { Loader2, CheckSquare, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FormField } from '@/components/common/FormField';
import { useForgotPasswordStep1 } from '@/hooks/auth/useForgotPassword';

const schema = z.object({
  email: z.string().email('Ingresa un correo electrónico válido'),
});

type FormValues = z.infer<typeof schema>;

export default function ForgotPasswordPage() {
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const mutation = useForgotPasswordStep1(setError);

  const onSubmit = ({ email }: FormValues) => {
    mutation.mutate(email);
  };

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
            ¿Olvidaste<br />
            <span className="text-indigo-400">tu contraseña?</span>
          </p>
          <p className="text-slate-400 text-lg">
            Te enviamos un código para recuperarla en minutos.
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
            {/* Indicador de paso */}
            <p className="text-xs font-medium text-indigo-600 uppercase tracking-wider">
              Paso 1 de 3
            </p>
            <h1 className="text-2xl font-bold tracking-tight">Recuperar contraseña</h1>
            <p className="text-sm text-muted-foreground">
              Ingresa tu correo y te enviamos un código de 6 dígitos.
            </p>
          </div>

          {errors.root && (
            <div className="rounded-md bg-destructive/10 border border-destructive/20 px-4 py-3">
              <p className="text-sm text-destructive">{errors.root.message}</p>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
            <FormField id="email" label="Correo electrónico" error={errors.email?.message}>
              <Input
                id="email"
                type="email"
                placeholder="ana@email.com"
                autoComplete="email"
                autoFocus
                {...register('email')}
              />
            </FormField>

            <Button
              type="submit"
              className="w-full bg-indigo-600 hover:bg-indigo-700"
              disabled={isSubmitting || mutation.isPending}
            >
              {(isSubmitting || mutation.isPending) && <Loader2 className="animate-spin" />}
              Enviar código
            </Button>
          </form>

          <Link
            to="/login"
            className="flex items-center justify-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver al inicio de sesión
          </Link>
        </div>
      </div>
    </div>
  );
}
