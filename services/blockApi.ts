import { apiClient, safeRequest } from './apiClient';

export interface Block {
  id: string;
  blocker: any;
  blocked: any;
  reason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateBlockData {
  blocked: string;
  reason?: string;
}

export const blockApi = {
  // Get all blocks for current user
  async getAll(params?: { _q?: string; _sort?: string; _pagination?: any }) {
    return safeRequest(apiClient.get('/blocks', { params: { ...params, populate: '*' } }));
  },

  // Get single block
  async getById(id: string) {
    return safeRequest(apiClient.get(`/blocks/${id}`, { params: { populate: '*' } }));
  },

  // Check if a user is blocked
  async isBlocked(userId: string) {
    return safeRequest(apiClient.get('/blocks', { params: { 'filters[blocked][id][$eq]': userId, populate: '*' } }));
  },

  // Block a user
  async create(data: CreateBlockData) {
    return safeRequest(apiClient.post('/blocks', { data }));
  },

  // Unblock a user
  async delete(id: string) {
    return safeRequest(apiClient.delete(`/blocks/${id}`));
  },
};
