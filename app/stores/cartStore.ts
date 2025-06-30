// src/stores/cartStore.ts
import { create } from 'zustand';
import type { Product, Option } from '@/app/types/strapi';

// Sepetteki tek bir ürünün nasıl görüneceğini tanımlayan tip
export interface CartItem {
  product: Product;
  quantity: number;
  selectedVariations: {
    groupTitle: string;
    option: Option;
  }[];
  // Her bir kalemin kendine özgü bir ID'si olmalı ki aynı üründen farklı varyasyonlarla eklenebilsin
  uniqueId: string; 
}

// Store'umuzun state'inin ve fonksiyonlarının tip tanımı
interface CartState {
  items: CartItem[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (uniqueId: string) => void;
  updateQuantity: (uniqueId: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: () => number;
}

export const useCartStore = create<CartState>((set, get) => ({
  // BAŞLANGIÇ STATE'İ
  items: [],

  // FONKSİYONLAR (ACTIONS)
  
  // Sepete yeni ürün ekle
  addToCart: (itemToAdd) => {
    set((state) => ({
      items: [...state.items, itemToAdd],
    }));
  },

  // Sepetten bir ürünü kaldır
  removeFromCart: (uniqueId) => {
    set((state) => ({
      items: state.items.filter((item) => item.uniqueId !== uniqueId),
    }));
  },

  // Bir ürünün adetini güncelle
  updateQuantity: (uniqueId, quantity) => {
    set((state) => ({
      items: state.items.map((item) =>
        item.uniqueId === uniqueId
          ? { ...item, quantity: Math.max(0, quantity) } // Adet 0'ın altına inmesin
          : item
      ),
    }));
  },

  // Sepeti tamamen temizle
  clearCart: () => set({ items: [] }),

  // Sepetteki toplam ürün sayısını hesapla (header'daki ikon için)
  totalItems: () => {
    return get().items.reduce((total, item) => total + item.quantity, 0);
  }
}));