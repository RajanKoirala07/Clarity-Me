import React, { createContext, useContext, useEffect, useState } from 'react';
import { useColorScheme } from 'react-native';
import { getItem, setItem } from '@/services/storage';

export type ThemeMode = 'light' | 'dark' | 'system';

export interface ThemeColors {
  // Backgrounds
  background: string;
  surface: string;
  card: string;
  cardAlt: string;
  // Text
  text: string;
  textSecondary: string;
  textMuted: string;
  // Primary accent
  teal: string;
  tealDark: string;
  tealLight: string;
  // Tab bar
  tabBar: string;
  tabBorder: string;
  // Borders & dividers
  border: string;
  borderLight: string;
  // Inputs
  inputBg: string;
  inputBorder: string;
  inputText: string;
  placeholder: string;
  // Action buttons
  cancelBg: string;
  cancelText: string;
  // Danger
  danger: string;
}

const lightColors: ThemeColors = {
  background: '#ffffff',
  surface: '#F9FAFB',
  card: '#E6FAF5',
  cardAlt: '#D6EEEC',
  text: '#1F2937',
  textSecondary: '#374151',
  textMuted: '#6B7280',
  teal: '#0D9488',
  tealDark: '#0F766E',
  tealLight: '#E6FAF5',
  tabBar: '#FFFFFF',
  tabBorder: '#E5E7EB',
  border: '#E5E7EB',
  borderLight: '#F3F4F6',
  inputBg: '#F9FAFB',
  inputBorder: '#E5E7EB',
  inputText: '#1F2937',
  placeholder: '#9CA3AF',
  cancelBg: '#F3F4F6',
  cancelText: '#6B7280',
  danger: '#EF4444',
};

const darkColors: ThemeColors = {
  background: '#0F1117',
  surface: '#1A1D27',
  card: '#1E3230',
  cardAlt: '#1A2E2C',
  text: '#F9FAFB',
  textSecondary: '#E5E7EB',
  textMuted: '#9CA3AF',
  teal: '#14B8A6',
  tealDark: '#0D9488',
  tealLight: '#1C3533',
  tabBar: '#161B22',
  tabBorder: '#2D3748',
  border: '#2D3748',
  borderLight: '#1F2937',
  inputBg: '#1F2937',
  inputBorder: '#374151',
  inputText: '#F9FAFB',
  placeholder: '#6B7280',
  cancelBg: '#1F2937',
  cancelText: '#9CA3AF',
  danger: '#F87171',
};

interface ThemeContextValue {
  isDark: boolean;
  themeMode: ThemeMode;
  colors: ThemeColors;
  toggleTheme: () => void;
  setThemeMode: (mode: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  isDark: false,
  themeMode: 'system',
  colors: lightColors,
  toggleTheme: () => {},
  setThemeMode: () => {},
});

const STORAGE_KEY = 'app_theme_mode';

export function AppThemeProvider({ children }: { children: React.ReactNode }) {
  const systemScheme = useColorScheme();
  const [themeMode, setThemeModeState] = useState<ThemeMode>('system');
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    getItem(STORAGE_KEY)
      .then((saved) => {
        if (saved === 'light' || saved === 'dark' || saved === 'system') {
          setThemeModeState(saved);
        }
      })
      .catch(() => {})
      .finally(() => setLoaded(true));
  }, []);

  const isDark =
    themeMode === 'system' ? systemScheme === 'dark' : themeMode === 'dark';

  const setThemeMode = (mode: ThemeMode) => {
    setThemeModeState(mode);
    setItem(STORAGE_KEY, mode).catch(() => {});
  };

  const toggleTheme = () => {
    setThemeModeState((prev) => {
      const currentIsDark =
        prev === 'system' ? systemScheme === 'dark' : prev === 'dark';
      const next: ThemeMode = currentIsDark ? 'light' : 'dark';
      setItem(STORAGE_KEY, next).catch(() => {});
      return next;
    });
  };

  const colors = isDark ? darkColors : lightColors;

  if (!loaded) return null;

  return (
    <ThemeContext.Provider value={{ isDark, themeMode, colors, toggleTheme, setThemeMode }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useAppTheme() {
  return useContext(ThemeContext);
}
