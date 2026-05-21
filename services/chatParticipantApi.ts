import { apiClient, safeRequest } from './apiClient';

export interface ChatParticipant {
  id: string;
  chat: any;
  user: any;
  joinedAt: string;
  lastReadAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateChatParticipantData {
  chat: string;
  user: string;
}

export const chatParticipantApi = {
  // Get all participants for a chat
  async getByChatId(chatId: string, params?: any) {
    return safeRequest(apiClient.get('/chat-participants', { params: { 'filters[chat][id][$eq]': chatId, populate: '*', ...params } }));
  },

  // Get single participant
  async getById(id: string) {
    return safeRequest(apiClient.get(`/chat-participants/${id}`, { params: { populate: '*' } }));
  },

  // Add participant to chat
  async create(data: CreateChatParticipantData) {
    return safeRequest(apiClient.post('/chat-participants', { data }));
  },

  // Update participant (e.g., lastReadAt)
  async update(id: string, data: Partial<CreateChatParticipantData>) {
    return safeRequest(apiClient.put(`/chat-participants/${id}`, { data }));
  },

  // Remove participant from chat
  async delete(id: string) {
    return safeRequest(apiClient.delete(`/chat-participants/${id}`));
  },
};
