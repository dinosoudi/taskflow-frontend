import { useEffect, useRef, useState } from 'react';
import { Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useUpdateNote } from '@/hooks/notes/useUpdateNote';
import { useTags } from '@/hooks/tags/useTags';
import { cn } from '@/lib/utils';
import type { NoteResponse } from '@/types';

interface EditNoteModalProps {
  note: NoteResponse | null;
  tagId?: string; // contexto del query activo
  onClose: () => void;
}

export function EditNoteModal({ note, tagId, onClose }: EditNoteModalProps) {
  const [content, setContent] = useState('');
  const [selectedTagId, setSelectedTagId] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const updateNote = useUpdateNote(tagId);
  const { data: tagsData } = useTags();
  const tags = tagsData?.tags ?? [];

  // Precargar datos de la nota al abrir
  useEffect(() => {
    if (note) {
      setContent(note.content);
      setSelectedTagId(note.tag?.id ?? null);
    }
  }, [note]);

  // Auto-resize textarea
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${el.scrollHeight}px`;
  }, [content]);

  const handleSave = () => {
    if (!note || !content.trim()) return;
    updateNote.mutate(
      {
        noteId: note.id,
        data: {
          content: content.trim(),
          completed: note.completed,
          tagId: selectedTagId,
        },
      },
      { onSuccess: onClose },
    );
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      handleSave();
    }
  };

  const hasChanges =
    note && (content.trim() !== note.content || selectedTagId !== (note.tag?.id ?? null));

  return (
    <Dialog open={!!note} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Editar nota</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-1">
          {/* Textarea */}
          <textarea
            ref={textareaRef}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Contenido de la nota..."
            rows={3}
            className="w-full resize-none rounded-md border border-input bg-transparent px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring leading-relaxed"
          />

          {/* Selector de tag */}
          {tags.length > 0 && (
            <div className="space-y-1.5">
              <p className="text-xs font-medium text-muted-foreground">Tag</p>
              <div className="flex flex-wrap gap-1.5">
                {/* Sin tag */}
                <button
                  type="button"
                  onClick={() => setSelectedTagId(null)}
                  className={cn(
                    'px-2.5 py-1 rounded-full text-xs font-medium border transition-colors',
                    selectedTagId === null
                      ? 'bg-muted border-foreground/20 text-foreground'
                      : 'border-border text-muted-foreground hover:border-foreground/20 hover:text-foreground',
                  )}
                >
                  Sin tag
                </button>

                {tags.map((tag) => (
                  <button
                    key={tag.id}
                    type="button"
                    onClick={() => setSelectedTagId(tag.id)}
                    className={cn(
                      'px-2.5 py-1 rounded-full text-xs font-medium border transition-colors',
                      selectedTagId === tag.id
                        ? 'border-transparent'
                        : 'border-border text-muted-foreground hover:border-transparent',
                    )}
                    style={
                      selectedTagId === tag.id
                        ? { backgroundColor: tag.color + '25', color: tag.color, borderColor: tag.color + '40' }
                        : {}
                    }
                  >
                    {tag.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          <p className="text-xs text-muted-foreground">
            Ctrl+Enter para guardar
          </p>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={updateNote.isPending}>
            Cancelar
          </Button>
          <Button
            onClick={handleSave}
            disabled={!hasChanges || !content.trim() || updateNote.isPending}
            className="bg-indigo-600 hover:bg-indigo-700"
          >
            {updateNote.isPending && <Loader2 className="animate-spin" />}
            Guardar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
