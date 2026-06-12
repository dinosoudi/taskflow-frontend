import { apiClient } from './client';
import type {
  AuthResponse,
  ForgotPasswordRequest,
  LoginRequest,
  LogoutRequest,
  MessageResponse,
  RefreshRequest,
  RefreshResponse,
  RegisterRequest,
  ResendVerificationRequest,
  ResetPasswordRequest,
  VerifyEmailRequest,
  VerifyResetCodeRequest,
  VerifyResetCodeResponse,
} from '../types';

export const authApi = {
  register: async (data: RegisterRequest): Promise<AuthResponse> => {
    const res = await apiClient.post<AuthResponse>('/auth/register', data);
    return res.data;
  },

  verifyEmail: async (data: VerifyEmailRequest): Promise<AuthResponse> => {
    const res = await apiClient.post<AuthResponse>('/auth/verify-email', data);
    return res.data;
  },

  resendVerification: async (data: ResendVerificationRequest): Promise<MessageResponse> => {
    const res = await apiClient.post<MessageResponse>('/auth/resend-verification', data);
    return res.data;
  },

  login: async (data: LoginRequest): Promise<AuthResponse> => {
    const res = await apiClient.post<AuthResponse>('/auth/login', data);
    return res.data;
  },

  refresh: async (data: RefreshRequest): Promise<RefreshResponse> => {
    const res = await apiClient.post<RefreshResponse>('/auth/refresh', data);
    return res.data;
  },

  forgotPassword: async (data: ForgotPasswordRequest): Promise<MessageResponse> => {
    const res = await apiClient.post<MessageResponse>('/auth/forgot-password', data);
    return res.data;
  },

  verifyResetCode: async (data: VerifyResetCodeRequest): Promise<VerifyResetCodeResponse> => {
    const res = await apiClient.post<VerifyResetCodeResponse>('/auth/verify-reset-code', data);
    return res.data;
  },

  resetPassword: async (data: ResetPasswordRequest): Promise<AuthResponse> => {
    const res = await apiClient.post<AuthResponse>('/auth/reset-password', data);
    return res.data;
  },

  logout: async (data: LogoutRequest): Promise<MessageResponse> => {
    const res = await apiClient.post<MessageResponse>('/auth/logout', data);
    return res.data;
  },

  logoutAll: async (): Promise<MessageResponse> => {
    const res = await apiClient.post<MessageResponse>('/auth/logout-all');
    return res.data;
  },
};
