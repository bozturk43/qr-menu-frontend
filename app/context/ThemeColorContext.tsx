'use client';

import { createContext, useContext, ReactNode } from 'react';

// Temamızın renk paletinin tipini tanımlıyoruz
interface ThemeColors {
  background: string;
  text: string;
  primary: string;
  secondary: string;
}

const ThemeColorContext = createContext<ThemeColors | undefined>(undefined);

// Renklere kolayca erişmek için özel bir hook
export function useThemeColors() {
  const context = useContext(ThemeColorContext);
  if (context === undefined) {
    throw new Error('useThemeColors must be used within a ThemeColorProvider');
  }
  return context;
}

// Renkleri dağıtacak olan Provider bileşeni
export function ThemeColorProvider({ children, colors }: { children: ReactNode, colors: ThemeColors }) {
  return (
    <ThemeColorContext.Provider value={colors}>
      {children}
    </ThemeColorContext.Provider>
  );
}