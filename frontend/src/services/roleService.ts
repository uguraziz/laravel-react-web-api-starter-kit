import client from '../api/client';
import type { Role } from '../types';

export const roleService = {
  getRoles: async (): Promise<Role[]> => {
    const response = await client.get<{ data: Role[] }>('/roles');
    return response.data.data;
  },

  getRole: async (id: number): Promise<Role> => {
    const response = await client.get<{ data: Role }>(`/roles/${id}`);
    return response.data.data;
  },

  createRole: async (data: { name: string; permissions: string[] }): Promise<Role> => {
    const response = await client.post<Role>('/roles', data);
    return response.data;
  },

  updateRole: async (id: number, data: { name: string; permissions: string[] }): Promise<Role> => {
    const response = await client.put<Role>(`/roles/${id}`, data);
    return response.data;
  },

  deleteRole: async (id: number): Promise<void> => {
    await client.delete(`/roles/${id}`);
  },
};
