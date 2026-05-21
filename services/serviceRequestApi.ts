import { apiClient, safeRequest } from './apiClient';

export interface ServiceRequest {
  id: string;
  skill: any;
  requester: any;
  status: 'pending' | 'accepted' | 'rejected' | 'completed';
  requestDetails: string;
  createdAt: string;
  chat?: any;
}

export interface CreateServiceRequestData {
  skill: string;
  requestDetails: string;
  serviceMode: 'REMOTE' | 'ONSITE' | 'HYBRID';
  duration: number;
  serviceLocation?: string;
  requestedTime?: string;
}

export const serviceRequestApi = {
  // Get all requests for current user
  async getAll(filters?: { status?: string; type?: string }) {
    const fallback = { data: [] };
    return safeRequest(
      apiClient.get('/service-requests', {
        params: {
          ...filters,
          populate: '*',
        },
      }),
      fallback
    );
  },

  // Get single request
  async getOne(id: string) {
    return safeRequest(
      apiClient.get(`/service-requests/${id}`, {
        params: { populate: '*' },
      }),
      null as any
    );
  },

  // Create booking request
  async create(data: CreateServiceRequestData) {
    return safeRequest(apiClient.post('/service-requests', { data }));
  },

  // Accept request
  async accept(id: string) {
    return safeRequest(
      apiClient.put(`/service-requests/${id}`, {
        data: { status: 'accepted' },
      })
    );
  },

  // Reject request
  async reject(id: string, reason?: string) {
    return safeRequest(
      apiClient.put(`/service-requests/${id}`, {
        data: { status: 'rejected', rejectionReason: reason },
      })
    );
  },
  // Complete request
  async complete(id: string) {
    return safeRequest(
      apiClient.put(`/service-requests/${id}`, {
        data: { status: 'completed' },
      })
    );
  },

  // Get received requests
  async getReceived() {
    const fallback = { data: [] };
    return safeRequest(
      apiClient.get('/service-requests', {
        params: {
          type: 'received',
          populate: '*',
        },
      }),
      fallback
    );
  },

  // Get sent requests
  async getSent() {
    const fallback = { data: [] };
    return safeRequest(
      apiClient.get('/service-requests', {
        params: {
          type: 'sent',
          populate: '*',
        },
      }),
      fallback
    );
  },
};
