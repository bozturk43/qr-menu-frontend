'use client';

import { useState, useMemo } from 'react';
import type { Restaurant, Category, Product } from '@/app/types/strapi';
import { Box, Typography, Avatar, Card, CardActionArea, CardMedia, CardContent, Button, Paper, IconButton, ToggleButtonGroup, ToggleButton, Chip } from '@mui/material';
import { getStrapiMedia } from '@/app/lib/utils';
import Image from 'next/image'; // Next.js'in optimize edilmiş resim bileşeni

// TODO: Bu bileşenleri daha sonra merkezi bir yere taşıyabiliriz.
import ProductWithOptionsModal from '@/app/components/menu/ProductWithOptionsModal';
import CartFab from '@/app/components/menu/CartFab';
import CartDrawer from '@/app/components/menu/CartDrawer';
import { useCartStore } from '@/app/stores/cartStore';
import { ArrowBack, ViewList, ViewModule, Wifi, YouTube } from '@mui/icons-material';


// Ana Tema Bileşeni
export default function GourmetTheme({ restaurant }: { restaurant: Restaurant }) {
    // --- STATE YÖNETİMİ ---
    const [view, setView] = useState<'categories' | 'products'>('categories');
    const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
    const [productWithOptions, setProductWithOptions] = useState<Product | null>(null);
    const [isCartOpen, setCartOpen] = useState(false);
    const addToCart = useCartStore(state => state.addToCart);
    const [productLayout, setProductLayout] = useState<'list' | 'grid'>('grid');


    // --- STİL HESAPLAMALARI ---
    const finalStyles = useMemo(() => ({
        // ... (ModernTheme'deki gibi renk ve font override mantığı) ...
        primaryColor: restaurant.primary_color_override || '#FFAA00',
        textColor: restaurant.text_color_override || '#333333',
        // ...
    }), [restaurant]);

    const handleCategoryClick = (category: Category) => { setView('products'); setSelectedCategoryId(category.id); };
    const handleBackToCategories = () => setView('categories');


    const handleAddToCartClick = (product: Product) => {
        if (product.variations && product.variations.length > 0) {
            setProductWithOptions(product);
        } else {
            addToCart({ product, quantity: 1, selectedVariations: [], uniqueId: `${product.id}-${Date.now()}` });
        }
    };
    const displayedProducts = useMemo(() => {
        if (!selectedCategoryId) return [];
        return restaurant.categories?.find(c => c.id === selectedCategoryId)?.products || [];
    }, [selectedCategoryId, restaurant.categories]);

    return (
        <Box sx={{ bgcolor: '#F4F4F4', minHeight: '100vh' }}>
            {/* Header Alanı */}


            {view === 'categories' ? (
                // KATEGORİ EKRANI HEADER'I (BÜYÜK VE GÖRSELLİ)
                <Paper
                    elevation={4}
                    sx={{
                        position: 'relative', // İçindeki absolute konumlandırma için
                        borderRadius: '0 0 24px 24px', // Alt köşeleri yuvarlat
                        overflow: 'hidden', // Taşan resmin gizlenmesi için
                        p: 3,
                    }}
                >
                    {/* Arka Plan Resmi */}
                    <Image
                        src="/menu-hero.jpg" // public klasöründeki resmin yolu
                        alt="Arka Plan"
                        layout="fill"
                        objectFit="cover"
                        quality={80}
                        style={{
                            zIndex: 0,
                            transform: 'scale(1.1)' // Kenarlarda boşluk kalmaması için
                        }}
                    />
                    {/* Gradient Overlay */}
                    <Box sx={{
                        position: 'absolute',
                        top: 0, left: 0, width: '100%', height: '100%',
                        background: 'linear-gradient(to bottom, rgba(0,0,0,0.4), rgba(0,0,0,0.7))',
                        zIndex: 1,
                    }} />

                    {/* Header İçeriği */}
                    <Box sx={{ position: 'relative', zIndex: 2, color: 'white' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Avatar
                                src={getStrapiMedia(restaurant.logo)}
                                variant="rounded"
                                sx={{ width: 80, height: 80, border: '3px solid white' }}
                            >
                                {restaurant.name.charAt(0)}
                            </Avatar>
                            <Box>
                                <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold' }}>
                                    {restaurant.name}
                                </Typography>
                                <Typography variant="body1">
                                    {"0542 543 54 43"}
                                </Typography>
                            </Box>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 2 }}>
                            {/* {restaurant.link_whatsapp && <IconButton href={restaurant.link_whatsapp} target="_blank" sx={{ color: 'white' }}><WhatsApp /></IconButton>} */}
                            {/* {restaurant.link_instagram && <IconButton href={restaurant.link_instagram} target="_blank" sx={{ color: 'white' }}><Instagram /></IconButton>} */}
                            {<IconButton href={"www.youtube.com"} target="_blank" sx={{ color: 'white' }}><YouTube /></IconButton>}
                        </Box>
                        {
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 2, p: 1, bgcolor: 'rgba(255,255,255,0.1)', borderRadius: '8px' }}>
                                <Wifi sx={{ fontSize: '1.2rem' }} />
                                <Typography variant="body2">Wi-Fi Şifresi: <strong>{"q1w2e3r4t5"}</strong></Typography>
                            </Box>
                        }
                    </Box>
                </Paper>
            ) : (
                // ÜRÜN EKRANI HEADER'I (KÜÇÜK VE İŞLEVSEL)
                <Paper elevation={3} sx={{ position: 'sticky', top: 0, zIndex: 10, bgcolor: 'white' }}>
                    <Box sx={{ p: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Button onClick={handleBackToCategories} startIcon={<ArrowBack />}>
                            Kategoriler
                        </Button>
                        <ToggleButtonGroup
                            value={productLayout}
                            exclusive
                            onChange={(e, newLayout) => { if (newLayout) setProductLayout(newLayout); }}
                            aria-label="görünüm"
                            size="small"
                        >
                            <ToggleButton value="list" aria-label="liste görünümü"><ViewList /></ToggleButton>
                            <ToggleButton value="grid" aria-label="grid görünümü"><ViewModule /></ToggleButton>
                        </ToggleButtonGroup>
                    </Box>
                </Paper>
            )}

            <main className="p-4">
                {/* Kategori Görünümü */}
                {view === 'categories' ? (
                    <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 2 }}>
                        {restaurant.categories?.map(category => (
                            <Card key={category.id}>
                                <CardActionArea onClick={() => handleCategoryClick(category)}>
                                    <CardMedia component="img" height="120" image={getStrapiMedia(category.image)} alt={category.name} />
                                    <Box sx={{ position: 'absolute', bottom: 0, left: 0, width: '100%', bgcolor: 'rgba(0,0,0,0.5)', color: 'white', p: 1 }}>
                                        <Typography variant="h6" align="center">{category.name}</Typography>
                                    </Box>
                                </CardActionArea>
                            </Card>
                        ))}
                    </Box>
                ) : (
                    <Box>
                        {/* Kategori Slider'ı (her zaman görünür) */}
                        <Box sx={{ overflowX: 'auto', whiteSpace: 'nowrap', pb: 1, mb: 3, '&::-webkit-scrollbar': { display: 'none' } }}>
                            {restaurant.categories?.map(category => (
                                <Chip key={category.id} label={category.name} onClick={() => setSelectedCategoryId(category.id)} variant={selectedCategoryId === category.id ? 'filled' : 'outlined'} color="primary" sx={{ mr: 1, p: 2 }} />
                            ))}
                        </Box>
                        {/* Ürün Listesi (Görünüm state'ine göre değişir) */}
                        <Box sx={{
                            display: 'grid',
                            gridTemplateColumns: productLayout === 'grid' ? 'repeat(auto-fill, minmax(180px, 1fr))' : '1fr',
                            gap: 2
                        }}>
                            {displayedProducts.map(product => (
                                productLayout === 'grid'
                                    ? <ProductGridItem key={product.id} product={product} styles={finalStyles} onAddToCart={() => {handleAddToCartClick(product) }} />
                                    : <ProductRow key={product.id} product={product} styles={finalStyles} onAddToCart={() => {handleAddToCartClick(product) }} />
                            ))}
                        </Box>
                    </Box>
                )

                }
            </main>

            {/* Global Bileşenler */}
            <CartFab onClick={() => setCartOpen(true)} />
            <CartDrawer open={isCartOpen} onClose={() => setCartOpen(false)} />
            {productWithOptions && (
                <ProductWithOptionsModal
                    product={productWithOptions}
                    open={!!productWithOptions}
                    onClose={() => setProductWithOptions(null)}
                />
            )}
        </Box>
    );
}

