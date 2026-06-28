import client from '../api/client';
import type { LoginResponse, User } from '../types';

export const authService = {
  login: async (credentials: Record<string, string>): Promise<LoginResponse> => {
    const response = await client.post<LoginResponse>('/login', credentials);
    return response.data;
  },

  logout: async (): Promise<void> => {
    await client.post('/logout');
  },

  me: async (): Promise<User> => {
    const response = await client.get<{ user: User }>('/me');
    return response.data.user;
  },
};
