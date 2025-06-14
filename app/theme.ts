"use client";

import { createTheme } from '@mui/material/styles';
import { Playfair_Display, Inter } from 'next/font/google';

// Fontları Next.js'e uygun şekilde tanımlıyoruz
export const playfair = Playfair_Display({
  subsets: ['latin'],
  display: 'swap',
});

export const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
});

// Yeni tema kararlarımızla temamızı oluşturuyoruz
const theme = createTheme({
  palette: {
    primary: {
      main: '#0D253F', // Gece Mavisi
    },
    secondary: {
      main: '#FFAA00', // Safran Sarısı
    },
    background: {
      default: '#F8F7F4', // Fildişi Beyazı
      paper: '#ffffff',
    },
    text: {
      primary: '#333333', // Antrasit Gri
      secondary: '#555555',
    },
  },
  typography: {
    fontFamily: inter.style.fontFamily, // Varsayılan metin fontu
    h1: {
      fontFamily: playfair.style.fontFamily, // Başlıklar için Playfair Display
      fontWeight: 700,
      fontSize: '3rem',
    },
    h2: {
      fontFamily: playfair.style.fontFamily,
      fontWeight: 700,
    },
    h3: {
      fontFamily: playfair.style.fontFamily,
      fontWeight: 700,
    },
    button: {
        textTransform: 'none',
        fontWeight: 600,
    }
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          padding: '10px 24px',
        },
      },
    },
  },
});

export default theme;