import { apiClient, safeRequest } from './apiClient';

export interface Chat {
  id: string;
  participants: any[];
  messages: any[];
  serviceRequest?: any;
  createdAt: string;
  updatedAt: string;
}

export interface Message {
  id: string;
  chat: string;
  sender: any;
  recipient: any;
  content: string;
  isRead: boolean;
  createdAt: string;
}

export interface CreateMessageData {
  chat: string;
  recipientId: string;
  content: string;
}

export const chatApi = {
  // Get user's chat list
  async getChats(params?: { _pagination?: any; _sort?: string }) {
    return safeRequest(apiClient.get('/chats', { params: { populate: '*', ...params } }));
  },

  // Get single chat with messages
  async getChat(id: string) {
    return safeRequest(apiClient.get(`/chats/${id}`, { params: { populate: '*' } }));
  },

  // Create a new chat
  async create(participantIds: string[]) {
    return safeRequest(apiClient.post('/chats', { data: { participants: participantIds } }));
  },

  // Create or get chat between two users
  async createOrGetChat(otherUserId: string) {
    return safeRequest(apiClient.post('/chats/find-or-create', { data: { otherUserId } }));
  },

  // Get messages for a chat
  async getMessages(chatId: string, params?: { _pagination?: any; _sort?: string }) {
    return safeRequest(apiClient.get('/messages', { params: { 'filters[chat][id][$eq]': chatId, populate: '*', ...params } }));
  },

  // Send message
  async sendMessage(data: CreateMessageData) {
    return safeRequest(apiClient.post('/messages', { data }));
  },

  // Mark a single message as read
  async markAsRead(messageId: string) {
    return safeRequest(apiClient.put(`/messages/${messageId}/read`));
  },

  // Mark all messages in a chat as read for the current user
  async markChatAsRead(chatId: string) {
    return safeRequest(apiClient.put(`/chats/${chatId}/read-messages`));
  },

  // Get unread message count
  async getUnreadCount() {
    return safeRequest(apiClient.get('/messages/unread-count'));
  },
};
