import { useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { CheckSquare, Loader2, XCircle, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useVerifyEmail } from '@/hooks/auth/useVerifyEmail';
import { isApiError } from '@/lib/utils';

export default function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');

  const mutation = useVerifyEmail();

  // Verificar automáticamente al montar si hay token en la URL
  useEffect(() => {
    if (token && mutation.isIdle) {
      mutation.mutate(token);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  // Sin token en la URL
  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center p-8">
        <div className="w-full max-w-sm space-y-4 text-center">
          <XCircle className="h-12 w-12 text-destructive mx-auto" />
          <h1 className="text-xl font-bold">Enlace inválido</h1>
          <p className="text-sm text-muted-foreground">
            Este enlace de verificación no es válido. Solicita uno nuevo.
          </p>
          <Button onClick={() => navigate('/login')} className="w-full bg-indigo-600 hover:bg-indigo-700">
            Ir al inicio de sesión
          </Button>
        </div>
      </div>
    );
  }

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
            Verificando<br />
            <span className="text-indigo-400">tu cuenta.</span>
          </p>
        </div>
        <p className="text-slate-600 text-sm">© {new Date().getFullYear()} TaskFlow</p>
      </div>

      {/* ── Panel derecho — estados ───────────────────────────────────────── */}
      <div className="flex items-center justify-center p-8">
        <div className="w-full max-w-sm space-y-6 text-center">

          {/* Cargando */}
          {(mutation.isPending || mutation.isIdle) && (
            <>
              <Loader2 className="h-12 w-12 animate-spin text-indigo-600 mx-auto" />
              <div className="space-y-1">
                <h1 className="text-xl font-bold">Verificando tu correo…</h1>
                <p className="text-sm text-muted-foreground">Solo un momento.</p>
              </div>
            </>
          )}

          {/* Éxito — el onSuccess navega al dashboard automáticamente */}
          {mutation.isSuccess && (
            <>
              <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto" />
              <div className="space-y-1">
                <h1 className="text-xl font-bold">¡Correo verificado!</h1>
                <p className="text-sm text-muted-foreground">Redirigiendo al dashboard…</p>
              </div>
            </>
          )}

          {/* Error */}
          {mutation.isError && (
            <>
              <XCircle className="h-12 w-12 text-destructive mx-auto" />
              <div className="space-y-1">
                <h1 className="text-xl font-bold">
                  {isApiError(mutation.error) && mutation.error.status === 401
                    ? 'Enlace expirado'
                    : 'Enlace inválido'}
                </h1>
                <p className="text-sm text-muted-foreground">
                  {isApiError(mutation.error)
                    ? mutation.error.message
                    : 'Ocurrió un error al verificar tu correo.'}
                </p>
              </div>
              <div className="space-y-2">
                <Button
                  onClick={() => navigate('/verify-email-sent', { state: { unverified: true } })}
                  className="w-full bg-indigo-600 hover:bg-indigo-700"
                >
                  Solicitar nuevo enlace
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => navigate('/login')}
                  className="w-full text-muted-foreground"
                >
                  Ir al inicio de sesión
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
