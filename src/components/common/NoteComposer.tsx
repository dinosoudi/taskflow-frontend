import { useState, useRef, useEffect } from 'react';
import { Plus, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useCreateNote } from '@/hooks/notes/useCreateNote';
import { useTags } from '@/hooks/tags/useTags';

interface NoteComposerProps {
  // Si hay un tag activo en el sidebar, se preselecciona automáticamente
  activeTagId?: string;
}

export function NoteComposer({ activeTagId }: NoteComposerProps) {
  const [content, setContent] = useState('');
  const [focused, setFocused] = useState(false);
  // Si hay tag activo en el filtro, arranca preseleccionado
  const [selectedTagId, setSelectedTagId] = useState<string | null>(activeTagId ?? null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const createNote = useCreateNote(activeTagId);
  const { data: tagsData } = useTags();
  const tags = tagsData?.tags ?? [];

  // Sincronizar si cambia el filtro activo del sidebar
  useEffect(() => {
    setSelectedTagId(activeTagId ?? null);
  }, [activeTagId]);

  // Auto-resize del textarea
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${el.scrollHeight}px`;
  }, [content]);

  const handleSubmit = () => {
    const trimmed = content.trim();
    if (!trimmed || createNote.isPending) return;
    createNote.mutate({ content: trimmed, tagId: selectedTagId });
    setContent('');
    // Mantener el tag seleccionado para crear varias notas seguidas con el mismo tag
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
    if (e.key === 'Escape') {
      setContent('');
      textareaRef.current?.blur();
    }
  };

  const showTagSelector = tags.length > 0;

  return (
    <div
      className={cn(
        'rounded-xl border bg-background transition-all duration-150',
        focused
          ? 'border-indigo-400 shadow-sm shadow-indigo-100 ring-1 ring-indigo-400/30'
          : 'border-border',
      )}
    >
      {/* Textarea row */}
      <div className="flex items-start gap-3 px-4 py-3">
        <textarea
          ref={textareaRef}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder="Escribe una nota… (Enter para guardar, Shift+Enter para nueva línea)"
          rows={1}
          className="flex-1 resize-none bg-transparent text-sm placeholder:text-muted-foreground focus:outline-none leading-relaxed"
        />
        <button
          onClick={handleSubmit}
          disabled={!content.trim() || createNote.isPending}
          className={cn(
            'flex-shrink-0 h-7 w-7 rounded-md flex items-center justify-center transition-all mt-0.5',
            content.trim()
              ? 'bg-indigo-600 text-white hover:bg-indigo-700'
              : 'bg-muted text-muted-foreground cursor-not-allowed',
          )}
          aria-label="Crear nota"
        >
          {createNote.isPending
            ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
            : <Plus className="h-3.5 w-3.5" />
          }
        </button>
      </div>

      {/* Selector de tags — solo si hay tags creados */}
      {showTagSelector && (
        <div className="px-4 pb-3 flex items-center gap-1.5 flex-wrap border-t border-border/50 pt-2.5">
          <span className="text-xs text-muted-foreground mr-0.5">Tag:</span>

          {/* Opción "Ninguno" */}
          <button
            type="button"
            onClick={() => setSelectedTagId(null)}
            className={cn(
              'px-2.5 py-0.5 rounded-full text-xs font-medium border transition-colors',
              selectedTagId === null
                ? 'bg-muted border-foreground/20 text-foreground'
                : 'border-border text-muted-foreground hover:border-foreground/20 hover:text-foreground',
            )}
          >
            Ninguno
          </button>

          {tags.map((tag) => (
            <button
              key={tag.id}
              type="button"
              onClick={() => setSelectedTagId(tag.id === selectedTagId ? null : tag.id)}
              className={cn(
                'inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border transition-colors',
                selectedTagId === tag.id
                  ? 'border-transparent'
                  : 'border-border text-muted-foreground hover:border-transparent',
              )}
              style={
                selectedTagId === tag.id
                  ? { backgroundColor: tag.color + '25', color: tag.color, borderColor: tag.color + '50' }
                  : {}
              }
            >
              <span
                className="h-1.5 w-1.5 rounded-full flex-shrink-0"
                style={{ backgroundColor: selectedTagId === tag.id ? tag.color : undefined }}
              />
              {tag.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
