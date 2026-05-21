import { apiClient, safeRequest } from './apiClient';

export interface Notification {
  id: string;
  type: 'request' | 'review' | 'message' | 'system';
  title: string;
  message: string;
  isRead: boolean;
  actionLink?: string;
  createdAt: string;
}

export const notificationApi = {
  async getAll(): Promise<{ data: Notification[] }> {
    return safeRequest(apiClient.get('/notifications'), { data: [] }) as any;
  },

  async markAsRead(id: string) {
    return safeRequest(apiClient.post(`/notifications/${id}/read`));
  },

  async markAllAsRead() {
    return safeRequest(apiClient.post('/notifications/read-all'));
  },

  async delete(id: string) {
    return safeRequest(apiClient.delete(`/notifications/${id}`));
  },
};
