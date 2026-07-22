import api from './api';
import { ApiResponse, User } from '../types';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export const authService = {
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const res = await api.post<any, ApiResponse<AuthResponse>>('/auth/login', credentials);
    return res.data;
  },

  getProfile: async (): Promise<User> => {
    const res = await api.get<any, ApiResponse<User>>('/auth/me');
    return res.data;
  },
};
