import { ColorSchemeName } from 'react-native';

export interface ThemeColors {
  background: string;
  surface: string;
  surfaceSubtle: string;
  textPrimary: string;
  textMuted: string;
  border: string;
  accent: string;
  accentText: string;
  danger: string;
}

export const lightTheme: ThemeColors = {
  background: '#FAF9F6',
  surface: '#FFFFFF',
  surfaceSubtle: '#F2F0EB',
  textPrimary: '#18181B',
  textMuted: '#71717A',
  border: '#E4E4E7',
  accent: '#18181B',
  accentText: '#FAF9F6',
  danger: '#DC2626',
};

export const darkTheme: ThemeColors = {
  background: '#121212',
  surface: '#1C1C1E',
  surfaceSubtle: '#262629',
  textPrimary: '#F4F4F5',
  textMuted: '#A1A1AA',
  border: '#27272A',
  accent: '#FAFAFA',
  accentText: '#121212',
  danger: '#EF4444',
};

export function getTheme(colorScheme: ColorSchemeName | null | undefined): ThemeColors {
  return colorScheme === 'dark' ? darkTheme : lightTheme;
}

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 28,
} as const;

export const radius = {
  sm: 8,
  md: 12,
  full: 9999,
} as const;
