import { useState, useRef, useEffect } from 'react';
import { Trash2, MoreHorizontal } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useUpdateNote } from '@/hooks/notes/useUpdateNote';
import { useDeleteNote } from '@/hooks/notes/useDeleteNote';
import type { NoteResponse } from '@/types';

interface NoteItemProps {
  note: NoteResponse;
  tagId?: string; // para el contexto del query
}

export function NoteItem({ note, tagId }: NoteItemProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const confirmTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const updateNote = useUpdateNote(tagId);
  const deleteNote = useDeleteNote(tagId);

  // Cerrar menú al hacer click fuera
  useEffect(() => {
    if (!menuOpen) return;
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
        setConfirming(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [menuOpen]);

  const handleToggle = () => {
    updateNote.mutate({
      noteId: note.id,
      data: {
        content: note.content,
        completed: !note.completed,
        tagId: note.tag?.id ?? null,
      },
    });
  };

  const handleDeleteClick = () => {
    if (confirming) {
      // Segunda vez — confirmar borrado
      if (confirmTimerRef.current) clearTimeout(confirmTimerRef.current);
      deleteNote.mutate(note.id);
      setMenuOpen(false);
      setConfirming(false);
    } else {
      // Primera vez — pedir confirmación, revertir en 3s si no confirma
      setConfirming(true);
      confirmTimerRef.current = setTimeout(() => setConfirming(false), 3000);
    }
  };

  const isOptimistic = note.id.startsWith('optimistic-');

  return (
    <div
      className={cn(
        'group flex items-start gap-3 px-4 py-3 rounded-lg border border-transparent hover:border-border hover:bg-muted/40 transition-all',
        isOptimistic && 'opacity-60',
      )}
    >
      {/* Checkbox */}
      <button
        onClick={handleToggle}
        disabled={isOptimistic || updateNote.isPending}
        className="mt-0.5 flex-shrink-0 h-5 w-5 rounded border-2 border-muted-foreground/40 hover:border-indigo-500 flex items-center justify-center transition-colors disabled:cursor-not-allowed"
        aria-label={note.completed ? 'Marcar como pendiente' : 'Marcar como completada'}
      >
        {note.completed && (
          <div className="h-3 w-3 rounded-sm bg-indigo-600" />
        )}
      </button>

      {/* Contenido */}
      <div className="flex-1 min-w-0">
        <p
          className={cn(
            'text-sm leading-relaxed break-words',
            note.completed && 'line-through text-muted-foreground',
          )}
        >
          {note.content}
        </p>

        {/* Tag pill */}
        {note.tag && (
          <span
            className="inline-flex items-center gap-1 mt-1.5 px-2 py-0.5 rounded-full text-xs font-medium"
            style={{
              backgroundColor: note.tag.color + '20',
              color: note.tag.color,
            }}
          >
            <span
              className="h-1.5 w-1.5 rounded-full flex-shrink-0"
              style={{ backgroundColor: note.tag.color }}
            />
            {note.tag.name}
          </span>
        )}
      </div>

      {/* Menú de opciones */}
      <div className="relative flex-shrink-0" ref={menuRef}>
        <button
          onClick={() => setMenuOpen((v) => !v)}
          className={cn(
            'h-7 w-7 rounded flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-all',
            'opacity-0 group-hover:opacity-100 focus:opacity-100',
            menuOpen && 'opacity-100',
          )}
          aria-label="Opciones de nota"
        >
          <MoreHorizontal className="h-4 w-4" />
        </button>

        {menuOpen && (
          <div className="absolute right-0 top-8 z-10 w-40 rounded-md border border-border bg-background shadow-md py-1">
            <button
              onClick={handleDeleteClick}
              className={cn(
                'w-full flex items-center gap-2 px-3 py-1.5 text-sm transition-colors',
                confirming
                  ? 'text-destructive bg-destructive/5 font-medium'
                  : 'text-muted-foreground hover:text-destructive hover:bg-destructive/5',
              )}
            >
              <Trash2 className="h-3.5 w-3.5" />
              {confirming ? '¿Confirmar borrado?' : 'Eliminar nota'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
