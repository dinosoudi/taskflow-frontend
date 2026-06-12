import type { PageResponse } from './api.types';

// ─────────────────────────────────────────────────────────────
// Tag embebido en la nota (resumen — no el TagResponse completo)
// ─────────────────────────────────────────────────────────────

export interface TagSummary {
  id: string;
  name: string;
  color: string; // hex #RRGGBB
}

// ─────────────────────────────────────────────────────────────
// NoteResponse — lo que devuelve el backend
// ─────────────────────────────────────────────────────────────

export interface NoteResponse {
  id: string;
  content: string;
  completed: boolean;
  tag: TagSummary | null;
  createdAt: string;
  updatedAt: string;
}

// ─────────────────────────────────────────────────────────────
// NoteRequest — body para POST y PUT
// PUT es completo: enviar todos los campos aunque no cambien
// ─────────────────────────────────────────────────────────────

export interface NoteRequest {
  content: string;
  completed?: boolean;
  tagId?: string | null; // null = quitar el tag explícitamente en PUT
}

// ─────────────────────────────────────────────────────────────
// Paginación de notas
// ─────────────────────────────────────────────────────────────

export type NotePageResponse = PageResponse<NoteResponse>;
