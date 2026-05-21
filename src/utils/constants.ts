// Application constants
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export const ROUTES = {
  LOGIN: '/login',
  REGISTER: '/register',
  PROFILE: '/profile',
  SKILLS: '/skills',
  SERVICE_REQUESTS: '/service-requests',
  REVIEWS: '/reviews',
  REPORTS: '/reports',
};

export const LOCAL_STORAGE_KEYS = {
  AUTH_TOKEN: 'authToken',
  USER_DATA: 'userData',
};
