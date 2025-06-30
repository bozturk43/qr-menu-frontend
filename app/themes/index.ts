// src/themes/index.ts

import ClassicTheme from './ClassicTheme';
import GourmetTheme from './GourmetTheme';
import ModernTheme from './ModernTheme';

export const THEME_MAP = {
  'classic_theme': ClassicTheme, // Strapi'deki identifier ile eşleşmeli
  'modern_theme': ModernTheme,    // Strapi'deki identifier ile eşleşmeli
  'gourmet_theme':GourmetTheme
  // Gelecekte yeni bir tema eklersen, sadece bu haritaya eklemen yeterli olacak.
};

export { ClassicTheme, ModernTheme,GourmetTheme };