import { BrowserRouter, Navigate, Outlet, Route, Routes } from 'react-router-dom';
import { useAuthStore } from '../store/auth.store';
import { ForgotPasswordProvider } from '../contexts/ForgotPasswordContext';
import LoginPage from '../pages/auth/LoginPage';
import RegisterPage from '../pages/auth/RegisterPage';
import VerifyEmailSentPage from '../pages/auth/VerifyEmailSentPage';
import VerifyEmailPage from '../pages/auth/VerifyEmailPage';
import ForgotPasswordPage from '../pages/auth/ForgotPasswordPage';
import VerifyResetCodePage from '../pages/auth/VerifyResetCodePage';
import ResetPasswordPage from '../pages/auth/ResetPasswordPage';
import NotesPage from '../pages/notes/NotesPage';

// ── Placeholders ────────────────────────────────────────────
const TagsPage = () => <div>TagsPage (pendiente)</div>;
const SettingsPage = () => <div>SettingsPage (pendiente)</div>;
const NotFoundPage = () => <div>404 — Página no encontrada</div>;

function ProtectedRoute() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <Outlet />;
}

function PublicRoute() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  if (isAuthenticated) return <Navigate to="/dashboard" replace />;
  return <Outlet />;
}

function ForgotPasswordLayout() {
  return (
    <ForgotPasswordProvider>
      <Outlet />
    </ForgotPasswordProvider>
  );
}

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<PublicRoute />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/verify-email-sent" element={<VerifyEmailSentPage />} />
          <Route path="/verify-email" element={<VerifyEmailPage />} />
          <Route element={<ForgotPasswordLayout />}>
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/forgot-password/verify" element={<VerifyResetCodePage />} />
            <Route path="/forgot-password/reset" element={<ResetPasswordPage />} />
          </Route>
        </Route>

        <Route element={<ProtectedRoute />}>
          {/* /dashboard y /notes apuntan a la misma página */}
          <Route path="/dashboard" element={<NotesPage />} />
          <Route path="/notes" element={<NotesPage />} />
          <Route path="/tags" element={<TagsPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Route>

        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}
