import { apiClient, safeRequest } from './apiClient';

// Skills Admin APIs
export const adminSkillApi = {
  async getPendingSkills() {
    return safeRequest(apiClient.get('/skills', { params: { filters: { status: { $eq: 'pending' } }, populate: '*' } }));
  },

  async approveSkill(id: string) {
    return safeRequest(apiClient.put(`/skills/${id}/approve`));
  },

  async rejectSkill(id: string, reason: string) {
    return safeRequest(apiClient.put(`/skills/${id}/reject`, { data: { reason } }));
  },
};

// Categories Admin APIs
export const adminCategoryApi = {
  async getAll() {
    return safeRequest(apiClient.get('/categories', { params: { populate: '*' } }));
  },

  async create(data: { name: string; description?: string }) {
    return safeRequest(apiClient.post('/categories', { data }));
  },

  async update(id: string, data: { name?: string; description?: string }) {
    return safeRequest(apiClient.put(`/categories/${id}`, { data }));
  },

  async delete(id: string) {
    return safeRequest(apiClient.delete(`/categories/${id}`));
  },
};

// Base Skills Admin APIs
export const adminBaseSkillApi = {
  async getAll() {
    return safeRequest(apiClient.get('/base-skills', { params: { populate: '*' } }));
  },

  async create(data: { name: string; description?: string }) {
    return safeRequest(apiClient.post('/base-skills', { data }));
  },

  async update(id: string, data: { name?: string; description?: string }) {
    return safeRequest(apiClient.put(`/base-skills/${id}`, { data }));
  },

  async delete(id: string) {
    return safeRequest(apiClient.delete(`/base-skills/${id}`));
  },
};

// Reports Admin APIs
export const adminReportApi = {
  async getAll() {
    return safeRequest(apiClient.get('/reports', { params: { populate: '*' } }));
  },

  async updateStatus(id: string, status: string) {
    return safeRequest(apiClient.put(`/reports/${id}/status`, { data: { status } }));
  },
};
