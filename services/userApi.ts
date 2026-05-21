import { apiClient, safeRequest } from './apiClient';

export interface UserProfile {
  id: string;
  bio: string;
  location: string;
  phoneNumber: string;
  profileImage?: string;
  user: any;
  skills?: any[];
  reviews?: any[];
}

export interface UpdateProfileData {
  bio?: string;
  location?: string;
  phoneNumber?: string;
  profileImage?: string;
  socialLinks?: any;
}

export const userApi = {
  // Get current user profile
  async getMe() {
    return safeRequest(apiClient.get('/profile/me', { params: { populate: '*' } }));
  },

  // Get profile by ID
  async getProfile(id: string) {
    return safeRequest(apiClient.get(`/profile/${id}`, { params: { populate: '*' } }));
  },

  // Get profile by username
  async getByUsername(username: string) {
    return safeRequest(apiClient.get(`/profile/user/${username}`, { params: { populate: '*' } }));
  },

  // Update profile
  async updateProfile(data: UpdateProfileData) {
    return safeRequest(apiClient.put('/profiles/me', { data }));
  },

  // Block user
  async blockUser(userId: string, reason?: string) {
    return safeRequest(apiClient.post('/blocks', { data: { blocked: userId, reason } }));
  },

  // Unblock user
  async unblockUser(blockId: string) {
    return safeRequest(apiClient.delete(`/blocks/${blockId}`));
  },

  // Get blocked users
  async getBlockedUsers() {
    return safeRequest(apiClient.get('/blocks', { params: { populate: '*' } }));
  },
};
