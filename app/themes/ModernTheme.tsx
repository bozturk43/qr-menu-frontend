'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import { ThemeColorProvider, useThemeColors } from '@/app/context/ThemeColorContext';
import type { Restaurant, Category, Product } from '@/app/types/strapi';
import { Box, Typography, Avatar, Card, CardMedia, CardContent, IconButton, TextField, InputAdornment, Button } from '@mui/material';
import { ChevronLeft, ChevronRight, SearchIcon } from 'lucide-react';
import { CartItem, useCartStore } from '../stores/cartStore';
import ProductWithOptionsModal from '../components/menu/ProductWithOptionsModal';
import CartFab from '../components/menu/CartFab';
import CartDrawer from '../components/menu/CartDrawer';
import { getStrapiMedia } from '../lib/utils';

// --- Alt Bileşenler ---

// Kategori Carousel'indeki tek bir kart
// --- Alt Bileşenler (Değişiklik yok) ---
const CategorySlide = ({ category, isSelected, onClick }: { category: Category, isSelected: boolean, onClick: () => void }) => {
  const colors = useThemeColors();
  return (
    // Önceki kodda flex: '0 0 35%' idi, mobil uyumluluk için biraz daha küçük olabilir.
    // Örn: '0 0 140px' veya responsive bir değer. Şimdilik aynı bırakıyorum.
    <Box sx={{ flex: '0 0 35%', minWidth: 140 }} onClick={onClick}>
      <Card sx={{
        cursor: 'pointer',
        border: isSelected ? `2px solid ${colors.secondary}` : '2px solid transparent',
        transition: 'border 0.2s ease-in-out',
        boxShadow: isSelected ? `0 0 15px ${colors.secondary}` : 'none',
        overflow: 'hidden'
      }}>
        <CardMedia
          component="img"
          image={category.image ? getStrapiMedia(category.image) : 'https://via.placeholder.com/150'}
          alt={category.name}
          sx={{ height: 80, objectFit: 'cover' }}
        />
        <Typography sx={{ p: 1, textAlign: 'center', fontWeight: 'bold', backgroundColor: `${colors.secondary}`, color: 'white' }}>
          {category.name}
        </Typography>
      </Card>
    </Box>
  );
}

const ProductItem = ({ product, onAddToCart, plan }: { product: Product, onAddToCart: (product: Product) => void, plan?: string }) => {
  const colors = useThemeColors();
  return (
    <Card sx={{ backgroundColor: `${colors.primary}` }}>
      <CardMedia
        component="img"
        image={product.images?.[0] ? getStrapiMedia(product.images[0]) : 'https://via.placeholder.com/150'}
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
      {plan === 'premium' && (
        <Button
          variant="contained"
          sx={{
            m: 1,
            backgroundColor: colors.secondary,
            '&:hover': { backgroundColor: '#5A67D8' }
          }}
          onClick={() => onAddToCart(product)}
        >
          Sepete Ekle
        </Button>
      )}
    </Card>
  )
}


