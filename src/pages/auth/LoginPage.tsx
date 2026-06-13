import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link } from 'react-router-dom';
import { Loader2, CheckSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PasswordInput } from '@/components/common/PasswordInput';
import { FormField } from '@/components/common/FormField';
import { useLogin } from '@/hooks/auth/useLogin';

// ─── Esquema Zod ──────────────────────────────────────────────────────────────

const schema = z.object({
  identifier: z.string().email('Ingresa un correo electrónico válido'),
  password: z.string().min(1, 'La contraseña es requerida'),
});

type FormValues = z.infer<typeof schema>;

// ─── Página ────────────────────────────────────────────────────────────────────

export default function LoginPage() {
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const mutation = useLogin(setError);

  const onSubmit = (data: FormValues) => {
    mutation.mutate(data);
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* ── Panel izquierdo — identidad ───────────────────────────────────── */}
      <div className="hidden lg:flex flex-col justify-between bg-slate-950 p-12 text-white">
        <div className="flex items-center gap-2">
          <CheckSquare className="h-6 w-6 text-indigo-400" />
          <span className="text-lg font-semibold tracking-tight">TaskFlow</span>
        </div>

        <div className="space-y-4">
          <p className="text-4xl font-bold leading-tight text-white">
            Bienvenido<br />
            <span className="text-indigo-400">de vuelta.</span>
          </p>
          <p className="text-slate-400 text-lg">
            Tus notas te están esperando.
          </p>
        </div>

        <p className="text-slate-600 text-sm">
          © {new Date().getFullYear()} TaskFlow
        </p>
      </div>

      {/* ── Panel derecho — formulario ────────────────────────────────────── */}
      <div className="flex items-center justify-center p-8">
        <div className="w-full max-w-sm space-y-6">

          {/* Header */}
          <div className="space-y-1">
            <div className="flex items-center gap-2 mb-6 lg:hidden">
              <CheckSquare className="h-5 w-5 text-indigo-600" />
              <span className="font-semibold tracking-tight">TaskFlow</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight">Iniciar sesión</h1>
            <p className="text-sm text-muted-foreground">
              Ingresa tu correo y contraseña para continuar.
            </p>
          </div>

          {/* Error global del servidor — 401, 429, 500, etc. */}
          {errors.root && (
            <div className="rounded-md bg-destructive/10 border border-destructive/20 px-4 py-3">
              <p className="text-sm text-destructive">{errors.root.message}</p>
            </div>
          )}

          {/* Formulario */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
            <FormField
              id="identifier"
              label="Correo electrónico"
              error={errors.identifier?.message}
            >
              <Input
                id="identifier"
                type="email"
                placeholder="ana@email.com"
                autoComplete="email"
                autoFocus
                {...register('identifier')}
              />
            </FormField>

            <FormField id="password" label="Contraseña" error={errors.password?.message}>
              <div className="space-y-1">
                <PasswordInput
                  id="password"
                  placeholder="••••••••"
                  autoComplete="current-password"
                  {...register('password')}
                />
                <div className="flex justify-end">
                  <Link
                    to="/forgot-password"
                    className="text-xs text-muted-foreground hover:text-indigo-600 underline-offset-4 hover:underline transition-colors"
                  >
                    ¿Olvidaste tu contraseña?
                  </Link>
                </div>
              </div>
            </FormField>

            <Button
              type="submit"
              className="w-full bg-indigo-600 hover:bg-indigo-700"
              disabled={isSubmitting || mutation.isPending}
            >
              {(isSubmitting || mutation.isPending) && (
                <Loader2 className="animate-spin" />
              )}
              Iniciar sesión
            </Button>
          </form>

          {/* Footer */}
          <p className="text-center text-sm text-muted-foreground">
            ¿No tienes cuenta?{' '}
            <Link
              to="/register"
              className="font-medium text-indigo-600 hover:text-indigo-700 underline-offset-4 hover:underline"
            >
              Regístrate gratis
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
