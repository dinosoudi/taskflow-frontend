import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, CheckCircle2 } from 'lucide-react';
import { AppSidebar } from '@/components/common/AppSidebar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PasswordInput } from '@/components/common/PasswordInput';
import { FormField } from '@/components/common/FormField';
import { Switch } from '@/components/ui/switch';
import { useProfile } from '@/hooks/users/useProfile';
import {
  useUpdateName,
  useUpdatePhone,
  useChangePassword,
  useUpdatePreferences,
  useDeleteAccount,
} from '@/hooks/users/useUserMutations';
import { isApiError, PASSWORD_REGEX, PASSWORD_HINT } from '@/lib/utils';

// ─── Schemas ──────────────────────────────────────────────────────────────────

const nameSchema = z.object({
  name: z.string().min(2, 'Mínimo 2 caracteres').max(100, 'Máximo 100 caracteres'),
});

const phoneSchema = z.object({
  phone: z.string().nullable(),
});

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Ingresa tu contraseña actual'),
    newPassword: z.string().regex(PASSWORD_REGEX, PASSWORD_HINT),
    confirmPassword: z.string(),
    closeOtherSessions: z.boolean(),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: 'Las contraseñas no coinciden',
    path: ['confirmPassword'],
  });

const deleteSchema = z.object({
  password: z.string().min(1, 'Ingresa tu contraseña'),
  confirmation: z.literal('ELIMINAR', {
    errorMap: () => ({ message: 'Escribe exactamente ELIMINAR para confirmar' }),
  }),
});

// ─── Componente de sección ────────────────────────────────────────────────────

function Section({ title, description, children }: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-lg border border-border p-6 space-y-4">
      <div className="space-y-0.5">
        <h2 className="text-base font-semibold">{title}</h2>
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
      </div>
      {children}
    </div>
  );
}

// ─── Mensaje de éxito inline ──────────────────────────────────────────────────

function SuccessMessage({ message }: { message: string }) {
  return (
    <div className="flex items-center gap-2 rounded-md bg-green-50 border border-green-200 px-3 py-2">
      <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0" />
      <p className="text-sm text-green-700">{message}</p>
    </div>
  );
}

// ─── Página ────────────────────────────────────────────────────────────────────

