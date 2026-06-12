import { apiClient } from './client';
import { ApiError } from '../types';
import type { TagRequest, TagResponse, TagsListResponse } from '../types';

export const tagsApi = {
  getAll: async (): Promise<TagsListResponse> => {
    const res = await apiClient.get<TagsListResponse>('/tags');
    return res.data;
  },

  create: async (data: TagRequest): Promise<TagResponse> => {
    const res = await apiClient.post<TagResponse>('/tags', data);
    return res.data;
  },

  update: async (tagId: string, data: TagRequest): Promise<TagResponse> => {
    const res = await apiClient.put<TagResponse>(`/tags/${tagId}`, data);
    return res.data;
  },

  // Devuelve:
  //   void          → borrado exitoso (204)
  //   number        → noteCount del 409 (tag tiene notas, force=false)
  //                   El caller muestra modal de confirmación y llama con force=true
  delete: async (tagId: string, force = false): Promise<void | number> => {
    try {
      await apiClient.delete(`/tags/${tagId}`, { params: { force } });
    } catch (error) {
      if (error instanceof ApiError && error.status === 409 && !force) {
        // El backend devuelve noteCount en este 409 especial
        // Lo extraemos y lo devolvemos para que el hook lo exponga al componente
        const conflictData = (error as ApiError & { noteCount?: number });
        return conflictData.noteCount ?? 0;
      }
      throw error;
    }
  },
};
