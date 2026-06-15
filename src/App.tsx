import { AppRouter } from './router';

// El restore de sesión ahora ocurre en main.tsx antes de montar React
// App.tsx es solo el punto de entrada del árbol de componentes
export default function App() {
  return <AppRouter />;
}
