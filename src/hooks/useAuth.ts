'use client';

import { useState, useEffect, useCallback } from 'react';
import { getAuthToken, clearAuthToken } from '@/utils/auth';

interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check if user is authenticated on mount
    const token = getAuthToken();
    if (token) {
      setIsAuthenticated(true);
      // Fetch user data from token or API
    }
    setLoading(false);
  }, []);

  const logout = useCallback(() => {
    clearAuthToken();
    setUser(null);
    setIsAuthenticated(false);
  }, []);

  const handleSetError = useCallback((msg: string | null) => {
    setError(msg);
  }, []);

  return {
    user,
    isAuthenticated,
    loading,
    error,
    logout,
    setError: handleSetError,
  };
}
