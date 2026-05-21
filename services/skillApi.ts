import { apiClient, safeRequest, ApiError } from './apiClient';
import axios from 'axios';

export interface Skill {
  id: string;
  title: string;
  description: string;
  category?: { id: string; name: string };
  baseSkill?: { id: string; name: string };
  user: { id: string; username: string; email: string; displayName?: string };
  coverImageUrl?: string;
  status: 'pending' | 'approved' | 'rejected';
  rejectionReason?: string;
  proposedCategoryName?: string;
  proposedBaseSkillName?: string;
  createdAt: string;
}

export interface CreateSkillData {
  title: string;
  description: string;
  category?: string;
  baseSkill?: string;
  coverImageUrl?: string;
  proposedCategoryName?: string;
  proposedBaseSkillName?: string;
}

export const skillApi = {
  // Get all skills with filters
  async getAll(params?: { _q?: string; category?: string; location?: string }) {
    const fallback = { data: [] };
    return safeRequest(
      apiClient.get('/skills', {
        params: { ...params, populate: '*' },
      }),
      fallback
    );
  },

  // Get skills belonging to the currently authenticated user
  async getMe(params?: object) {
    const fallback = { data: [] };
    const result: any = await safeRequest(
      apiClient.get('/skills/me', {
        params: { populate: '*', ...params },
      }),
      fallback
    );

    // custom endpoint may return data array directly or { data: [...] }
    if (result && Array.isArray(result)) {
      return { data: result };
    }
    return result || { data: [] };
  },

  // Get single skill
  async getOne(id: string) {
    // treat 404 as null rather than throwing
    return safeRequest(
      apiClient.get(`/skills/${id}`, {
        params: { populate: '*' },
      }),
      null as any
    );
  },

  // Create new skill
  async create(data: CreateSkillData) {
    return safeRequest(apiClient.post('/skills', { data }));
  },

  // Update skill
  async update(id: string, data: Partial<CreateSkillData>) {
    return safeRequest(apiClient.put(`/skills/${id}`, { data }));
  },

  // Delete skill
  async delete(id: string) {
    return safeRequest(apiClient.delete(`/skills/${id}`));
  },

  // Search skills
  async search(query: string) {
    const fallback = { data: [] };
    return safeRequest(
      apiClient.get('/skills', {
        params: {
          _q: query,
          populate: '*',
        },
      }),
      fallback
    );
  },

  // Admin: Approve a pending skill
  async approve(id: string) {
    return safeRequest(apiClient.put(`/skills/${id}/approve`));
  },

  // Admin: Reject a pending skill
  async reject(id: string, reason?: string) {
    return safeRequest(apiClient.put(`/skills/${id}/reject`, { reason }));
  },
};
