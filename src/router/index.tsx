import { BrowserRouter, Navigate, Outlet, Route, Routes } from 'react-router-dom';
import { useAuthStore } from '../store/auth.store';
import { ForgotPasswordProvider } from '../contexts/ForgotPasswordContext';

// ── Placeholders — se reemplazarán con las páginas reales ──────────────────
const LoginPage = () => <div>LoginPage (pendiente)</div>;
const RegisterPage = () => <div>RegisterPage (pendiente)</div>;
const VerifyEmailSentPage = () => <div>VerifyEmailSentPage (pendiente)</div>;
const VerifyEmailPage = () => <div>VerifyEmailPage (pendiente)</div>;
const ForgotPasswordPage = () => <div>ForgotPassword paso 1 (pendiente)</div>;
const VerifyResetCodePage = () => <div>ForgotPassword paso 2 (pendiente)</div>;
const ResetPasswordPage = () => <div>ForgotPassword paso 3 (pendiente)</div>;
const DashboardPage = () => <div>DashboardPage (pendiente)</div>;
const NotesPage = () => <div>NotesPage (pendiente)</div>;
const TagsPage = () => <div>TagsPage (pendiente)</div>;
const SettingsPage = () => <div>SettingsPage (pendiente)</div>;
const NotFoundPage = () => <div>404 — Página no encontrada</div>;

// ─────────────────────────────────────────────────────────────
// ProtectedRoute — redirige al login si no hay sesión
// ─────────────────────────────────────────────────────────────

function ProtectedRoute() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <Outlet />;
}

// ─────────────────────────────────────────────────────────────
// PublicRoute — redirige al dashboard si ya hay sesión
// Evita que un usuario logueado vea el login/register
// ─────────────────────────────────────────────────────────────

function PublicRoute() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  if (isAuthenticated) return <Navigate to="/dashboard" replace />;
  return <Outlet />;
}

// ─────────────────────────────────────────────────────────────
// ForgotPasswordLayout — envuelve los 3 pasos con el context
// que comparte email y resetToken entre ellos
// ─────────────────────────────────────────────────────────────

function ForgotPasswordLayout() {
  return (
    <ForgotPasswordProvider>
      <Outlet />
    </ForgotPasswordProvider>
  );
}

// ─────────────────────────────────────────────────────────────
// AppRouter
// ─────────────────────────────────────────────────────────────

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Rutas públicas — redirigen al dashboard si ya hay sesión */}
        <Route element={<PublicRoute />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/verify-email-sent" element={<VerifyEmailSentPage />} />
          <Route path="/verify-email" element={<VerifyEmailPage />} />

          {/* Forgot password — 3 pasos con context compartido */}
          <Route element={<ForgotPasswordLayout />}>
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/forgot-password/verify" element={<VerifyResetCodePage />} />
            <Route path="/forgot-password/reset" element={<ResetPasswordPage />} />
          </Route>
        </Route>

        {/* Rutas protegidas — redirigen al login si no hay sesión */}
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/notes" element={<NotesPage />} />
          <Route path="/tags" element={<TagsPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Route>

        {/* Raíz — redirige según estado de sesión */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />

        {/* 404 */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}
