import { apiClient, safeRequest } from './apiClient';

export interface Category {
  id: string;
  name: string;
  slug?: string;
  description?: string;
  icon?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCategoryData {
  name: string;
  slug?: string;
  description?: string;
  icon?: string;
}

export const categoryApi = {
  // Get all categories
  async getAll(params?: { _q?: string; _sort?: string; _pagination?: any }) {
    const fallback = { data: [] };
    return safeRequest(
      apiClient.get('/categories', {
        params: { ...params, populate: '*' },
      }),
      fallback
    );
  },

  // Get single category
  async getById(id: string) {
    return safeRequest(
      apiClient.get(`/categories/${id}`, {
        params: { populate: '*' },
      }),
      null as any
    );
  },

  // Get category by slug
  async getBySlug(slug: string) {
    const fallback = { data: [] };
    return safeRequest(
      apiClient.get('/categories', {
        params: { 'filters[slug][$eq]': slug, populate: '*' },
      }),
      fallback
    );
  },

  // Create category
  async create(data: CreateCategoryData) {
    return safeRequest(apiClient.post('/categories', { data }));
  },

  // Update category
  async update(id: string, data: Partial<CreateCategoryData>) {
    return safeRequest(apiClient.put(`/categories/${id}`, { data }));
  },

  // Delete category
  async delete(id: string) {
    return safeRequest(apiClient.delete(`/categories/${id}`));
  },
};
