import { Link, useSearchParams } from 'react-router-dom';
import { CheckSquare, Tag, Settings, LogOut, StickyNote } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTags } from '@/hooks/tags/useTags';
import { useAuthStore } from '@/store/auth.store';
import { authApi } from '@/api/auth.api';
import { tokenStore } from '@/api/client';

export function AppSidebar() {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTagId = searchParams.get('tag') ?? undefined;

  const { data: tagsData } = useTags();
  const tags = tagsData?.tags ?? [];

  const { user, clearSession } = useAuthStore();

  const handleLogout = async () => {
    const refreshToken = tokenStore.getRefresh();
    if (refreshToken) {
      // Fire and forget — si falla igual limpiamos la sesión local
      authApi.logout({ refreshToken }).catch(() => {});
    }
    clearSession();
  };

  const handleAllNotes = () => {
    setSearchParams({});
  };

  const handleTagFilter = (tagId: string) => {
    setSearchParams({ tag: tagId });
  };

  return (
    <aside className="w-60 flex-shrink-0 h-screen sticky top-0 flex flex-col border-r border-border bg-background">
      {/* Logo */}
      <div className="flex items-center gap-2 px-5 py-4 border-b border-border">
        <CheckSquare className="h-5 w-5 text-indigo-600" />
        <span className="font-semibold tracking-tight">TaskFlow</span>
      </div>

      {/* Navegación principal */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-0.5">
        {/* Todas las notas */}
        <button
          onClick={handleAllNotes}
          className={cn(
            'w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-sm transition-colors text-left',
            !activeTagId
              ? 'bg-indigo-50 text-indigo-700 font-medium'
              : 'text-muted-foreground hover:text-foreground hover:bg-muted',
          )}
        >
          <StickyNote className="h-4 w-4 flex-shrink-0" />
          Todas las notas
        </button>

        {/* Separador Tags */}
        {tags.length > 0 && (
          <div className="pt-4 pb-1 px-3">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Tags
            </p>
          </div>
        )}

        {/* Lista de tags */}
        {tags.map((tag) => (
          <button
            key={tag.id}
            onClick={() => handleTagFilter(tag.id)}
            className={cn(
              'w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-sm transition-colors text-left',
              activeTagId === tag.id
                ? 'bg-indigo-50 text-indigo-700 font-medium'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted',
            )}
          >
            <span
              className="h-2.5 w-2.5 rounded-full flex-shrink-0"
              style={{ backgroundColor: tag.color }}
            />
            <span className="flex-1 truncate">{tag.name}</span>
            <span className="text-xs text-muted-foreground tabular-nums">
              {tag.noteCount}
            </span>
          </button>
        ))}
      </nav>

      {/* Footer — config y logout */}
      <div className="border-t border-border p-3 space-y-0.5">
        <Link
          to="/settings"
          className="flex items-center gap-2.5 px-3 py-2 rounded-md text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
        >
          <Settings className="h-4 w-4 flex-shrink-0" />
          Configuración
        </Link>

        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-sm text-muted-foreground hover:text-destructive hover:bg-destructive/5 transition-colors text-left"
        >
          <LogOut className="h-4 w-4 flex-shrink-0" />
          Cerrar sesión
        </button>

        {/* Avatar mínimo */}
        {user && (
          <div className="flex items-center gap-2.5 px-3 py-2 mt-1">
            <div className="h-6 w-6 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0">
              <span className="text-xs font-semibold text-indigo-700">
                {user.name.charAt(0).toUpperCase()}
              </span>
            </div>
            <span className="text-xs text-muted-foreground truncate">{user.name}</span>
          </div>
        )}
      </div>
    </aside>
  );
}
