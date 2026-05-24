'use client';

import { ReactNode } from 'react';
import { AuthProvider } from '@/providers/AuthProvider';
import { ThemeProvider } from '@/providers/ThemeProvider';
import ThemeSwitcher from '@/components/ThemeSwitcher';

export default function RootLayoutClient({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      <AuthProvider>
        {children}
        <ThemeSwitcher />
      </AuthProvider>
    </ThemeProvider>
  );
}
