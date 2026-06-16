import { apiClient } from './client';
import type {
  ChangePasswordRequest,
  DeleteAccountRequest,
  MessageResponse,
  UpdateNameRequest,
  UpdatePhoneRequest,
  UpdatePreferencesRequest,
  UserProfileResponse,
  PreferencesResponse,
} from '../types';

export const usersApi = {
  getProfile: async (): Promise<UserProfileResponse> => {
    const res = await apiClient.get<UserProfileResponse>('/users/me');
    return res.data;
  },

  updateName: async (data: UpdateNameRequest): Promise<UserProfileResponse> => {
    const res = await apiClient.patch<UserProfileResponse>('/users/me/name', data);
    return res.data;
  },

  updatePhone: async (data: UpdatePhoneRequest): Promise<UserProfileResponse> => {
    const res = await apiClient.patch<UserProfileResponse>('/users/me/phone', data);
    return res.data;
  },

  changePassword: async (data: ChangePasswordRequest): Promise<MessageResponse> => {
    const res = await apiClient.patch<MessageResponse>('/users/me/password', data);
    return res.data;
  },

  updatePreferences: async (data: UpdatePreferencesRequest): Promise<PreferencesResponse> => {
    const res = await apiClient.patch<PreferencesResponse>('/users/me/preferences', data);
    return res.data;
  },

  deleteAccount: async (data: DeleteAccountRequest): Promise<MessageResponse> => {
    const res = await apiClient.delete<MessageResponse>('/users/me', { data });
    return res.data;
  },

  cancelDeletion: async (): Promise<MessageResponse> => {
    const res = await apiClient.post<MessageResponse>('/users/me/cancel-deletion');
    return res.data;
  },
};