const ProductGridItem = ({ product, styles, onAddToCart }: { product: Product, styles: any, onAddToCart: () => void }) => (
    <Card sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        <CardMedia component="img" height="140" image={getStrapiMedia(product.images?.[0])} alt={product.name} />
        <CardContent sx={{ flexGrow: 1 }}>
            <Typography gutterBottom variant="h6" component="div" sx={{fontFamily: styles.productTitleFont, fontWeight: 'bold'}}>{product.name}</Typography>
            <Typography variant="body2" color="text.secondary" sx={{fontFamily: styles.productDescriptionFont}}>{product.description}</Typography>
        </CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2, pt: 0 }}>
            <Typography variant="h6" sx={{fontFamily: styles.productTitleFont, fontWeight: 'bold', color: styles.primaryColor}}>{product.price} TL</Typography>
            <Button size="small" variant="contained" onClick={onAddToCart}>Ekle</Button>
        </Box>
    </Card>
);

const ProductRow = ({ product, styles, onAddToCart }: { product: Product, styles: any, onAddToCart: () => void }) => (
    <Card sx={{ display: 'flex', mb: 2, boxShadow: 3 }}>
        <CardMedia component="img" sx={{ width: 120, height: 120 }} image={getStrapiMedia(product.images?.[0])} alt={product.name}/>
        <Box sx={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
            <CardContent>
                <Typography component="div" variant="h6" sx={{ fontFamily: styles.productTitleFont, fontWeight: 'bold' }}>{product.name}</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ fontFamily: styles.productDescriptionFont, my: 0.5 }}>{product.description}</Typography>
            </CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2, pt: 0 }}>
                <Typography variant="h6" sx={{ fontFamily: styles.productTitleFont, fontWeight: 'bold', color: styles.primaryColor }}>{product.price} TL</Typography>
                <Button size="small" variant="contained" onClick={onAddToCart}>Ekle</Button>
            </Box>
        </Box>
    </Card>
);