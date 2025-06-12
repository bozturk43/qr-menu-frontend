// src/themes/ModernTheme.tsx

"use client"; // Sekmelere tıklama gibi kullanıcı etkileşimi olduğu için Client Component olmalı.

import { useState, useEffect } from 'react';
import type { Restaurant, StrapiCollection, } from "@/app/types/strapi";

// Bileşenin alacağı propların tipini belirliyoruz.
interface ModernThemeProps {
  restaurant: StrapiCollection<Restaurant>;
}

export default function ModernTheme({ restaurant }: ModernThemeProps) {
  const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337';

  const [activeCategoryId, setActiveCategoryId] = useState<number | null>(null);

  useEffect(() => {
    if (restaurant.categories && restaurant.categories.length > 0) {
      setActiveCategoryId(restaurant.categories[0].id);
    }
  }, [restaurant.categories]);

  const activeCategory = restaurant.categories?.find(
    (category) => category.id === activeCategoryId
  );

  return (
    <div className="bg-gray-900 min-h-screen text-white font-sans">
      <header className="p-8 text-center">
        {restaurant.logo && (
          <img 
            src={`${STRAPI_URL}${restaurant.logo.url}`}
            alt={`${restaurant.name} logo`}
            className="w-24 h-24 rounded-full object-cover mx-auto mb-4 border-2 border-gray-700"
          />
        )}
        <h1 className="text-5xl font-extrabold tracking-tight">{restaurant.name}</h1>
      </header>

      <main className="container mx-auto px-4 pb-16">
        {/* Kategori Sekmeleri */}
        <nav className="flex justify-center space-x-2 sm:space-x-4 p-4 border-b border-gray-700 overflow-x-auto">
          {restaurant.categories?.map((category) => (
            <button
              key={category.id}
              onClick={() => setActiveCategoryId(category.id)}
              className={`py-2 px-4 rounded-md text-sm sm:text-base font-semibold transition-all duration-300 whitespace-nowrap ${
                activeCategoryId === category.id
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              {category.name}
            </button>
          ))}
        </nav>

        {/* Aktif Kategorinin Ürünleri */}
        <section className="mt-12">
          {activeCategory ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
              {activeCategory.products?.map((product) => (
                <div key={product.id} className="bg-gray-800 rounded-lg overflow-hidden shadow-xl transform hover:scale-105 transition-transform duration-300">
                  {product.images && product.images.length > 0 && (
                     <img 
                        src={`${STRAPI_URL}${product.images[0].url}`} 
                        alt={product.name}
                        className="w-full h-56 object-cover"
                     />
                  )}
                  <div className="p-6">
                    <h3 className="text-2xl font-bold">{product.name}</h3>
                    {product.description && (
                      <p className="text-gray-400 mt-2">{product.description}</p>
                    )}
                    <div className="flex justify-between items-center mt-4">
                      <span className="text-2xl font-bold text-blue-400">{product.price} TL</span>
                      {!product.is_available && (
                        <span className="text-xs font-semibold bg-red-500/50 text-white px-2 py-1 rounded-full">Tükendi</span>
                      )}
                    </div>
                    {/* Alerjenler */}
                    {product.allergens && product.allergens.length > 0 && (
                      <div className="mt-4 flex flex-wrap gap-2 items-center">
                        <span className="text-xs text-gray-500">Alerjenler:</span>
                        {product.allergens.map(allergen => (
                          <span key={allergen.id} className="text-xs bg-gray-700 text-gray-300 px-2 py-1 rounded-full">
                            {allergen.name}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center text-gray-500">Görüntülenecek ürün yok.</div>
          )}
        </section>
      </main>
    </div>
  );
}