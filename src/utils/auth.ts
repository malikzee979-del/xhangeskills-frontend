// Authentication utility functions
export const getAuthToken = (): string | null => {
  if (typeof window !== 'undefined') {
    // Try localStorage first (remember me), then sessionStorage
    return localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
  }
  return null;
};

export const setAuthToken = (token: string, rememberMe: boolean = false): void => {
  if (typeof window !== 'undefined') {
    if (rememberMe) {
      localStorage.setItem('authToken', token);
      localStorage.removeItem('rememberMe');
    } else {
      sessionStorage.setItem('authToken', token);
      localStorage.removeItem('rememberMe');
    }
  }
};

export const clearAuthToken = (): void => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('authToken');
    localStorage.removeItem('rememberMe');
    sessionStorage.removeItem('authToken');
  }
};

export const isAuthenticated = (): boolean => {
  return getAuthToken() !== null;
};
