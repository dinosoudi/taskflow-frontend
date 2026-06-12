import { createContext, useContext, useState, type ReactNode } from 'react';

// ─────────────────────────────────────────────────────────────
// Estado del flujo de 3 pasos de recuperación de contraseña
//
// Paso 1 /forgot-password         → guarda email
// Paso 2 /forgot-password/verify  → guarda resetToken
// Paso 3 /forgot-password/reset   → usa resetToken y lo limpia
//
// Todo en memoria — no persiste entre recargas (es correcto:
// si el usuario recarga a la mitad del flujo, que empiece de nuevo)
// ─────────────────────────────────────────────────────────────

interface ForgotPasswordState {
  email: string;
  resetToken: string;
  setEmail: (email: string) => void;
  setResetToken: (token: string) => void;
  reset: () => void;
}

const ForgotPasswordContext = createContext<ForgotPasswordState | null>(null);

export function ForgotPasswordProvider({ children }: { children: ReactNode }) {
  const [email, setEmail] = useState('');
  const [resetToken, setResetToken] = useState('');

  const reset = () => {
    setEmail('');
    setResetToken('');
  };

  return (
    <ForgotPasswordContext.Provider
      value={{ email, resetToken, setEmail, setResetToken, reset }}
    >
      {children}
    </ForgotPasswordContext.Provider>
  );
}

export function useForgotPassword(): ForgotPasswordState {
  const ctx = useContext(ForgotPasswordContext);
  if (!ctx) {
    throw new Error('useForgotPassword debe usarse dentro de ForgotPasswordProvider');
  }
  return ctx;
}