// --- Ana Tema Bileşeni ---
function ModernThemeContent({ restaurant }: { restaurant: Restaurant }) {
  const colors = useThemeColors();

  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: false, align: 'start' });
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const addToCart = useCartStore((state) => state.addToCart);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isCartOpen, setCartOpen] = useState(false);

  // --- ARAMA İÇİN EKLENENLER BAŞLANGIÇ ---
  const [searchTerm, setSearchTerm] = useState('');

  const handleAddToCartClick = (product: Product) => {
    // Eğer ürünün varyasyonu yoksa, doğrudan sepete ekle
    if (!product.variations || product.variations.length === 0) {
      const newItem: CartItem = {
        product: product,
        quantity: 1,
        selectedVariations: [],
        uniqueId: `${product.id}-${Date.now()}` // Basit bir eşsiz ID
      };
      addToCart(newItem);
      alert(`${product.name} sepete eklendi!`); // TODO: Snackbar ile değiştirilecek
    } else {
      // Eğer varyasyon varsa, modal'ı açmak için ürünü state'e ata
      setSelectedProduct(product);
    }
  };

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
  // --- ARAMA İÇİN EKLENENLER BİTİŞ ---

  useEffect(() => {
    // Arama yoksa ve seçili kategori yoksa ilkini seç
    if (!searchTerm.trim() && !selectedCategoryId && restaurant.categories && restaurant.categories.length > 0) {
      setSelectedCategoryId(restaurant.categories[0].id);
    }
  }, [restaurant.categories, selectedCategoryId, searchTerm]);

  // --- CAROUSEL OKLARI İÇİN EKLENENLER BAŞLANGIÇ ---
  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);
  // --- CAROUSEL OKLARI İÇİN EKLENENLER BİTİŞ ---

  const displayedProducts = restaurant.categories?.find(c => c.id === selectedCategoryId)?.products || [];
  const selectedCategoryName = restaurant.categories?.find(c => c.id === selectedCategoryId)?.name || 'Tüm Ürünler';


  return (
    <Box sx={{ bgcolor: colors.background, color: colors.text, minHeight: '100vh', fontFamily: 'Inter, sans-serif' }}>
      <header className="p-4 flex flex-col items-center gap-4">
        <Avatar src={restaurant.logo ? getStrapiMedia(restaurant.logo) : undefined} sx={{ width: 56, height: 56 }}>{restaurant.name.charAt(0)}</Avatar>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold', textAlign: 'center' }}>{restaurant.name}</Typography>

        {/* YENİ ARAMA ÇUBUĞU */}
        <Box sx={{ width: '100%', maxWidth: 500, px: 2 }}>
          <TextField
            fullWidth
            placeholder="Menüde ara..."
            variant="outlined"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            sx={{
              '& .MuiOutlinedInput-root': { borderRadius: '999px', backgroundColor: 'rgba(255,255,255,0.1)', '& fieldset': { borderColor: 'rgba(255,255,255,0.2)' }, '&:hover fieldset': { borderColor: colors.primary }, },
              input: { color: 'white' }
            }}
            slotProps={{
              input: (
                <InputAdornment position="start">
                  <SearchIcon size={20} color={colors.text} />
                </InputAdornment>
              )


            }}
          />
        </Box>
      </header>

      {/* Kategori Carousel (Arama yoksa göster) */}
      {!searchTerm.trim() && (
        <Box sx={{ position: 'relative', px: 4, mt: 2 }}>
          <div className="overflow-hidden" ref={emblaRef}>
            <div className="flex gap-3"> {/* gap-3 ile boşluk verdik */}
              {restaurant.categories
                ?.slice()
                .sort((a, b) => (a.display_order || 0) - (b.display_order || 0))
                .map(category => (
                  <CategorySlide key={category.id} category={category} isSelected={selectedCategoryId === category.id} onClick={() => setSelectedCategoryId(category.id)} />
                ))}
            </div>
          </div>
          {/* YENİ KAYDIRMA OKLARI */}
          <IconButton onClick={scrollPrev}
            sx={{
              position: 'absolute',
              left: 0,
              top: '50%',
              transform: 'translateY(-50%)',
              bgcolor: 'rgba(255,255,255,0.5)',
              color: 'black'
            }}>
            <ChevronLeft />
          </IconButton>
          <IconButton onClick={scrollNext}
            sx={{
              position: 'absolute',
              right: 0,
              top: '50%',
              transform: 'translateY(-50%)',
              bgcolor: 'rgba(255,255,255,0.5)',
              color: 'black'
            }}><ChevronRight />
          </IconButton>
        </Box>
      )}

      {/* Ürünler Grid */}
      <Box sx={{ p: 2, mt: 4 }}>
        <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 3 }}>
          {searchTerm.trim() ? 'Arama Sonuçları' : selectedCategoryName}
        </Typography>
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 2 }}>
          {/* Arama varsa filtrelenmişi, yoksa seçili kategoriyi göster */}
          {filteredCategories && (searchTerm.trim() ? filteredCategories?.flatMap(c => c.products || []) : displayedProducts)
            .map(product => (
              <ProductItem key={product.id} product={product} onAddToCart={handleAddToCartClick} plan={restaurant.plan} />
            ))}
        </Box>
      </Box>
      {selectedProduct && (
        <ProductWithOptionsModal
          product={selectedProduct}
          open={!!selectedProduct}
          onClose={() => setSelectedProduct(null)}
        />
      )}
      <CartFab onClick={() => setCartOpen(true)} />
      <CartDrawer open={isCartOpen} onClose={() => setCartOpen(false)} />
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