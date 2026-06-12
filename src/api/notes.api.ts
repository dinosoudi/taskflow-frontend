import { apiClient } from './client';
import type { NotePageResponse, NoteRequest, NoteResponse, PageParams } from '../types';

export const notesApi = {
  getAll: async (params?: PageParams): Promise<NotePageResponse> => {
    const res = await apiClient.get<NotePageResponse>('/notes', { params });
    return res.data;
  },

  getById: async (noteId: string): Promise<NoteResponse> => {
    const res = await apiClient.get<NoteResponse>(`/notes/${noteId}`);
    return res.data;
  },

  getByTag: async (tagId: string, params?: Pick<PageParams, 'page' | 'size'>): Promise<NotePageResponse> => {
    const res = await apiClient.get<NotePageResponse>(`/notes/tag/${tagId}`, { params });
    return res.data;
  },

  create: async (data: NoteRequest): Promise<NoteResponse> => {
    const res = await apiClient.post<NoteResponse>('/notes', data);
    return res.data;
  },

  // PUT completo — enviar todos los campos aunque no cambien
  update: async (noteId: string, data: NoteRequest): Promise<NoteResponse> => {
    const res = await apiClient.put<NoteResponse>(`/notes/${noteId}`, data);
    return res.data;
  },

  // DELETE devuelve 204 sin body
  delete: async (noteId: string): Promise<void> => {
    await apiClient.delete(`/notes/${noteId}`);
  },
};
