'use client';

import { useEffect, useState } from 'react'; // useState'i import ediyoruz
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useParams } from 'next/navigation';
import Cookies from 'js-cookie';
import { deleteProduct, getRestaurantById, updateProductOrder } from '@/app/lib/api';

// MUI & İkonlar
import {
    Box, Typography, Button, Paper, CircularProgress, Alert, Avatar,
    Accordion, AccordionSummary, AccordionDetails, // YENİ: Accordion bileşenlerini import ediyoruz
    Dialog,
    DialogTitle,
    DialogContent,
    DialogContentText,
    DialogActions,
    IconButton
} from '@mui/material';
import { Add, Delete, Edit, ExpandMore as ExpandMoreIcon, ArrowUpward, ArrowDownward } from '@mui/icons-material'; // Açılır-kapanır ikonu için
import { Category, Product, Restaurant } from '@/app/types/strapi';
import AddProductModal from '@/app/components/dashboard/dialog-modals/AddProductModal';
import EditProductModal from '@/app/components/dashboard/dialog-modals/EditProductModal';

export default function ProductsPage() {
    const params = useParams();
    const restaurantId = params.restaurantId as string;
    const queryClient = useQueryClient();
    const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337';

    // Hangi accordion panelinin açık olduğunu tutmak için state
    // İlk kategorinin ID'sini veya index'ini vererek varsayılan olarak açık gelmesini sağlayabiliriz.
    const [expanded, setExpanded] = useState<number | false>(false);
    const [isModalOpen, setModalOpen] = useState(false);
    const [productToEdit, setProductToEdit] = useState<{ product: Product; category: Category } | null>(null);
    const [categories, setCategories] = useState<Category[]>([]);
    const [productToDelete, setProductToDelete] = useState<Product | null>(null);


    const { data: restaurant, isLoading, isError, error } = useQuery({
        queryKey: ['restaurant', restaurantId],
        queryFn: () => getRestaurantById(restaurantId, Cookies.get('jwt')!),
        enabled: !!restaurantId,
    });

    const deleteProductMutation = useMutation({
        mutationFn: (productId: number) => deleteProduct(productId, Cookies.get('jwt')!),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['restaurant', restaurantId] });
            setProductToDelete(null); // Onay kutusunu kapat
        },
        onError: (error) => {
            alert(`Hata: ${error.message}`);
        }
    });
    const updateProductOrderMutation = useMutation({
        mutationFn: (orderedProducts: { id: number, display_order: number }[]) =>
            updateProductOrder(orderedProducts, Cookies.get('jwt')!),
        onSuccess: () => {
            // Başarılı olunca cache'i tazele ki sunucudan gelen son sıralama görünsün
            queryClient.invalidateQueries({ queryKey: ['restaurant', restaurantId] });
        },
    });

    useEffect(() => {
        if (restaurant?.categories && restaurant.categories.length > 0) {
            if (expanded === false) {
                setExpanded(restaurant.categories[0].id);
            }
        }
    }, [restaurant, expanded]);

    useEffect(() => {
        if (restaurant?.categories) {
            const sortedCategories = [...restaurant.categories].sort((a, b) => (a.display_order || 0) - (b.display_order || 0));
            setCategories(sortedCategories);
        }
    }, [restaurant]);

    const handleChange = (panelId: number) => (event: React.SyntheticEvent, isExpanded: boolean) => {
        setExpanded(isExpanded ? panelId : false);
    };
    const handleMoveProduct = (category_id: number, product_id: number, direction: 'up' | 'down') => {
        const categories = restaurant?.categories || [];
        const targetCategory = categories.find(c => c.id === category_id);
        if (!targetCategory || !targetCategory.products) return;

        const products = [...targetCategory.products].sort((a, b) => (a.display_order || 0) - (b.display_order || 0));
        const currentIndex = products.findIndex(p => p.id === product_id);

        if (currentIndex === -1) return;
        if (direction === 'up' && currentIndex === 0) return;
        if (direction === 'down' && currentIndex === products.length - 1) return;

        const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;

        // Diziyi yeniden sırala
        const [movedProduct] = products.splice(currentIndex, 1);
        products.splice(newIndex, 0, movedProduct);

        // API'ye gönderilecek yeni sıralama verisini oluştur
        const updatedOrderForApi = products.map((p, index) => ({
            id: p.id,
            display_order: index,
        }));

        // Mutasyonu tetikle
        updateProductOrderMutation.mutate(updatedOrderForApi);
    };
    const handleDeleteConfirm = () => {
        if (productToDelete) {
            deleteProductMutation.mutate(productToDelete.id);
        }
    };


    if (isLoading) return <CircularProgress />;
    if (isError) return <Alert severity="error">{(error as Error).message}</Alert>;
    if (!restaurant) return <Typography>Restoran bulunamadı.</Typography>;

    console.log(restaurant);

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                <Typography variant="h5" component="h1" sx={{ fontWeight: 'bold' }}>
                    {restaurant.name} - Ürünler
                </Typography>
                <Button variant="contained" color="secondary" startIcon={<Add />} onClick={() => setModalOpen(true)}>
                    Yeni Ürün Ekle
                </Button>
            </Box>

            {/* Kategorilere göre gruplanmış ürün listesi - ARTIK ACCORDION İLE */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {categories && categories.length > 0 ? (
                    categories.map(category => (
                        <Accordion
                            key={category.id}
                            // Hangi panelin açık olduğunu state'imizle kontrol ediyoruz
                            expanded={expanded === category.id}
                            // Tıklandığında state'i güncelleyecek fonksiyon
                            onChange={handleChange(category.id)}
                            elevation={2}
                        >
                            <AccordionSummary
                                expandIcon={<ExpandMoreIcon />}
                                aria-controls={`panel${category.id}-content`}
                                id={`panel${category.id}-header`}
                            >
                                <Typography variant="h6">{category.name}</Typography>
                            </AccordionSummary>
                            <AccordionDetails sx={{ backgroundColor: 'action.hover' }}>
                                {category.products && category.products.length > 0 ? (
                                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                        {category.products.sort((a, b) => (a.display_order || 0) - (b.display_order || 0))
                                            .map((product, index, arr) => (
                                                <Paper key={product.id} variant="outlined" sx={{ display: 'flex', alignItems: 'center', p: 2, gap: 2 }}>
                                                    <Avatar
                                                        variant="rounded"
                                                        src={product.images?.[0] ? `${STRAPI_URL}${product.images[0].url}` : undefined}
                                                        sx={{ width: 56, height: 56 }}
                                                    >
                                                        {product.name.charAt(0)}
                                                    </Avatar>
                                                    <Box sx={{ flexGrow: 1 }}>
                                                        <Typography sx={{ fontWeight: 'bold' }}>{product.name}</Typography>
                                                        <Typography variant="body2" color="text.secondary">{product.description}</Typography>
                                                    </Box>
                                                    <Typography sx={{ fontWeight: 'bold', minWidth: '80px', textAlign: 'right' }}>
                                                        {product.price} TL
                                                    </Typography>
                                                    <Box sx={{ display: 'flex', flexDirection: 'column', mr: 2 }}>
                                                        <IconButton size="small" onClick={() => handleMoveProduct(category.id, product.id, 'up')} disabled={index === 0}>
                                                            <ArrowUpward fontSize="inherit" />
                                                        </IconButton>
                                                        <IconButton size="small" onClick={() => handleMoveProduct(category.id, product.id, 'down')} disabled={index === arr.length - 1}>
                                                            <ArrowDownward fontSize="inherit" />
                                                        </IconButton>
                                                    </Box>
                                                    <Button size="small" variant="outlined" startIcon={<Edit />} onClick={() => setProductToEdit({ product, category })}>
                                                        Düzenle
                                                    </Button>
                                                    <Button size="small" variant="outlined" color="error" startIcon={<Delete />} onClick={() => setProductToDelete(product)}>
                                                        Sil
                                                    </Button>
                                                </Paper>
                                            ))}
                                    </Box>
                                ) : (
                                    <Typography variant="body2" color="text.secondary" sx={{ p: 2 }}>
                                        Bu kategoride henüz ürün yok.
                                    </Typography>
                                )}
                            </AccordionDetails>
                        </Accordion>
                    ))
                ) : (
                    <Typography>Önce bir kategori eklemelisiniz.</Typography>
                )}
            </Box>
            <AddProductModal
                open={isModalOpen}
                onClose={() => setModalOpen(false)}
                restaurantId={restaurantId}
                categories={restaurant.categories || []}
            />
            {productToEdit && (
                <EditProductModal
                    open={!!productToEdit}
                    onClose={() => setProductToEdit(null)}
                    product={productToEdit.product}
                    initialCategoryId={productToEdit.category.id}
                    categories={restaurant.categories || []}
                    restaurantId={restaurantId}
                />
            )}
            <Dialog
                open={!!productToDelete}
                onClose={() => setProductToDelete(null)}
            >
                <DialogTitle>Ürünü Silmeyi Onayla</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Emin misiniz? **"{productToDelete?.name}"** adlı ürün kalıcı olarak silinecektir.
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setProductToDelete(null)}>İptal</Button>
                    <Button
                        onClick={handleDeleteConfirm}
                        color="error"
                        disabled={deleteProductMutation.isPending}
                    >
                        {deleteProductMutation.isPending ? 'Siliniyor...' : 'Evet, Sil'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}