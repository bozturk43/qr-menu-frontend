// src/themes/index.ts

import ClassicTheme from './ClassicTheme';
import ModernTheme from './ModernTheme';

export const THEME_MAP = {
  'classic_theme': ClassicTheme, // Strapi'deki identifier ile eşleşmeli
  'modern_theme': ModernTheme,    // Strapi'deki identifier ile eşleşmeli
  // Gelecekte yeni bir tema eklersen, sadece bu haritaya eklemen yeterli olacak.
};

export { ClassicTheme, ModernTheme };