// src/themes/ClassicTheme.tsx

import { StrapiCollection, Category, Product, Restaurant } from "@/app/types/strapi";
import { Typography } from "@mui/material";

// Bu bileşen, tüm restoran verisini tek bir prop olarak alır
export default function ClassicTheme({ restaurant }: { restaurant: StrapiCollection<Restaurant> }) {

  return (
    // Bu tema için özel stiller (Tailwind ile)
    <div className="bg-white text-gray-800 font-serif p-4">
      <Typography variant="h3" className="text-center" color="primary">{restaurant.name}</Typography>

      {/* Kategoriler alt alta listeleniyor */}
      <div className="mt-8 space-y-12">
        {restaurant.categories?.map((category: Category) => (
          <div key={category.id}>
            <Typography variant="h4" className="mt-6 mb-4 border-b-2 border-gray-200 pb-2">{category.name}</Typography>
            {/* Ürünler kartlar halinde */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {category.products?.map((product: Product) => (
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