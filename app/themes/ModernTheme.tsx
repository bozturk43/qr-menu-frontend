'use client';

import { useState, useEffect } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import { ThemeColorProvider, useThemeColors } from '@/app/context/ThemeColorContext';
import type { Restaurant, Category, Product } from '@/app/types/strapi';
import { Box, Typography, Avatar, Paper, Card, CardMedia, CardContent, IconButton } from '@mui/material';
import { ChevronLeft, ChevronRight } from 'lucide-react';

// --- Alt Bileşenler ---

// Kategori Carousel'indeki tek bir kart
const CategorySlide = ({ category, isSelected, onClick }: { category: Category, isSelected: boolean, onClick: () => void }) => {
  const colors = useThemeColors();
  const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337';

  return (
    <Box sx={{ flex: '0 0 35%' }} onClick={onClick}>
      <Card sx={{
        cursor: 'pointer',
        border: isSelected ? `2px solid ${colors.secondary}` :'',
        transition: 'border 0.2s ease-in-out',
        boxShadow: isSelected ? `0 0 15px ${colors.secondary}` : 'none'
      }}>
        <CardMedia
          component="img"
          image={category.image ? `${STRAPI_URL}${category.image.url}` : 'https://via.placeholder.com/150'}
          alt={category.name}
          sx={{ height: 80 }}
        />
        <Typography sx={{ p: 1, textAlign: 'center', fontWeight: 'bold', backgroundColor: `${colors.secondary}`, color: 'white' }}>
          {category.name}
        </Typography>
      </Card>
    </Box>
  );
}

// Ürün Grid'indeki tek bir kart
const ProductItem = ({ product }: { product: Product }) => {
  const colors = useThemeColors();
  const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337';
  return (
    <Card sx={{ backgroundColor: `${colors.primary}` }}>
      <CardMedia
        component="img"
        image={product.images?.[0] ? `${STRAPI_URL}${product.images[0].url}` : 'https://via.placeholder.com/150'}
        alt={product.name}
        sx={{ height: 140 }}
      />
      <CardContent>
        <Typography gutterBottom variant="h6" component="div" sx={{ fontWeight: 'bold', color: `${colors.text}` }}>
          {product.name}
        </Typography>
        <Typography variant="body2" sx={{ color: `${colors.text}` }}>
          {product.price} TL
        </Typography>
      </CardContent>
    </Card>
  )
}


// --- Ana Tema Bileşeni ---
function ModernThemeContent({ restaurant }: { restaurant: Restaurant }) {
  const colors = useThemeColors();
  const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337';

  // Carousel için hook
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: false, align: 'start' });

  // Seçili kategoriyi tutmak için state
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);

  // Başlangıçta ilk kategoriyi seçili yap
  useEffect(() => {
    if (restaurant.categories && restaurant.categories.length > 0) {
      setSelectedCategoryId(restaurant.categories[0].id);
    }
  }, [restaurant.categories]);

  // Seçili kategoriye ait ürünleri filtrele
  const displayedProducts = restaurant.categories?.find(c => c.id === selectedCategoryId)?.products || [];
  const selectedCategoryName = restaurant.categories?.find(c => c.id === selectedCategoryId)?.name || '';


  return (
    <Box sx={{ bgcolor: colors.background, color: colors.text, minHeight: '100vh', fontFamily: 'Inter, sans-serif' }}>
      {/* Üst Header */}
      <header className="p-4 flex items-center">
        <Avatar src={restaurant.logo ? `${STRAPI_URL}${restaurant.logo.url}` : undefined} sx={{ width: 56, height: 56 }}>{restaurant.name.charAt(0)}</Avatar>
        <Typography variant="h1" fontSize={"24px"}>{restaurant.name}</Typography>
      </header>

      {/* Kategori Carousel */}
      <Box sx={{ position: 'relative', px: 2, mt: 2 }}>
        <div className="overflow-hidden" ref={emblaRef}>
          <div className="flex gap-4 pr-2">
            {restaurant.categories
              ?.slice() // Orijinal diziyi değiştirmemek için bir kopyasını oluştururuz
              .sort((a, b) => (a.display_order || 0) -( b.display_order || 0)) // display_order'a göre küçükten büyüğe sıralarız
              .map(category => (
                <CategorySlide
                  key={category.id}
                  category={category}
                  isSelected={selectedCategoryId === category.id}
                  onClick={() => setSelectedCategoryId(category.id)}
                />
              ))}
          </div>
        </div>
      </Box>

      {/* Ürünler Grid */}
      <Box sx={{ p: 2, mt: 4 }}>
        <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 3 }}>{selectedCategoryName}</Typography>
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 2 }}>
          {displayedProducts.map(product => (
            <ProductItem key={product.id} product={product} />
          ))}
        </Box>
      </Box>
    </Box>
  );
}


// Ana sarmalayıcı bileşen. Renkleri hesaplar ve Context'i sağlar.
export default function ModernTheme({ restaurant }: { restaurant: Restaurant }) {
  const defaultColors = {
    background: '#1A1A1D', text: '#F5F5F5', primary: '#2C2C31', secondary: '#4A4A52',
  };

  const finalColors = {
    background: restaurant.background_color_override || defaultColors.background,
    text: restaurant.text_color_override || defaultColors.text,
    primary: restaurant.primary_color_override || defaultColors.primary,
    secondary: restaurant.secondary_color_override || defaultColors.secondary,
  };

  return (
    <ThemeColorProvider colors={finalColors}>
      <ModernThemeContent restaurant={restaurant} />
    </ThemeColorProvider>
  );
}