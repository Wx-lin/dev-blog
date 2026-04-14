import { theme as antdTheme, ConfigProvider } from 'antd';
import { createContext, useCallback, useContext, useMemo, useState } from 'react';

const STORAGE_KEY = 'admin-theme';

interface ThemeCtx {
  isDark: boolean;
  toggleTheme: () => void;
}

export const ThemeContext = createContext<ThemeCtx>({
  isDark: false,
  toggleTheme: () => {},
});

export function useTheme() {
  return useContext(ThemeContext);
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [isDark, setIsDark] = useState<boolean>(() => {
    try {
      return localStorage.getItem(STORAGE_KEY) === 'dark';
    } catch {
      return false;
    }
  });

  const toggleTheme = useCallback(() => {
    setIsDark((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(STORAGE_KEY, next ? 'dark' : 'light');
      } catch {}
      return next;
    });
  }, []);

  const ctx = useMemo(() => ({ isDark, toggleTheme }), [isDark, toggleTheme]);

  return (
    <ThemeContext.Provider value={ctx}>
      <ConfigProvider
        theme={{
          algorithm: isDark ? antdTheme.darkAlgorithm : antdTheme.defaultAlgorithm,
          token: {
            colorPrimary: '#6366f1',
            colorLink: '#6366f1',
            colorLinkHover: '#818cf8',
            borderRadius: 8,
            fontSize: 14,
          },
        }}
      >
        {children}
      </ConfigProvider>
    </ThemeContext.Provider>
  );
}
