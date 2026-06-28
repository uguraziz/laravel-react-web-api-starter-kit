import client from '../api/client';
import type { PaginatedResponse, User, UserQueryParams } from '../types';

export const userService = {
  getUsers: async (params?: UserQueryParams): Promise<PaginatedResponse<User>> => {
    const response = await client.get<PaginatedResponse<User>>('/users', { params });
    return response.data;
  },

  createUser: async (data: Omit<User, 'id' | 'created_at' | 'updated_at'> & { password?: string }): Promise<User> => {
    const response = await client.post<User>('/users', data);
    return response.data;
  },

  updateUser: async (id: number, data: Partial<User> & { password?: string }): Promise<User> => {
    const response = await client.put<User>(`/users/${id}`, data);
    return response.data;
  },

  deleteUser: async (id: number): Promise<void> => {
    await client.delete(`/users/${id}`);
  },
};
