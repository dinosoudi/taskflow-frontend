import { useLocation, useNavigate } from 'react-router-dom';
import { Mail, CheckSquare, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useResendVerification } from '@/hooks/auth/useResendVerification';
import { formatRetryTimer } from '@/lib/utils';

export default function VerifyEmailSentPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const email = location.state?.email as string | undefined;
  const isUnverified = location.state?.unverified as boolean | undefined;

  const { mutation, countdown, successMessage } = useResendVerification();

  // Si llegaron aquí sin email en el state (navegación directa), regresar al register
  if (!email && !isUnverified) {
    navigate('/register', { replace: true });
    return null;
  }

  const handleResend = () => {
    if (email) mutation.mutate(email);
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
            Un paso más<br />
            <span className="text-indigo-400">y ya eres parte.</span>
          </p>
          <p className="text-slate-400 text-lg">
            Verifica tu correo para activar tu cuenta.
          </p>
        </div>
        <p className="text-slate-600 text-sm">© {new Date().getFullYear()} TaskFlow</p>
      </div>

      {/* ── Panel derecho ─────────────────────────────────────────────────── */}
      <div className="flex items-center justify-center p-8">
        <div className="w-full max-w-sm space-y-6 text-center">

          {/* Ícono */}
          <div className="flex justify-center">
            <div className="rounded-full bg-indigo-50 p-4">
              <Mail className="h-10 w-10 text-indigo-600" />
            </div>
          </div>

          {/* Texto */}
          <div className="space-y-2">
            <h1 className="text-2xl font-bold tracking-tight">Revisa tu correo</h1>
            {email ? (
              <p className="text-sm text-muted-foreground">
                Enviamos un enlace de verificación a{' '}
                <span className="font-medium text-foreground">{email}</span>.
                Haz clic en él para activar tu cuenta.
              </p>
            ) : (
              <p className="text-sm text-muted-foreground">
                Necesitas verificar tu correo antes de iniciar sesión.
              </p>
            )}
          </div>

          {/* Mensaje de éxito al reenviar */}
          {successMessage && (
            <div className="rounded-md bg-green-50 border border-green-200 px-4 py-3">
              <p className="text-sm text-green-700">{successMessage}</p>
            </div>
          )}

          {/* Error del servidor */}
          {mutation.isError && !successMessage && (
            <div className="rounded-md bg-destructive/10 border border-destructive/20 px-4 py-3">
              <p className="text-sm text-destructive">
                {(mutation.error as Error).message}
              </p>
            </div>
          )}

          {/* Reenviar */}
          <div className="space-y-3">
            <Button
              onClick={handleResend}
              variant="outline"
              className="w-full"
              disabled={mutation.isPending || countdown > 0}
            >
              {mutation.isPending && <Loader2 className="animate-spin" />}
              {countdown > 0
                ? `Reenviar en ${formatRetryTimer(countdown)}`
                : 'Reenviar correo de verificación'}
            </Button>

            <Button
              variant="ghost"
              className="w-full text-muted-foreground"
              onClick={() => navigate('/login')}
            >
              Volver al inicio de sesión
            </Button>
          </div>

          <p className="text-xs text-muted-foreground">
            ¿No encuentras el correo? Revisa tu carpeta de spam.
          </p>
        </div>
      </div>
    </div>
  );
}
