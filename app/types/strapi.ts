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
export interface UserRegistrationInfo {
  username: string;
  email: string;
  password: string;
}
export interface UserLoginInfo {
  identifier: string; // Strapi hem email hem de username kabul eder
  password: string;
}
export interface StrapiAuthResponse {
  jwt: string;
  user: {
    id: number;
    username: string;
    email: string;
    confirmed: boolean;
    blocked: boolean;
    createdAt: string;
    updatedAt: string;
  };
}
// =================================================================
// 2. NESNE VERİ MODELLERİ
// =================================================================
export interface User {
  id: number;
  username: string;
  email: string;
  provider: string; // 'local' veya sosyal medya sağlayıcıları
  confirmed: boolean;
  blocked: boolean;
  createdAt: string;
  updatedAt: string;
}

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
  category: Category;
  display_order?:number;
}

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
  owner?: User;
  plan?: 'free' |'premium',
  background_color_override:string,
  text_color_override:string,
  primary_color_override:string,
  secondary_color_override:string,
}

//Category CRUD Modelleri
export interface Category {
  id: number;
  name: string;
  display_order?: number;
  image?: StrapiMedia;
  products?: Product[];
  restaurant?: Restaurant; // Belki bu şekildeydi
}
export interface NewCategoryData {
  name: string;
  restaurant: number;
  display_order: number;
  image?: number; // Resmin ID'si
}
export interface UpdateCategoryData {
  name?: string;
  image?: number;
}
//Product CRUD Modelleri
export interface NewProductData {
  name: string;
  price: number;
  description?: string;
  category: number; // Ait olduğu kategorinin ID'si
  images?: number[]; // Yüklenecek resimlerin ID dizisi
  is_available?: boolean;
}
export interface UpdateProductData {
  name?: string;
  description?: string;
  price?: number;
  category?: number;
  is_available?: boolean;
  images?: number[];

}
//Restaurant CRUD Modelleri
export interface NewRestaurantData {
  name: string;
  logo?:number;
  owner:number;
}
export interface UpdateRestaurantData {
  name?: string;
  slug?: string;
  selected_theme?: number;
  logo?: number; // Yeni logo ID'si
}

//User CRUD Modeller
export interface UpdateProfileData {
  username?: string;
  email?: string;
}
export interface ChangePasswordData {
  currentPassword: string;
  password: string;
  passwordConfirmation: string;
}
