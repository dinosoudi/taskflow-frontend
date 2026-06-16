import { useState } from 'react';
import { Plus, Pencil, Trash2, Loader2, Tag, AlertCircle } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { AppSidebar } from '@/components/common/AppSidebar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FormField } from '@/components/common/FormField';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { useTags } from '@/hooks/tags/useTags';
import { useCreateTag, useUpdateTag, useDeleteTag } from '@/hooks/tags/useTagMutations';
import { isApiError, HEX_COLOR_REGEX, cn } from '@/lib/utils';
import type { TagResponse } from '@/types';

// ─── Esquema del formulario ───────────────────────────────────────────────────

const PRESET_COLORS = [
  '#EF4444', '#F97316', '#EAB308', '#22C55E',
  '#14B8A6', '#3B82F6', '#8B5CF6', '#EC4899',
  '#64748B', '#0EA5E9', '#F43F5E', '#10B981',
];

const tagSchema = z.object({
  name: z.string().min(1, 'El nombre no puede estar vacío').max(50, 'Máximo 50 caracteres'),
  color: z.string().regex(HEX_COLOR_REGEX, 'El color debe ser un valor hexadecimal válido. Ejemplo: #FF6B6B'),
});

type TagFormValues = z.infer<typeof tagSchema>;

// ─── Modal crear / editar ─────────────────────────────────────────────────────

interface TagModalProps {
  tag: TagResponse | null;      // null = modo crear
  open: boolean;
  onClose: () => void;
}

