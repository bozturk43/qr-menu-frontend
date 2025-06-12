// src/types/strapi.ts

// =================================================================
// 1. STRAPI'NİN GENEL YARDIMCI TİPLERİ
// =================================================================

export interface StrapiMedia {
  id: number;
  name: string;
  url: string;
  width: number;
  height: number;
  formats?: { [key: string]: { url: string } };
}


/** Strapi'nin herhangi bir koleksiyon öğesi için kullandığı sarmalayıcı */
export type StrapiCollection<T> = T & {
  id: number;
};

/** Strapi'nin ilişki (relation) alanlarını sarmalama şekli */
// Tekli ilişki için: { data: StrapiCollection<T> }
// Çoklu ilişki için: { data: StrapiCollection<T>[] }
export interface StrapiRelation<T> {
  data: T;
}

/** Strapi'nin bir liste döndüğünde kullandığı genel API yanıtı */
export interface StrapiResponse<T> {
  data: T[];
  meta: {
    pagination: {
      page: number;
      pageSize: number;
      pageCount: number;
      total: number;
    };
  };
}

// =================================================================
// 2. NESNE VERİ MODELLERİ
// =================================================================

interface BaseAttributes {
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
}

/** Allergen modeli için attribute'lar */
// Alerjenler için tip
export interface Allergen {
  id: number;
  name: string;
  icon?: StrapiMedia;
}


export interface Theme {
  id: number;
  name: string;
  identifier: string;
}

export interface Product {
  id: number;
  name: string;
  description?: string;
  price: number;
  is_available: boolean;
  images?: StrapiMedia[];
  allergens?: Allergen[];
}

export interface Category {
  id: number;
  name: string;
  display_order?: number;
  image?: StrapiMedia;
  products?: Product[];
}


/** Restaurant modeli için attribute'lar */
export interface Restaurant {
  id: number;
  name: string;
  slug: string;
  logo?: StrapiMedia;
  selected_theme?: Theme;
  categories?: Category[];
  custom_css?: string;
  has_custom_design: boolean;
  subscription_status: 'active' | 'inactive' | 'payment_failed';
  subscription_expires_at: string;

}
