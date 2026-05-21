'use client';

import { ReactNode } from 'react';
import { AuthProvider } from '@/providers/AuthProvider';

export default function RootLayoutClient({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      {children}
    </AuthProvider>
  );
}
