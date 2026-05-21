import { apiClient, safeRequest } from './apiClient';

export interface Profile {
  id: string;
  user: any;
  firstName?: string;
  lastName?: string;
  bio?: string;
  location?: string;
  avatar?: any;
  coverImage?: any;
  phone?: string;
  website?: string;
  socialLinks?: any;
  verificationStatus?: string;
  rating?: number;
  totalReviews?: number;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateProfileData {
  firstName?: string;
  lastName?: string;
  bio?: string;
  location?: string;
  avatar?: string;
  coverImage?: string;
  phone?: string;
  website?: string;
  socialLinks?: any;
}

export const profileApi = {
  // Get current user's profile
  async getCurrentProfile() {
    return safeRequest(apiClient.get('/profiles/me', { params: { populate: '*' } }));
  },

  // Get user profile by ID
  async getById(userId: string) {
    return safeRequest(apiClient.get('/profiles', { params: { 'filters[user][id][$eq]': userId, populate: '*' } }));
  },

  // Get all profiles
  async getAll(params?: { _q?: string; _sort?: string; _pagination?: any }) {
    return safeRequest(apiClient.get('/profiles', { params: { ...params, populate: '*' } }));
  },

  // Update profile
  async update(id: string, data: UpdateProfileData) {
    return safeRequest(apiClient.put(`/profiles/${id}`, { data }));
  },

  // Update current user's profile
  async updateCurrent(data: UpdateProfileData) {
    return safeRequest(apiClient.put('/profiles/me', { data }));
  },
};
