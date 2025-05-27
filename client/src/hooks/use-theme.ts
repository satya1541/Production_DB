
import { useState, useEffect } from 'react';

type Theme = 'light' | 'dark' | 'system';

export function useTheme() {
  const [theme, setThemeState] = useState<Theme>(() => {
    // Check localStorage first, then default to system
    const stored = localStorage.getItem('theme') as Theme;
    if (stored && ['light', 'dark', 'system'].includes(stored)) {
      return stored;
    }
    return 'system';
  });

  const getSystemTheme = (): 'light' | 'dark' => {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  };

  const getEffectiveTheme = (): 'light' | 'dark' => {
    if (theme === 'system') {
      return getSystemTheme();
    }
    return theme as 'light' | 'dark';
  };

  useEffect(() => {
    const effectiveTheme = getEffectiveTheme();
    
    // Apply theme to document
    const root = document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(effectiveTheme);
    
    // Store in localStorage
    localStorage.setItem('theme', theme);
  }, [theme]);

  useEffect(() => {
    // Listen for system theme changes when in system mode
    if (theme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleChange = () => {
        const effectiveTheme = getEffectiveTheme();
        const root = document.documentElement;
        root.classList.remove('light', 'dark');
        root.classList.add(effectiveTheme);
      };

      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
  }, [theme]);

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
  };

  const toggleTheme = () => {
    const effectiveTheme = getEffectiveTheme();
    setTheme(effectiveTheme === 'light' ? 'dark' : 'light');
  };

  return { 
    theme, 
    setTheme, 
    toggleTheme,
    effectiveTheme: getEffectiveTheme()
  };
}
