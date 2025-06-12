// src/themes/ClassicTheme.tsx

import { StrapiCollection, Category, Product, Restaurant } from "@/app/types/strapi";

// Bu bileşen, tüm restoran verisini tek bir prop olarak alır
export default function ClassicTheme({ restaurant }: { restaurant: StrapiCollection<Restaurant> }) {

  return (
    // Bu tema için özel stiller (Tailwind ile)
    <div className="bg-white text-gray-800 font-serif p-4">
      <h1 className="text-4xl font-bold text-center my-8 text-amber-800">{restaurant.name}</h1>
      
      {/* Kategoriler alt alta listeleniyor */}
      <div className="mt-8 space-y-12">
        {restaurant.categories?.map((category:Category) => (
          <div key={category.id}>
            <h2 className="text-3xl font-semibold mt-6 mb-4 border-b-2 border-gray-200 pb-2">{category.name}</h2>
            
            {/* Ürünler kartlar halinde */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {category.products?.map((product:Product) => (
                <div key={product.id} className="border p-4 rounded-lg shadow-sm">
                  <h3 className="text-xl font-bold">{product.name}</h3>
                  <p className="text-gray-600 mt-2">{product.description}</p>
                  <p className="text-lg font-semibold mt-4 text-amber-800">{product.price} TL</p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}