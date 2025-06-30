'use client';

import { useMemo, useState } from 'react';
import { ThemeColorProvider, useThemeColors } from '@/app/context/ThemeColorContext';
import type { Restaurant, Category } from '@/app/types/strapi';
import { Box, Typography, Avatar,IconButton, Card, CardMedia, CardContent, CardActionArea, TextField, InputAdornment } from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import { SearchIcon } from 'lucide-react';
import { getStrapiMedia } from '../lib/utils';

// --- Ana Tema İçeriği Bileşeni ---
function ClassicThemeContent({ restaurant }: { restaurant: Restaurant }) {
  const colors = useThemeColors();
  const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337';

  // İki state'imiz var:
  // 1. Hangi görünümde olduğumuzu tutar ('categories' veya 'products')
  const [view, setView] = useState<'categories' | 'products'>('categories');
  // 2. Hangi kategorinin seçildiğini tutar
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // ARAMA FİLTRELEME MANTIĞI
  const filteredCategories = useMemo(() => {
    if (!searchTerm.trim()) return restaurant.categories || [];
    const lowercasedFilter = searchTerm.toLowerCase();
    return restaurant.categories
      ?.map(category => ({
        ...category,
        products: category.products?.filter(product =>
          product.name.toLowerCase().includes(lowercasedFilter)
        ),
      }))
      .filter(category => category.products && category.products.length > 0);
  }, [searchTerm, restaurant.categories]);

  // Bir kategoriye tıklandığında çalışacak fonksiyon
  const handleCategoryClick = (category: Category) => {
    setSelectedCategory(category);
    setView('products'); // Görünümü 'ürünler' olarak değiştir
  };

  // Ürünler ekranından kategorilere geri dönmek için fonksiyon
  const handleBackToCategories = () => {
    setSelectedCategory(null);
    setView('categories'); // Görünümü 'kategoriler' olarak değiştir
  };

  return (
    <Box sx={{ bgcolor: colors.background, color: colors.text, minHeight: '100vh' }}>
      <header className="p-6 text-center">
        <Avatar src={restaurant.logo ? `${STRAPI_URL}${restaurant.logo.url}` : undefined} sx={{ width: 90, height: 90, mx: 'auto', mb: 2, border: `3px solid ${colors.primary}` }}>
          {restaurant.name.charAt(0)}
        </Avatar>
        <Typography variant="h3" component="h1" sx={{ fontFamily: 'Playfair Display, serif', fontWeight: 'bold', color: colors.primary }}>
          {restaurant.name}
        </Typography>
      </header>

      <main className="px-4 pb-8">
        <Box sx={{ mb: 4, maxWidth: 'md', mx: 'auto' }}>
          <TextField
            fullWidth
            placeholder="Menüde aradığınız ürünü yazın..."
            variant="outlined"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            slotProps={{
              input: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              )
            }}
          />
        </Box>
        {searchTerm.trim() ? (
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 3 }}>Arama Sonuçları</Typography>
            {filteredCategories && filteredCategories.length > 0 ? (
              filteredCategories.map(category => (
                <Box key={category.id} mb={4}>
                  <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 2, borderBottom: 1, borderColor: 'divider', pb: 1 }}>{category.name}</Typography>
                  <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 2 }}>
                    {category.products?.map(product => (
                      <Card key={product.id} sx={{ backgroundColor: 'transparent', boxShadow: 'none' }}>
                        <CardMedia
                          component="img"
                          image={product.images?.[0] ? getStrapiMedia(product.images[0]) : 'https://via.placeholder.com/150'}
                          alt={product.name}
                          sx={{ height: 150, borderRadius: 2 }}
                        />
                        <CardContent sx={{ px: 0 }}>
                          <Typography variant="h6" component="div" sx={{ fontWeight: 'bold' }}>
                            {product.name}
                          </Typography>
                          <Typography variant="body1" sx={{ color: colors.primary, fontWeight: 'bold' }}>
                            {product.price} TL
                          </Typography>
                        </CardContent>
                      </Card>
                    ))}
                  </Box>
                </Box>
              ))
            ) : (
              <Typography>Aradığınız kriterlere uygun ürün bulunamadı.</Typography>
            )}
          </Box>
        ) : (
          <>
            {view === 'categories' && (
              <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 3, mt: 4 }}>
                {restaurant.categories
                  ?.slice()
                  .sort((a, b) => (a.display_order || 0) - (b.display_order || 0))
                  .map((category) => (
                    <Card
                      key={category.id}
                      elevation={4}
                      sx={{
                        transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
                        '&:hover': {
                          transform: 'translateY(-5px)',
                          boxShadow: 6,
                        }
                      }}
                    >
                      <CardActionArea onClick={() => handleCategoryClick(category)}>
                        <CardMedia
                          component="img"
                          image={category.image ? getStrapiMedia(category.image) : 'https://via.placeholder.com/250x150'}
                          alt={category.name}
                          sx={{ height: 150 }}
                        />
                        <CardContent>
                          <Typography variant="h6" component="div" sx={{ fontWeight: 'bold' }}>
                            {category.name}
                          </Typography>
                        </CardContent>
                      </CardActionArea>
                    </Card>
                  ))}
              </Box>
            )}

            {view === 'products' && selectedCategory && (
              <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                  <IconButton onClick={handleBackToCategories} sx={{ color: colors.text }}>
                    <ArrowBack />
                  </IconButton>
                  <Typography variant="h4" sx={{ fontWeight: 'bold', ml: 1 }}>
                    {selectedCategory.name}
                  </Typography>
                </Box>
                <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 2 }}>
                  {selectedCategory.products?.map(product => (
                    <Card key={product.id} sx={{ backgroundColor: 'transparent', boxShadow: 'none' }}>
                      <CardMedia
                        component="img"
                        image={product.images?.[0] ? getStrapiMedia(product.images[0]) : 'https://via.placeholder.com/150'}
                        alt={product.name}
                        sx={{ height: 150, borderRadius: 2 }}
                      />
                      <CardContent sx={{ px: 0 }}>
                        <Typography variant="h6" component="div" sx={{ fontWeight: 'bold' }}>
                          {product.name}
                        </Typography>
                        <Typography variant="body1" sx={{ color: colors.text, fontWeight: 'bold' }}>
                          {product.price} TL
                        </Typography>
                      </CardContent>
                    </Card>
                  ))}
                </Box>
              </Box>
            )}
          </>
        )}
      </main>
    </Box>
  );
}


// Ana sarmalayıcı bileşen. Renkleri hesaplar ve Context'i sağlar.
export default function ClassicTheme({ restaurant }: { restaurant: Restaurant }) {
  // Bu tema için varsayılan renkler
  const defaultColors = {
    background: '#F8F7F4', // Fildişi
    text: '#333333',       // Koyu Gri
    primary: '#A52A2A',    // Kahverengi
    secondary: '#8B4513',  // Daha açık kahve
  };

  // Strapi'den gelen özel renklerle varsayılanları birleştir
  const finalColors = {
    background: restaurant.background_color_override || defaultColors.background,
    text: restaurant.text_color_override || defaultColors.text,
    primary: restaurant.primary_color_override || defaultColors.primary,
    secondary: restaurant.secondary_color_override || defaultColors.secondary,
  };

  return (
    <ThemeColorProvider colors={finalColors}>
      <ClassicThemeContent restaurant={restaurant} />
    </ThemeColorProvider>
  );
}