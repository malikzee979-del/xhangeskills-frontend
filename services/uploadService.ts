import { apiClient } from './apiClient';

export const uploadService = {
  async uploadFile(file: File): Promise<string | null> {
    const formData = new FormData();
    formData.append('files', file);

    // Use our custom /media/upload route (config: {} = authenticated) instead of
    // Strapi's built-in /upload which requires admin-panel permission grants.
    // Do NOT set Content-Type — Axios detects FormData and adds the correct
    // multipart/form-data; boundary=... automatically.
    const response = await (apiClient as any).post('/media/upload', formData, {
      headers: { 'Content-Type': undefined },
    });

    const data = (response as any).data ?? response;
    const files = Array.isArray(data) ? data : Array.isArray(data?.data) ? data.data : [];

    if (files.length > 0 && files[0].url) {
      return files[0].url;
    }
    return null;
  },

  validateImageFile(file: File): { valid: boolean; error?: string } {
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    const maxSize = 5 * 1024 * 1024; // 5 MB

    if (!validTypes.includes(file.type)) {
      return { valid: false, error: 'Please upload a valid image (JPEG, PNG, WebP, or GIF)' };
    }
    if (file.size > maxSize) {
      return { valid: false, error: 'Image size must be less than 5MB' };
    }
    return { valid: true };
  },
};
