import { useSearchParams } from 'react-router-dom';
import { StickyNote, Loader2, AlertCircle } from 'lucide-react';
import { AppSidebar } from '@/components/common/AppSidebar';
import { NoteComposer } from '@/components/common/NoteComposer';
import { NoteItem } from '@/components/common/NoteItem';
import { Button } from '@/components/ui/button';
import { useNotes } from '@/hooks/notes/useNotes';
import { useTags } from '@/hooks/tags/useTags';
import { useAuthStore } from '@/store/auth.store';
import { isApiError } from '@/lib/utils';

export default function NotesPage() {
  const [searchParams] = useSearchParams();
  const tagId = searchParams.get('tag') ?? undefined;

  const user = useAuthStore((s) => s.user);
  const { data: tagsData } = useTags();
  const activeTag = tagsData?.tags?.find((t) => t.id === tagId);

  const {
    data,
    isLoading,
    isError,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useNotes(tagId);

  // Aplanar todas las páginas en una lista
  const notes = data?.pages.flatMap((page) => page.content) ?? [];
  const totalElements = data?.pages[0]?.totalElements ?? 0;

  // Título dinámico según el filtro activo
  const title = activeTag ? activeTag.name : 'Todas las notas';
  const subtitle = totalElements > 0
    ? `${totalElements} ${totalElements === 1 ? 'nota' : 'notas'}`
    : null;

  return (
    <div className="flex h-screen bg-background">
      <AppSidebar />

      {/* Área principal */}
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-2xl mx-auto px-6 py-8 space-y-6">

          {/* Header */}
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              {activeTag && (
                <span
                  className="h-3 w-3 rounded-full flex-shrink-0"
                  style={{ backgroundColor: activeTag.color }}
                />
              )}
              <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
            </div>
            {subtitle && (
              <p className="text-sm text-muted-foreground">{subtitle}</p>
            )}
          </div>

          {/* Composer — siempre visible */}
          <NoteComposer tagId={tagId} />

          {/* Estados de carga / error / vacío / lista */}
          {isLoading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : isError ? (
            <div className="flex flex-col items-center gap-3 py-16 text-center">
              <AlertCircle className="h-8 w-8 text-destructive" />
              <div className="space-y-1">
                <p className="text-sm font-medium">No se pudieron cargar las notas</p>
                <p className="text-xs text-muted-foreground">
                  {isApiError(error) ? error.message : 'Intenta de nuevo'}
                </p>
              </div>
            </div>
          ) : notes.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-16 text-center">
              <StickyNote className="h-10 w-10 text-muted-foreground/40" />
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">
                  {activeTag
                    ? `No hay notas con el tag "${activeTag.name}"`
                    : `Hola${user?.name ? `, ${user.name.split(' ')[0]}` : ''}! Escribe tu primera nota arriba.`}
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-0.5">
              {notes.map((note) => (
                <NoteItem key={note.id} note={note} tagId={tagId} />
              ))}

              {/* Cargar más */}
              {hasNextPage && (
                <div className="pt-4 flex justify-center">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => fetchNextPage()}
                    disabled={isFetchingNextPage}
                    className="text-muted-foreground"
                  >
                    {isFetchingNextPage && <Loader2 className="animate-spin" />}
                    Cargar más notas
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
