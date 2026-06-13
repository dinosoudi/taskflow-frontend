import { useState, useRef, useEffect } from 'react';
import { Plus, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useCreateNote } from '@/hooks/notes/useCreateNote';

interface NoteComposerProps {
  tagId?: string;
}

export function NoteComposer({ tagId }: NoteComposerProps) {
  const [content, setContent] = useState('');
  const [focused, setFocused] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const createNote = useCreateNote(tagId);

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
    createNote.mutate({ content: trimmed, tagId: tagId ?? null });
    setContent('');
    textareaRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Enter sin Shift → crear nota
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
    // Escape → limpiar y desfocar
    if (e.key === 'Escape') {
      setContent('');
      textareaRef.current?.blur();
    }
  };

  return (
    <div
      className={cn(
        'flex items-start gap-3 px-4 py-3 rounded-xl border bg-background transition-all duration-150',
        focused
          ? 'border-indigo-400 shadow-sm shadow-indigo-100 ring-1 ring-indigo-400/30'
          : 'border-border',
      )}
    >
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
          'flex-shrink-0 h-7 w-7 rounded-md flex items-center justify-center transition-all',
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
  );
}
