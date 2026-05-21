"use client";

import {
  ReactNode,
  createContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { authApi } from "@/services/authApi";
import { getErrorMessage } from "@/services/errorUtils";

export interface User {
  id: string;
  email: string;
  username: string;
  displayName?: string;
  avatar?: string;
  firstName?: string;
  lastName?: string;
  location?: string;
  profile?: any;
}

export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
  login: (
    email: string,
    password: string,
    rememberMe?: boolean,
  ) => Promise<void>;
  signup: (
    email: string,
    password: string,
    firstName?: string,
    lastName?: string,
  ) => Promise<void>;
  logout: () => void;
  setError: (error: string | null) => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined,
);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load user on mount
  useEffect(() => {
    const loadUser = async () => {
      try {
        // Try localStorage first (remember me), then sessionStorage
        let token =
          typeof window !== "undefined"
            ? localStorage.getItem("authToken")
            : null;
        if (!token && typeof window !== "undefined") {
          token = sessionStorage.getItem("authToken");
        }

        if (token) {
          // Verify token with backend
          const currentUser = await authApi.getCurrentUser();
          setUser(currentUser);
          setIsAuthenticated(true);
        } else {
          setIsAuthenticated(false);
          setUser(null);
        }
      } catch (err) {
        if (typeof window !== "undefined") {
          localStorage.removeItem("authToken");
          sessionStorage.removeItem("authToken");
          localStorage.removeItem("rememberMe");
        }
        setIsAuthenticated(false);
        setUser(null);
        // Token was present but rejected by the server — redirect to login
        if (typeof window !== "undefined" && window.location.pathname !== "/login") {
          window.location.href = "/login";
          return;
        }
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  const login = useCallback(
    async (email: string, password: string, rememberMe: boolean = false) => {
      setError(null);
      setLoading(true);
      try {
        const response = await authApi.login({ email, password }, rememberMe);

        if (response && response.user) {
          setUser(response.user);
          setIsAuthenticated(true);
        } else {
          setError("Login response missing user data");
          setIsAuthenticated(false);
        }
      } catch (err: any) {
        const errorMessage = getErrorMessage(err) || "Login failed";
        setError(errorMessage);
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  const signup = useCallback(
    async (
      email: string,
      password: string,
      firstName?: string,
      lastName?: string,
    ) => {
      setError(null);
      setLoading(true);
      try {
        const response = await authApi.signup({
          email,
          password,
          firstName,
          lastName,
        });

        if (response && response.user) {
          setUser(response.user);
          setIsAuthenticated(true);
        } else {
          setError("Signup response missing user data");
          setIsAuthenticated(false);
        }
      } catch (err: any) {
        const errorMessage = getErrorMessage(err) || "Signup failed";
        setError(errorMessage);
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  const logout = useCallback(() => {
    authApi.logout();
    setUser(null);
    setIsAuthenticated(false);
    setError(null);
  }, []);

  const value: AuthContextType = {
    user,
    isAuthenticated,
    loading,
    error,
    login,
    signup,
    logout,
    setError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
