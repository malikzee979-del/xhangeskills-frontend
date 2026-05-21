import { apiClient, safeRequest } from './apiClient';

export interface Message {
  id: string;
  chat: any;
  sender: any;
  content: string;
  attachments?: any[];
  isEdited?: boolean;
  editedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateMessageData {
  chat: string;
  sender: string;
  content: string;
  attachments?: any[];
}

export const messageApi = {
  // Get all messages for a chat
  async getByChatId(chatId: string, params?: { _pagination?: any; _sort?: string }) {
    return safeRequest(apiClient.get('/messages', { params: { 'filters[chat][id][$eq]': chatId, populate: '*', ...params } }));
  },

  // Get single message
  async getById(id: string) {
    return safeRequest(apiClient.get(`/messages/${id}`, { params: { populate: '*' } }));
  },

  // Send a message
  async create(data: CreateMessageData) {
    return safeRequest(apiClient.post('/messages', { data }));
  },

  // Edit a message
  async update(id: string, content: string) {
    return safeRequest(apiClient.put(`/messages/${id}`, { data: { content, isEdited: true, editedAt: new Date().toISOString() } }));
  },

  // Delete a message
  async delete(id: string) {
    return safeRequest(apiClient.delete(`/messages/${id}`));
  },
};