export default function SettingsPage() {
  const { data: profile, isLoading } = useProfile();
  const [passwordSuccess, setPasswordSuccess] = useState('');

  // ── Nombre ─────────────────────────────────────────────────
  const updateName = useUpdateName();
  const nameForm = useForm<z.infer<typeof nameSchema>>({
    resolver: zodResolver(nameSchema),
    values: { name: profile?.name ?? '' },
  });

  const onSubmitName = (data: z.infer<typeof nameSchema>) => {
    updateName.mutate(data, {
      onError: (error) => {
        if (isApiError(error) && error.field) {
          nameForm.setError(error.field as 'name', { message: error.message });
        } else {
          nameForm.setError('root', { message: isApiError(error) ? error.message : 'Error inesperado' });
        }
      },
    });
  };

  // ── Teléfono ───────────────────────────────────────────────
  const updatePhone = useUpdatePhone();
  const phoneForm = useForm<z.infer<typeof phoneSchema>>({
    resolver: zodResolver(phoneSchema),
    values: { phone: profile?.phone ?? '' },
  });

  const onSubmitPhone = (data: z.infer<typeof phoneSchema>) => {
    updatePhone.mutate(
      { phone: data.phone || null },
      {
        onError: (error) => {
          phoneForm.setError('root', { message: isApiError(error) ? error.message : 'Error inesperado' });
        },
      },
    );
  };

  // ── Contraseña ─────────────────────────────────────────────
  const changePassword = useChangePassword();
  const passwordForm = useForm<z.infer<typeof passwordSchema>>({
    resolver: zodResolver(passwordSchema),
    defaultValues: { closeOtherSessions: false },
  });

  const onSubmitPassword = (data: z.infer<typeof passwordSchema>) => {
    setPasswordSuccess('');
    changePassword.mutate(data, {
      onSuccess: (res) => {
        setPasswordSuccess(res.message ?? 'Contraseña actualizada correctamente');
        passwordForm.reset({ closeOtherSessions: false });
      },
      onError: (error) => {
        if (isApiError(error) && error.field) {
          passwordForm.setError(error.field as keyof z.infer<typeof passwordSchema>, {
            message: error.message,
          });
        } else {
          passwordForm.setError('root', { message: isApiError(error) ? error.message : 'Error inesperado' });
        }
      },
    });
  };

  // ── Preferencias ───────────────────────────────────────────
  const updatePreferences = useUpdatePreferences();

  const handleDarkModeToggle = (checked: boolean) => {
    updatePreferences.mutate({
      darkMode: checked,
      language: profile?.preferences.language ?? 'es',
    });
  };

  const handleLanguageChange = (language: 'es' | 'en') => {
    updatePreferences.mutate({
      darkMode: profile?.preferences.darkMode ?? false,
      language,
    });
  };

  // ── Eliminar cuenta ────────────────────────────────────────
  const deleteAccount = useDeleteAccount();
  const deleteForm = useForm<z.infer<typeof deleteSchema>>({
    resolver: zodResolver(deleteSchema),
  });

  const onSubmitDelete = (data: z.infer<typeof deleteSchema>) => {
    deleteAccount.mutate(data, {
      onError: (error) => {
        if (isApiError(error) && error.field) {
          deleteForm.setError(error.field as keyof z.infer<typeof deleteSchema>, {
            message: error.message,
          });
        } else {
          deleteForm.setError('root', { message: isApiError(error) ? error.message : 'Error inesperado' });
        }
      },
    });
  };

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <AppSidebar />

      <main className="flex-1 overflow-y-auto">
        <div className="max-w-2xl mx-auto px-6 py-8 space-y-6">

          <div className="space-y-0.5">
            <h1 className="text-2xl font-bold tracking-tight">Configuración</h1>
            <p className="text-sm text-muted-foreground">
              Administra tu perfil y preferencias.
            </p>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div className="space-y-4">

              {/* ── Nombre ─────────────────────────────────── */}
              <Section title="Nombre" description="Cómo apareces en la app.">
                <form onSubmit={nameForm.handleSubmit(onSubmitName)} className="space-y-3" noValidate>
                  {nameForm.formState.errors.root && (
                    <p className="text-sm text-destructive">{nameForm.formState.errors.root.message}</p>
                  )}
                  {updateName.isSuccess && (
                    <SuccessMessage message="Nombre actualizado correctamente" />
                  )}
                  <div className="flex gap-3">
                    <div className="flex-1">
                      <FormField id="name" label="Nombre completo" error={nameForm.formState.errors.name?.message}>
                        <Input id="name" {...nameForm.register('name')} />
                      </FormField>
                    </div>
                    <div className="pt-6">
                      <Button
                        type="submit"
                        size="sm"
                        disabled={updateName.isPending || !nameForm.formState.isDirty}
                        className="bg-indigo-600 hover:bg-indigo-700"
                      >
                        {updateName.isPending && <Loader2 className="animate-spin" />}
                        Guardar
                      </Button>
                    </div>
                  </div>
                </form>
              </Section>

              {/* ── Email (solo lectura) ────────────────────── */}
              <Section title="Correo electrónico" description="El correo no se puede cambiar en v1.">
                <Input value={profile?.email ?? ''} disabled className="bg-muted/50" />
              </Section>

              {/* ── Teléfono ────────────────────────────────── */}
              <Section title="Teléfono" description="Opcional. En v2 se usará para autenticación. El formato es lada+telefono todo junto, sin espacios">
                <form onSubmit={phoneForm.handleSubmit(onSubmitPhone)} className="space-y-3" noValidate>
                  {phoneForm.formState.errors.root && (
                    <p className="text-sm text-destructive">{phoneForm.formState.errors.root.message}</p>
                  )}
                  {updatePhone.isSuccess && (
                    <SuccessMessage message="Teléfono actualizado correctamente" />
                  )}
                  <div className="flex gap-3">
                    <div className="flex-1">
                      <FormField id="phone" label="Número de teléfono" error={phoneForm.formState.errors.phone?.message}>
                        <Input
                          id="phone"
                          type="tel"
                          placeholder="+525512345678"
                          {...phoneForm.register('phone')}
                        />
                      </FormField>
                    </div>
                    <div className="pt-6">
                      <Button
                        type="submit"
                        size="sm"
                        disabled={updatePhone.isPending || !phoneForm.formState.isDirty}
                        className="bg-indigo-600 hover:bg-indigo-700"
                      >
                        {updatePhone.isPending && <Loader2 className="animate-spin" />}
                        Guardar
                      </Button>
                    </div>
                  </div>
                </form>
              </Section>

              {/* ── Contraseña ──────────────────────────────── */}
              <Section title="Contraseña" description="Usa una contraseña segura que no uses en otros sitios.">
                <form onSubmit={passwordForm.handleSubmit(onSubmitPassword)} className="space-y-3" noValidate>
                  {passwordForm.formState.errors.root && (
                    <div className="rounded-md bg-destructive/10 border border-destructive/20 px-3 py-2">
                      <p className="text-sm text-destructive">{passwordForm.formState.errors.root.message}</p>
                    </div>
                  )}
                  {passwordSuccess && <SuccessMessage message={passwordSuccess} />}

                  <FormField
                    id="currentPassword"
                    label="Contraseña actual"
                    error={passwordForm.formState.errors.currentPassword?.message}
                  >
                    <PasswordInput id="currentPassword" {...passwordForm.register('currentPassword')} />
                  </FormField>

                  <FormField
                    id="newPassword"
                    label="Nueva contraseña"
                    error={passwordForm.formState.errors.newPassword?.message}
                    hint={PASSWORD_HINT}
                  >
                    <PasswordInput id="newPassword" {...passwordForm.register('newPassword')} />
                  </FormField>

                  <FormField
                    id="confirmPassword"
                    label="Confirmar nueva contraseña"
                    error={passwordForm.formState.errors.confirmPassword?.message}
                  >
                    <PasswordInput id="confirmPassword" {...passwordForm.register('confirmPassword')} />
                  </FormField>

                  {/* Toggle cerrar otras sesiones */}
                  <div className="flex items-center justify-between rounded-md border border-border px-3 py-2.5">
                    <div className="space-y-0.5">
                      <p className="text-sm font-medium">Cerrar otras sesiones</p>
                      <p className="text-xs text-muted-foreground">
                        Cierra sesión en todos los demás dispositivos al cambiar la contraseña.
                      </p>
                    </div>
                    <Switch
                      checked={passwordForm.watch('closeOtherSessions')}
                      onCheckedChange={(v) => passwordForm.setValue('closeOtherSessions', v)}
                    />
                  </div>

                  <Button
                    type="submit"
                    size="sm"
                    disabled={changePassword.isPending}
                    className="bg-indigo-600 hover:bg-indigo-700"
                  >
                    {changePassword.isPending && <Loader2 className="animate-spin" />}
                    Cambiar contraseña
                  </Button>
                </form>
              </Section>

              {/* ── Preferencias ────────────────────────────── */}
              <Section title="Preferencias" description="Se sincronizan entre dispositivos en v2.">
                <div className="space-y-3">
                  {/* Dark mode */}
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <p className="text-sm font-medium">Modo oscuro</p>
                      <p className="text-xs text-muted-foreground">Próximamente — la UI aún no aplica el tema.</p>
                    </div>
                    <Switch
                      checked={profile?.preferences.darkMode ?? false}
                      onCheckedChange={handleDarkModeToggle}
                      disabled={updatePreferences.isPending}
                    />
                  </div>

                  {/* Idioma */}
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <p className="text-sm font-medium">Idioma</p>
                      <p className="text-xs text-muted-foreground">Idioma de la interfaz.</p>
                    </div>
                    <div className="flex rounded-md border border-border overflow-hidden">
                      {(['es', 'en'] as const).map((lang) => (
                        <button
                          key={lang}
                          type="button"
                          onClick={() => handleLanguageChange(lang)}
                          disabled={updatePreferences.isPending}
                          className={`px-3 py-1.5 text-xs font-medium transition-colors ${
                            profile?.preferences.language === lang
                              ? 'bg-indigo-600 text-white'
                              : 'text-muted-foreground hover:bg-muted'
                          }`}
                        >
                          {lang === 'es' ? 'Español' : 'English'}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </Section>

              {/* ── Eliminar cuenta ─────────────────────────── */}
              <Section
                title="Eliminar cuenta"
                description="Tu cuenta se marcará para eliminación. Tienes 30 días para cancelar antes de que todo se borre permanentemente."
              >
                <form onSubmit={deleteForm.handleSubmit(onSubmitDelete)} className="space-y-3" noValidate>
                  {deleteForm.formState.errors.root && (
                    <div className="rounded-md bg-destructive/10 border border-destructive/20 px-3 py-2">
                      <p className="text-sm text-destructive">{deleteForm.formState.errors.root.message}</p>
                    </div>
                  )}

                  <FormField
                    id="delete-password"
                    label="Contraseña actual"
                    error={deleteForm.formState.errors.password?.message}
                  >
                    <PasswordInput id="delete-password" {...deleteForm.register('password')} />
                  </FormField>

                  <FormField
                    id="confirmation"
                    label='Escribe "ELIMINAR" para confirmar'
                    error={deleteForm.formState.errors.confirmation?.message}
                  >
                    <Input
                      id="confirmation"
                      placeholder="ELIMINAR"
                      className="font-mono"
                      {...deleteForm.register('confirmation')}
                    />
                  </FormField>

                  <Button
                    type="submit"
                    variant="destructive"
                    size="sm"
                    disabled={deleteAccount.isPending}
                  >
                    {deleteAccount.isPending && <Loader2 className="animate-spin" />}
                    Eliminar mi cuenta
                  </Button>
                </form>
              </Section>

            </div>
          )}
        </div>
      </main>
    </div>
  );
}