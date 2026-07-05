import React, { createContext, useContext, useMemo } from 'react';
import { V3ThemeConfig } from './themeTypes';
import { getV3Theme } from './themes';

interface ThemeProviderV3Props {
  palette?: string;
  theme?: string; // fallback/category
  children: React.ReactNode;
}

const ThemeContextV3 = createContext<V3ThemeConfig | null>(null);

export const ThemeProviderV3: React.FC<ThemeProviderV3Props> = ({ palette, children }) => {
  const currentTheme = useMemo(() => {
    return getV3Theme(palette);
  }, [palette]);

  // Dynamically inject fonts into document head
  useMemo(() => {
    if (typeof window === 'undefined') return;
    const fontsToLoad = [currentTheme.fontTitle, currentTheme.fontBody].filter(Boolean);
    const existingIds = Array.from(document.querySelectorAll('link[id^="font-v3-"]')).map(el => el.id);
    
    fontsToLoad.forEach(font => {
      const id = `font-v3-${font.replace(/\s+/g, '-').toLowerCase()}`;
      if (!existingIds.includes(id)) {
        const link = document.createElement('link');
        link.id = id;
        link.rel = 'stylesheet';
        link.href = `https://fonts.googleapis.com/css2?family=${font.replace(/\s+/g, '+')}:wght@300;400;500;600;700;800&display=swap`;
        document.head.appendChild(link);
      }
    });
  }, [currentTheme.fontTitle, currentTheme.fontBody]);

  return (
    <ThemeContextV3.Provider value={currentTheme}>
      <div 
        className={`${currentTheme.colors.background} min-h-screen`}
        style={{
          fontFamily: `'${currentTheme.fontBody}', sans-serif`,
        }}
      >
        {children}
      </div>
    </ThemeContextV3.Provider>
  );
};

export const useV3Theme = (): V3ThemeConfig => {
  const context = useContext(ThemeContextV3);
  if (!context) {
    throw new Error('useV3Theme must be used within a ThemeProviderV3');
  }
  return context;
};
