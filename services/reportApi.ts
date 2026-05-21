import { apiClient, safeRequest } from './apiClient';
export interface Report {
  id: string;
  reporter: any;
  reportedUser: any;
  reason: string;
  status: 'pending' | 'resolved' | 'dismissed';
  createdAt: string;
}

export interface CreateReportData {
  reportedUserId: string;
  reason: string;
  description?: string;
  reportType?: string;
}

export const reportApi = {
  // Get all reports (admin only)
  async getAll(filters?: { status?: string; type?: string }) {
    return safeRequest(apiClient.get('/reports', { params: { ...filters, populate: '*' } }));
  },

  // Report a user
  async create(data: CreateReportData) {
    return safeRequest(apiClient.post('/reports', { data }));
  },

  // Update report status (admin only)
  async updateStatus(id: string, status: string, action?: string) {
    return safeRequest(apiClient.put(`/reports/${id}/status`, { status, action }));
  },
};
