import client from '../api/client';
import type { Permission } from '../types';

export const permissionService = {
  getPermissions: async (): Promise<Permission[]> => {
    const response = await client.get<{ data: Permission[] }>('/permissions');
    return response.data.data;
  },
};
