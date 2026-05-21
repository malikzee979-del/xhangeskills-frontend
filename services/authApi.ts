import { Currency } from 'lucide-react';
import { apiClient, safeRequest } from './apiClient';
import { profileApi } from './profileApi';

export function storeUserLocally(user: any, rememberMe: boolean = false) {
  if (typeof window === 'undefined' || !user) return;
  const storage = rememberMe ? localStorage : sessionStorage;
  if (user.id) storage.setItem('userId', String(user.id));
  const name = user.displayName || user.username || user.email || '';
  storage.setItem('userDisplayName', name);
  storage.setItem('userAvatar', user.avatar || '');
  storage.setItem('userUsername', user.username || '');
}

export function clearUserLocally() {
  if (typeof window === 'undefined') return;
  const keys = ['userId', 'userDisplayName', 'userAvatar', 'userUsername'];
  keys.forEach((k) => {
    localStorage.removeItem(k);
    sessionStorage.removeItem(k);
  });
}

export function getStoredUser() {
  if (typeof window === 'undefined') return null;
  // Try localStorage first (remember me), then sessionStorage
  const id = localStorage.getItem('userId') || sessionStorage.getItem('userId');
  if (!id) return null;
  return {
    id,
    displayName: localStorage.getItem('userDisplayName') || sessionStorage.getItem('userDisplayName') || '',
    avatar: localStorage.getItem('userAvatar') || sessionStorage.getItem('userAvatar') || '',
    username: localStorage.getItem('userUsername') || sessionStorage.getItem('userUsername') || '',
  };
}

interface LoginCredentials {
  email: string;
  password: string;
}

interface RegisterCredentials {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
}

export const authApi = {
  // Sign up new user
  async signup(credentials: RegisterCredentials): Promise<any> {
    return safeRequest(apiClient.post('/auth/signup', credentials));
  },

  // Login user
  async login(credentials: LoginCredentials, rememberMe: boolean = false): Promise<any> {
    const response: any = await safeRequest(
      apiClient.post('/auth/login', {
        identifier: credentials.email,
        password: credentials.password,
      })
    );

    if (typeof window !== 'undefined') {
      // Save token to storage
      if (response.jwt) {
        const storage = rememberMe ? localStorage : sessionStorage;
        storage.setItem('authToken', response.jwt);
        if (rememberMe) {
          localStorage.setItem('rememberMe', 'true');
        } else {
          localStorage.removeItem('rememberMe');
        }
      }
      
      // Save user data to storage
      if (response.user) {
        // api call to profile/me to get profile picture to save this in storage as well
        const currentUser = await profileApi.getCurrentProfile()
        if (currentUser) 
          response.user.avatar = currentUser.data.profilePicUrl;
        storeUserLocally(response.user, rememberMe);
      }
    }
    return response;
  },

  // Forgot password
  async forgotPassword(email: string): Promise<any> {
    return safeRequest(apiClient.post('/auth/forgot-password', { email }));
  },

  // Reset password
  async resetPassword(code: string, password: string): Promise<any> {
    return safeRequest(
      apiClient.post('/auth/reset-password', {
        code,
        password,
      })
    );
  },

  // Change password
  async changePassword(
    currentPassword: string,
    newPassword: string,
    confirmPassword: string
  ): Promise<any> {
    return safeRequest(
      apiClient.post('/auth/change-password', {
        currentPassword,
        newPassword,
        confirmPassword,
      })
    );
  },

  // Verify email from link token
  async verifyEmail(token: string): Promise<any> {
    const response: any = await safeRequest(
      apiClient.get(`/auth/verify-email?token=${encodeURIComponent(token)}`)
    );
    if (typeof window !== 'undefined') {
      const rememberMe = localStorage.getItem('rememberMe') === 'true';
      if (response.jwt) {
        if (rememberMe) {
          localStorage.setItem('authToken', response.jwt);
        } else {
          sessionStorage.setItem('authToken', response.jwt);
        }
      }
      if (response.user) storeUserLocally(response.user, rememberMe);
    }
    return response;
  },

  // Logout - completely clear storage
  logout(): void {
    if (typeof window === 'undefined') return;
    localStorage.clear();
    sessionStorage.clear();
  },

  // Get current user
  async getCurrentUser(): Promise<any> {
    const result: any = await safeRequest(apiClient.get('/auth/me'));
    // /auth/me returns the user object directly (not nested)
    const user = result?.id ? result : result?.data?.user || result;
    if (user && typeof window !== 'undefined') {
      const rememberMe = localStorage.getItem('rememberMe') === 'true';
      storeUserLocally(user, rememberMe);
    }
    return user;
  },
};

