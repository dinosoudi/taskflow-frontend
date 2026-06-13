import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link } from 'react-router-dom';
import { Loader2, CheckSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PasswordInput } from '@/components/common/PasswordInput';
import { FormField } from '@/components/common/FormField';
import { useRegister } from '@/hooks/auth/useRegister';
import { PASSWORD_REGEX, PASSWORD_HINT } from '@/lib/utils';

// ─── Esquema Zod — refleja las reglas del contrato ────────────────────────────

const schema = z
  .object({
    name: z
      .string()
      .min(2, 'El nombre debe tener al menos 2 caracteres')
      .max(100, 'El nombre es demasiado largo'),
    email: z.string().email('Ingresa un correo electrónico válido'),
    password: z
      .string()
      .regex(PASSWORD_REGEX, PASSWORD_HINT),
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: 'Las contraseñas no coinciden',
    path: ['confirmPassword'],
  });

type FormValues = z.infer<typeof schema>;

// ─── Página ────────────────────────────────────────────────────────────────────

export default function RegisterPage() {
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const mutation = useRegister(setError);

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
            Organiza lo que importa,<br />
            <span className="text-indigo-400">olvida lo que no.</span>
          </p>
          <p className="text-slate-400 text-lg">
            Notas y tareas en un solo lugar, sin ruido.
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
            {/* Logo visible solo en mobile */}
            <div className="flex items-center gap-2 mb-6 lg:hidden">
              <CheckSquare className="h-5 w-5 text-indigo-600" />
              <span className="font-semibold tracking-tight">TaskFlow</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight">Crear cuenta</h1>
            <p className="text-sm text-muted-foreground">
              Empieza gratis, sin tarjeta de crédito.
            </p>
          </div>

          {/* Error global del servidor */}
          {errors.root && (
            <div className="rounded-md bg-destructive/10 border border-destructive/20 px-4 py-3">
              <p className="text-sm text-destructive">{errors.root.message}</p>
            </div>
          )}

          {/* Formulario */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
            <FormField id="name" label="Nombre completo" error={errors.name?.message}>
              <Input
                id="name"
                placeholder="Ana García"
                autoComplete="name"
                autoFocus
                {...register('name')}
              />
            </FormField>

            <FormField id="email" label="Correo electrónico" error={errors.email?.message}>
              <Input
                id="email"
                type="email"
                placeholder="ana@email.com"
                autoComplete="email"
                {...register('email')}
              />
            </FormField>

            <FormField
              id="password"
              label="Contraseña"
              error={errors.password?.message}
              hint={PASSWORD_HINT}
            >
              <PasswordInput
                id="password"
                placeholder="••••••••"
                autoComplete="new-password"
                {...register('password')}
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
              {(isSubmitting || mutation.isPending) && (
                <Loader2 className="animate-spin" />
              )}
              Crear cuenta
            </Button>
          </form>

          {/* Footer */}
          <p className="text-center text-sm text-muted-foreground">
            ¿Ya tienes cuenta?{' '}
            <Link
              to="/login"
              className="font-medium text-indigo-600 hover:text-indigo-700 underline-offset-4 hover:underline"
            >
              Inicia sesión
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
