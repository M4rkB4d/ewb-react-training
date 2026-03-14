// src/hooks/use-theme.ts
import { useState, useEffect } from 'react';

type Theme = 'light' | 'dark' | 'system';

export function useTheme() {
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window === 'undefined') return 'system';
    return (localStorage.getItem('ewb-theme') as Theme) ?? 'system';
  });

  useEffect(() => {
    const root = document.documentElement;

    if (theme === 'system') {
      const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      root.classList.toggle('dark', systemDark);
    } else {
      root.classList.toggle('dark', theme === 'dark');
    }

    localStorage.setItem('ewb-theme', theme);
  }, [theme]);

  return { theme, setTheme };
}
