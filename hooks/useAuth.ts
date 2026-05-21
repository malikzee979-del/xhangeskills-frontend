'use client';

import { useContext } from 'react';
import { AuthContext, AuthContextType, User } from '@/providers/AuthProvider';

export type { User, AuthContextType };

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  return context as AuthContextType;
}

