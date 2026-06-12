// ─────────────────────────────────────────────────────────────
// TagResponse — lo que devuelve el backend
// ─────────────────────────────────────────────────────────────

export interface TagResponse {
  id: string;
  name: string;
  color: string; // hex #RRGGBB
  noteCount: number;
  createdAt: string;
}

// ─────────────────────────────────────────────────────────────
// Wrapper de GET /tags
// ─────────────────────────────────────────────────────────────

export interface TagsListResponse {
  tags: TagResponse[];
}

// ─────────────────────────────────────────────────────────────
// TagRequest — body para POST y PUT
// ─────────────────────────────────────────────────────────────

export interface TagRequest {
  name: string;
  color: string; // debe ser hex válido #RRGGBB
}

// ─────────────────────────────────────────────────────────────
// DELETE /tags/{tagId} — 409 cuando force=false y el tag tiene notas
// El frontend muestra un modal de confirmación con noteCount
// y luego llama de nuevo con force=true si el usuario confirma
// ─────────────────────────────────────────────────────────────

export interface DeleteTagConflictResponse {
  status: 409;
  error: 'CONFLICT';
  message: string;
  noteCount: number;
  timestamp: string;
}
