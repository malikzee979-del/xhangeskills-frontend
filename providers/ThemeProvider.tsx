'use client';

import {
  ReactNode,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import { DEFAULT_THEME, THEME_STORAGE_KEY, THEMES } from '@/lib/themes';

interface ThemeContextType {
  theme: string;
  setTheme: (id: string) => void;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: DEFAULT_THEME,
  setTheme: () => {},
});

function applyTheme(id: string) {
  if (typeof document === 'undefined') return;
  document.documentElement.setAttribute('data-theme', id);
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<string>(DEFAULT_THEME);

  // Load persisted theme on mount
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const stored = localStorage.getItem(THEME_STORAGE_KEY);
    const valid = THEMES.some((t) => t.id === stored);
    const next = valid && stored ? stored : DEFAULT_THEME;
    setThemeState(next);
    applyTheme(next);
  }, []);

  const setTheme = useCallback((id: string) => {
    if (!THEMES.some((t) => t.id === id)) return;
    setThemeState(id);
    applyTheme(id);
    if (typeof window !== 'undefined') {
      localStorage.setItem(THEME_STORAGE_KEY, id);
    }
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
