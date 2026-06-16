# TaskFlow Frontend

Frontend application built with:

- React
- TypeScript
- Vite
- React Query
- Zustand
- React Hook Form
- React Router
- shadcn/ui

## Installation

```bash
pnpm install
pnpm dev
```
# Build de la imagen
docker build -t taskflow-frontend .

# Opción A — mismo puerto que pnpm dev (solo uno a la vez, pero cambiar la url de los correos de 3000 a 5173)
docker run -p 5173:80 taskflow-frontend

# Opción B — puerto separado (puedes tener ambos corriendo y aqui se envian los correos)
docker run -p 3000:80 taskflow-frontend

Un tip útil: agrega --rm para que el contenedor se elimine solo cuando lo detengas con Ctrl+C, así no se acumulan contenedores parados:
docker run --rm -p 3000:80 taskflow-frontend

# TaskFlow Frontend

Interfaz web de TaskFlow — aplicación de notas y tareas personales. Construida con React + TypeScript + Vite.

## Stack

| Tecnología | Rol |
|---|---|
| React 18 + TypeScript | UI y lógica de componentes |
| Vite | Bundler y servidor de desarrollo |
| React Router v7 | Navegación y guards de rutas |
| TanStack Query v5 | Estado del servidor, caché y mutations |
| Zustand | Estado global de sesión (accessToken, user) |
| React Hook Form + Zod | Formularios y validación |
| Axios | Cliente HTTP con interceptores de auth |
| Tailwind CSS + shadcn/ui | Estilos y componentes UI |
| pnpm | Gestor de paquetes |

## Requisitos

- Node.js 20+
- pnpm 9+
- Backend de TaskFlow corriendo en `localhost:8080`

## Instalación y desarrollo

```bash
# Clonar el repositorio
git clone https://github.com/tu-usuario/taskflow-frontend.git
cd taskflow-frontend

# Instalar dependencias
pnpm install

# Configurar variables de entorno
cp .env.example .env.local
# Editar .env.local si el backend corre en otro puerto

# Levantar en modo desarrollo
pnpm dev
```

La app queda disponible en `http://localhost:5173`.

## Variables de entorno

| Variable | Descripción | Default |
|---|---|---|
| `VITE_API_BASE_URL` | URL base del backend | `http://localhost:8080/api/v1` |

## Scripts disponibles

```bash
pnpm dev          # Servidor de desarrollo con hot reload
pnpm build        # Build de producción
pnpm preview      # Preview del build de producción local
pnpm type-check   # Verificar tipos TypeScript sin compilar
pnpm lint         # Linting con ESLint
```

## Docker

### Solo el frontend

```bash
docker build -t taskflow-frontend .
docker run -p 3000:80 taskflow-frontend
```

### Stack completo (recomendado)

Desde la carpeta del backend:

```bash
docker compose up -d
```

Levanta todos los servicios:

| Servicio | URL |
|---|---|
| Frontend | http://localhost:3000 |
| Backend | http://localhost:8080 |
| pgAdmin | http://localhost:5050 |
| Grafana | http://localhost:3001 |

## Arquitectura

```
src/
├── api/              # Capa HTTP — funciones puras sin React
│   ├── client.ts     # Instancia Axios + interceptores de auth y refresh silencioso
│   ├── auth.api.ts
│   ├── notes.api.ts
│   ├── tags.api.ts
│   └── users.api.ts
│
├── types/            # Tipos TypeScript derivados de los contratos YAML
│   ├── api.types.ts  # ErrorResponse, PageResponse, ApiError
│   ├── auth.types.ts
│   ├── notes.types.ts
│   ├── tags.types.ts
│   └── users.types.ts
│
├── store/
│   └── auth.store.ts # Zustand — user, accessToken, isAuthenticated
│
├── hooks/            # React Query hooks por módulo
│   ├── auth/
│   ├── notes/
│   ├── tags/
│   └── users/
│
├── components/
│   ├── ui/           # Componentes shadcn/ui (Button, Input, Dialog, etc.)
│   └── common/       # Componentes propios reutilizables
│
├── pages/            # Una carpeta por pantalla
│   ├── auth/
│   ├── notes/
│   ├── tags/
│   └── settings/
│
├── router/
│   └── index.tsx     # Rutas, ProtectedRoute, PublicRoute
│
├── contexts/
│   └── ForgotPasswordContext.tsx  # Estado compartido entre los 3 pasos de recuperación
│
└── lib/
    └── utils.ts      # cn(), isApiError(), formatRetryTimer(), constantes
```

## Manejo de autenticación

El frontend implementa JWT en memoria + refresh token en localStorage:

- **accessToken** — vive solo en memoria (Zustand + variable en `client.ts`). Se pierde al recargar pero se restaura automáticamente.
- **refreshToken** — guardado en `localStorage` con clave `taskflow_refresh_token`. Sobrevive recargas.

Al iniciar la app (`main.tsx`), antes de montar React, se intenta restaurar la sesión con el refreshToken almacenado. Si es válido, el usuario queda autenticado sin necesidad de hacer login de nuevo.

El interceptor de respuesta de Axios maneja el refresh silencioso: cuando cualquier request devuelve 401, automáticamente llama a `/auth/refresh`, actualiza los tokens, y reintenta el request original. Si el refresh también falla, limpia la sesión y redirige al login.

## Flujos principales

**Registro**
`/register` → POST `/auth/register` → `/verify-email-sent` → clic en correo → `/verify-email?token=...` → POST `/auth/verify-email` → `/dashboard`

**Recuperación de contraseña**
`/forgot-password` → POST `/auth/forgot-password` → `/forgot-password/verify` → POST `/auth/verify-reset-code` → `/forgot-password/reset` → POST `/auth/reset-password` → `/dashboard`

El estado entre los 3 pasos (email y resetToken) se comparte vía `ForgotPasswordContext` — vive en memoria y no persiste si el usuario recarga a la mitad del flujo.

**Notas**
- Paginación con infinite scroll manual ("Cargar más")
- Filtro por tag via query param `?tag={id}`
- Operaciones de crear, completar y eliminar con optimistic updates
- Crear nota en el filtro activo asigna el tag automáticamente

**Tags — delete con confirmación**
El backend devuelve 409 con `noteCount` cuando se intenta borrar un tag con notas asignadas (`force=false`). El frontend muestra un modal de confirmación con el conteo y llama de nuevo con `force=true` si el usuario confirma.

## Convenciones

- La capa `api/` no importa nada de React — solo funciones async que devuelven tipos
- Zustand solo guarda estado verdaderamente global: `user`, `accessToken`, `isAuthenticated`
- Estado de formularios → React Hook Form
- Estado del servidor → React Query
- Errores del backend con `field` se mapean directamente al campo del formulario con `setError`
- Optimistic updates en crear nota, completar nota, eliminar nota y preferencias de usuario