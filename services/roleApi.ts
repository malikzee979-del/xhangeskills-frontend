import { apiClient, safeRequest } from './apiClient';
export interface Role {
  id: string;
  name: string;
  description?: string;
  permissions?: any[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateRoleData {
  name: string;
  description?: string;
  permissions?: string[];
}

export const roleApi = {
  // Get all roles
  async getAll(params?: { _q?: string; _sort?: string; _pagination?: any }) {
    return safeRequest(apiClient.get('/roles', { params: { ...params, populate: '*' } }));
  },

  // Get single role
  async getById(id: string) {
    return safeRequest(apiClient.get(`/roles/${id}`, { params: { populate: '*' } }));
  },

  // Create role (admin only)
  async create(data: CreateRoleData) {
    return safeRequest(apiClient.post('/roles', { data }));
  },

  // Update role (admin only)
  async update(id: string, data: Partial<CreateRoleData>) {
    return safeRequest(apiClient.put(`/roles/${id}`, { data }));
  },

  // Delete role (admin only)
  async delete(id: string) {
    return safeRequest(apiClient.delete(`/roles/${id}`));
  },
};
