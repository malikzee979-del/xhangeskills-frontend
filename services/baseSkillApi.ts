import { apiClient, safeRequest } from './apiClient';
export interface BaseSkill {
  id: string | number;
  name: string;
  description?: string;
  category?: any;
  createdAt?: string;
  updatedAt?: string;
}

export const baseSkillApi = {
  getAll: async (params?: any) => {
    return safeRequest(apiClient.get('/base-skills', { params }));
  },

  getOne: async (id: string) => {
    return safeRequest(apiClient.get(`/base-skills/${id}`));
  },

  create: async (data: Partial<BaseSkill>) => {
    return safeRequest(apiClient.post('/base-skills', { data }));
  },

  update: async (id: string, data: Partial<BaseSkill>) => {
    return safeRequest(apiClient.put(`/base-skills/${id}`, { data }));
  },

  delete: async (id: string) => {
    return safeRequest(apiClient.delete(`/base-skills/${id}`));
  },

  search: async (query: string) => {
    return safeRequest(apiClient.get('/base-skills', { params: { _q: query } }));
  },
};
