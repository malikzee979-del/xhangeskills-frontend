import { apiClient, safeRequest } from './apiClient';
export interface Review {
  id: string;
  rating: number;
  comment: string;
  reviewer: any;
  skill: any;
  createdAt: string;
}

export interface CreateReviewData {
  skill: string;
  rating: number;
  comment: string;
  serviceRequest?: string;
}

export const reviewApi = {
  // Get all reviews - accepts any filter params (e.g. filters[reviewee][id][$eq])
  async getAll(filters?: Record<string, any>) {
    const fallback = { data: [] };
    return safeRequest(
      apiClient.get('/reviews', { params: { ...filters, populate: '*' } }),
      fallback
    );
  },

  // Get reviews for a skill
  async getBySkill(skillId: string) {
    return safeRequest(apiClient.get('/reviews', { params: { skill: skillId, populate: '*' } }));
  },

  // Get user's average rating
  async getUserRating(userId: string) {
    return safeRequest(apiClient.get(`/reviews/user/${userId}/rating`));
  },

  // Create review
  async create(data: CreateReviewData) {
    return safeRequest(apiClient.post('/reviews', { data }));
  },

  // Update review
  async update(id: string, data: Partial<CreateReviewData>) {
    return safeRequest(apiClient.put(`/reviews/${id}`, { data }));
  },

  // Delete review
  async delete(id: string) {
    return safeRequest(apiClient.delete(`/reviews/${id}`));
  },
};