function TagModal({ tag, open, onClose }: TagModalProps) {
  const isEditing = !!tag;
  const createTag = useCreateTag();
  const updateTag = useUpdateTag();
  const isPending = createTag.isPending || updateTag.isPending;

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    setError,
    reset,
    formState: { errors },
  } = useForm<TagFormValues>({
    resolver: zodResolver(tagSchema),
    defaultValues: { name: tag?.name ?? '', color: tag?.color ?? '#3B82F6' },
  });

  // Sincronizar valores cuando cambia el tag (al abrir en modo editar)
  const selectedColor = watch('color');

  const handleClose = () => {
    reset();
    onClose();
  };

  const onSubmit = (data: TagFormValues) => {
    const onSuccess = () => handleClose();
    const onError = (error: unknown) => {
      if (isApiError(error) && error.status === 409) {
        setError('name', { type: 'server', message: error.message });
      } else if (isApiError(error) && error.field) {
        setError(error.field as keyof TagFormValues, { type: 'server', message: error.message });
      } else {
        setError('root', { type: 'server', message: isApiError(error) ? error.message : 'Error inesperado' });
      }
    };

    if (isEditing) {
      updateTag.mutate({ tagId: tag.id, data }, { onSuccess, onError });
    } else {
      createTag.mutate(data, { onSuccess, onError });
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && handleClose()}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Editar tag' : 'Nuevo tag'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-1" noValidate>
          {errors.root && (
            <div className="rounded-md bg-destructive/10 border border-destructive/20 px-3 py-2">
              <p className="text-xs text-destructive">{errors.root.message}</p>
            </div>
          )}

          <FormField id="tag-name" label="Nombre" error={errors.name?.message}>
            <Input
              id="tag-name"
              placeholder="Trabajo, Personal, Escuela…"
              autoFocus
              defaultValue={tag?.name ?? ''}
              {...register('name')}
            />
          </FormField>

          <div className="space-y-1.5">
            <p className="text-sm font-medium leading-none">Color</p>

            {/* Paleta de colores rápidos */}
            <div className="flex flex-wrap gap-2">
              {PRESET_COLORS.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setValue('color', color)}
                  className={cn(
                    'h-7 w-7 rounded-full border-2 transition-transform hover:scale-110',
                    selectedColor === color ? 'border-foreground scale-110' : 'border-transparent',
                  )}
                  style={{ backgroundColor: color }}
                  aria-label={color}
                />
              ))}
            </div>

            {/* Input hex manual */}
            <div className="flex items-center gap-2">
              <div
                className="h-7 w-7 rounded-full border border-border flex-shrink-0"
                style={{ backgroundColor: selectedColor }}
              />
              <Input
                placeholder="#3B82F6"
                className="font-mono text-xs"
                defaultValue={tag?.color ?? '#3B82F6'}
                {...register('color')}
              />
            </div>
            {errors.color && (
              <p className="text-xs text-destructive">{errors.color.message}</p>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose} disabled={isPending}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isPending} className="bg-indigo-600 hover:bg-indigo-700">
              {isPending && <Loader2 className="animate-spin" />}
              {isEditing ? 'Guardar cambios' : 'Crear tag'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ─── Modal confirmación de borrado con noteCount ──────────────────────────────

interface DeleteConfirmModalProps {
  tag: TagResponse | null;
  noteCount: number;
  onConfirm: () => void;
  onCancel: () => void;
  isPending: boolean;
}

function DeleteConfirmModal({ tag, noteCount, onConfirm, onCancel, isPending }: DeleteConfirmModalProps) {
  return (
    <Dialog open={!!tag} onOpenChange={(o) => !o && onCancel()}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>¿Eliminar tag?</DialogTitle>
        </DialogHeader>
        <div className="py-2 space-y-3">
          <p className="text-sm text-muted-foreground">
            El tag{' '}
            <span className="font-medium text-foreground">"{tag?.name}"</span>{' '}
            está asignado a{' '}
            <span className="font-medium text-foreground">
              {noteCount} {noteCount === 1 ? 'nota' : 'notas'}
            </span>.
            Si lo eliminas, esas notas quedarán sin tag.
          </p>
          <p className="text-xs text-muted-foreground">Esta acción no se puede deshacer.</p>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onCancel} disabled={isPending}>
            Cancelar
          </Button>
          <Button
            variant="destructive"
            onClick={onConfirm}
            disabled={isPending}
          >
            {isPending && <Loader2 className="animate-spin" />}
            Eliminar de todas formas
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Página principal ─────────────────────────────────────────────────────────

export default function TagsPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTag, setEditingTag] = useState<TagResponse | null>(null);
  const [deletingTag, setDeletingTag] = useState<TagResponse | null>(null);
  const [deleteNoteCount, setDeleteNoteCount] = useState(0);

  const { data, isLoading, isError, error } = useTags();
  const tags = data?.tags ?? [];

  const { deleteMutation, deleteForceMutation } = useDeleteTag();

  const handleDeleteClick = async (tag: TagResponse) => {
    const result = await deleteMutation.mutateAsync(tag.id).catch(() => null);
    if (typeof result === 'number') {
      // 409 — el tag tiene notas, mostrar confirmación
      setDeletingTag(tag);
      setDeleteNoteCount(result);
    }
    // Si result === undefined → borrado exitoso directo
  };

  const handleDeleteConfirm = () => {
    if (!deletingTag) return;
    deleteForceMutation.mutate(deletingTag.id, {
      onSuccess: () => {
        setDeletingTag(null);
        setDeleteNoteCount(0);
      },
    });
  };

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <AppSidebar />

      <main className="flex-1 overflow-y-auto">
        <div className="max-w-2xl mx-auto px-6 py-8 space-y-6">

          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <h1 className="text-2xl font-bold tracking-tight">Tags</h1>
              {tags.length > 0 && (
                <p className="text-sm text-muted-foreground">
                  {tags.length} {tags.length === 1 ? 'tag' : 'tags'}
                </p>
              )}
            </div>
            <Button
              onClick={() => { setEditingTag(null); setModalOpen(true); }}
              className="bg-indigo-600 hover:bg-indigo-700"
              size="sm"
            >
              <Plus className="h-4 w-4" />
              Nuevo tag
            </Button>
          </div>

          {/* Estados */}
          {isLoading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : isError ? (
            <div className="flex flex-col items-center gap-3 py-16 text-center">
              <AlertCircle className="h-8 w-8 text-destructive" />
              <p className="text-sm text-muted-foreground">
                {isApiError(error) ? error.message : 'No se pudieron cargar los tags'}
              </p>
            </div>
          ) : tags.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-16 text-center">
              <Tag className="h-10 w-10 text-muted-foreground/40" />
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Sin tags todavía</p>
                <p className="text-xs text-muted-foreground">
                  Crea un tag para organizar tus notas por categoría.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              {tags.map((tag) => (
                <div
                  key={tag.id}
                  className="group flex items-center gap-3 px-4 py-3 rounded-lg border border-border hover:border-indigo-200 hover:bg-muted/30 transition-all"
                >
                  {/* Dot de color */}
                  <span
                    className="h-3 w-3 rounded-full flex-shrink-0"
                    style={{ backgroundColor: tag.color }}
                  />

                  {/* Nombre y conteo */}
                  <div className="flex-1 min-w-0">
                    <span className="text-sm font-medium">{tag.name}</span>
                  </div>

                  {/* Conteo de notas */}
                  <span className="text-xs text-muted-foreground tabular-nums">
                    {tag.noteCount} {tag.noteCount === 1 ? 'nota' : 'notas'}
                  </span>

                  {/* Acciones */}
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => { setEditingTag(tag); setModalOpen(true); }}
                      className="h-7 w-7 rounded flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                      aria-label="Editar tag"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteClick(tag)}
                      disabled={deleteMutation.isPending}
                      className="h-7 w-7 rounded flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-destructive/5 transition-colors disabled:opacity-50"
                      aria-label="Eliminar tag"
                    >
                      {deleteMutation.isPending && deleteMutation.variables === tag.id
                        ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        : <Trash2 className="h-3.5 w-3.5" />
                      }
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Modal crear / editar */}
      <TagModal key={editingTag?.id ?? "new"}
        tag={editingTag}
        open={modalOpen}
        onClose={() => { setModalOpen(false); setEditingTag(null); }}
      />

      {/* Modal confirmación borrado con notas */}
      <DeleteConfirmModal
        tag={deletingTag}
        noteCount={deleteNoteCount}
        onConfirm={handleDeleteConfirm}
        onCancel={() => { setDeletingTag(null); setDeleteNoteCount(0); }}
        isPending={deleteForceMutation.isPending}
      />
    </div>
  );
}
