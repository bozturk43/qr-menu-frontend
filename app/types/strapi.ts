// src/types/strapi.ts

// =================================================================
// 1. STRAPI'NİN GENEL YARDIMCI TİPLERİ
// =================================================================
export interface StrapiMediaFormat {
  name: string;
  hash: string;
  ext: string;
  mime: string;
  path: string | null;
  width: number;
  height: number;
  size: number;
  sizeInBytes: number;
  url: string;
}

export interface StrapiMedia {
  id: number;
  name: string;
  alternativeText: string | null; // <-- BU SATIRI EKLİYORUZ
  caption: string | null;
  width: number;
  height: number;
  formats: {
    thumbnail: StrapiMediaFormat;
    small?: StrapiMediaFormat;
    medium?: StrapiMediaFormat;
    large?: StrapiMediaFormat;
  };
  hash: string;
  ext: string;
  mime: string;
  size: number;
  url: string;
  previewUrl: string | null;
  provider: string;
  provider_metadata: any;
  createdAt: string;
  updatedAt: string;
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

export interface Option {
  id: number;
  name: string;
  price_adjustment: number;
}

export interface VariationGroup {
  id: number;
  title: string;
  type: 'single' | 'multiple';
  options: Option[];
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
  display_order?: number;
  variations?: VariationGroup[];
}
export interface Table {
  id: number;
  name: string;
  qr_code_identifier: string;
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
  plan?: 'free' | 'pro' | 'bussiness',
  tables: Table[],
  background_color_override: string,
  text_color_override: string,
  primary_color_override: string,
  secondary_color_override: string,
  show_restaurant_name?: boolean,
  font_restaurant_title?: string | null;
  font_category_title?: string | null;
  font_product_title?: string | null;
  color_restaurant_title?: string | null;
  color_category_title?: string | null;
  color_product_title?: string | null;
  color_product_description?: string | null;

}
export interface OrderItem {
  id: number;
  quantity: number;
  product_name: string;
  selected_variations: string;
  total_price: number;
  is_printed: boolean;
  order_item_status: 'open' | 'paid';
  product?: Product; // Her zaman populate edilmeyebilir
}

// Ana sipariş (adisyon) nesnesini temsil eder
export interface Order {
  id: number;
  status: 'open' | 'paid' | 'canceled';
  total_price: number;
  notes?: string;
  table?: Table;
  restaurant?: Restaurant;
  order_items: OrderItem[]; // Siparişin içindeki kalemlerin dizisi
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
  variations?: { // Component verisi bu formatta gönderilir
    title: string;
    type: 'single' | 'multiple';
    options: {
      name: string;
      price_adjustment: number;
    }[];
  }[];
}
export interface UpdateProductData {
  name?: string;
  description?: string;
  price?: number;
  category?: number;
  is_available?: boolean;
  images?: number[];
  variations?: {
    id?: number; // Mevcut componentleri güncellemek için ID'leri de gönderebiliriz
    title: string;
    type: 'single' | 'multiple';
    options: {
      id?: number;
      name: string;
      price_adjustment: number;
    }[];
  }[];

}
//Restaurant CRUD Modelleri
export interface NewRestaurantData {
  name: string;
  logo?: number;
  owner: number;
}
export interface UpdateRestaurantData {
  name?: string;
  slug?: string;
  selected_theme?: number;
  logo?: number | null;
  show_restaurant_name?: boolean;
  font_restaurant_title?: string | null;
  font_category_title?: string | null;
  font_product_title?: string | null;
  color_restaurant_title?: string | null;
  color_category_title?: string | null;
  color_product_title?: string | null;
  color_product_description?: string | null;
  primary_color_override?: string | null;
  secondary_color_override?: string | null;
  background_color_override?: string | null;
  text_color_override?: string | null;
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

//Table CRUD Modeller
export interface NewTableData {
  name: string;
  restaurant: number; // Masanın hangi restorana ait olduğu
}
export interface UpdateTableData {
  name?: string;
}