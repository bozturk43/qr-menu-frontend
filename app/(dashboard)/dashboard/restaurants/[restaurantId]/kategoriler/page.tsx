// app/(dashboard)/restaurants/[restaurantId]/kategoriler/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams } from 'next/navigation';
import Cookies from 'js-cookie';
import type { Category, NewCategoryData } from '@/app/types/strapi';
import AddCategoryModal from '@/app/components/dashboard/dialog-modals/AddCategoryModal'; // Yeni modal bileşenimiz


// API Fonksiyonları
import { getRestaurantById } from '@/app/lib/api/restaurant.api';
import { createCategory, updateCategoryOrder, uploadFile } from '@/app/lib/api/category.api';

// Drag and Drop Kütüphanesi
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

// MUI ve İkonlar
import { Box, Typography, Button, Paper, List, ListItem, ListItemText, IconButton, TextField, Dialog, DialogTitle, DialogContent, DialogActions, CircularProgress, Alert, ListItemIcon } from '@mui/material';
import { Add, DragHandle as DragHandleIcon, Delete, Edit } from '@mui/icons-material';

// Sürüklenebilir her bir kategori satırını temsil eden bileşen
function SortableCategoryItem({ category }: { category: Category }) {
    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: category.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    return (
        <Paper ref={setNodeRef} style={style} elevation={2} sx={{ mb: 1, touchAction: 'none' }}>
            <ListItem>
                <IconButton {...attributes} {...listeners} sx={{ cursor: 'grab' }}>
                    <DragHandleIcon />
                </IconButton>
                <ListItemText primary={category.name} />
                <IconButton aria-label="edit">
                    <Edit fontSize="small" />
                </IconButton>
                <IconButton aria-label="delete" color="error">
                    <Delete fontSize="small" />
                </IconButton>
            </ListItem>
        </Paper>
    );
}


export default function CategoriesPage() {
    const params = useParams();
    const queryClient = useQueryClient();
    const restaurantId = params.restaurantId as string;
    const [selectedFile, setSelectedFile] = useState<File | null>(null); // RESİM DOSYASI İÇİN YENİ STATE

    // Sıralanabilir kategorileri tutmak için lokal bir state
    const [categories, setCategories] = useState<Category[]>([]);

    // Modal (pop-up) yönetimi için state'ler
    const [isModalOpen, setModalOpen] = useState(false);
    const [newCategoryName, setNewCategoryName] = useState('');

    // 1. VERİ ÇEKME: TanStack Query ile restoran ve kategori verilerini alıyoruz
    const { data: restaurant, isLoading, isError, error } = useQuery({
        queryKey: ['restaurant', restaurantId],
        queryFn: () => getRestaurantById(restaurantId, Cookies.get('jwt')!),
        enabled: !!restaurantId,
    });

    // useEffect ile sunucudan veri geldiğinde lokal state'imizi güncelliyoruz
    useEffect(() => {
        if (restaurant?.categories) {
            const sortedCategories = [...restaurant.categories].sort((a, b) => (a.display_order || 0) - (b.display_order || 0));
            setCategories(sortedCategories);
        }
    }, [restaurant]);

    // 2. VERİ GÜNCELLEME (SIRALAMA): Drag-drop sonrası sıralamayı API'ye gönderen mutation
    const updateOrderMutation = useMutation({
        mutationFn: (orderedCategories: { id: number; display_order: number }[]) =>
            updateCategoryOrder(orderedCategories, Cookies.get('jwt')!),
        onSuccess: () => {
            // Başarılı olursa, sunucudaki verinin güncel olduğundan emin olmak için cache'i tazele
            queryClient.invalidateQueries({ queryKey: ['restaurant', restaurantId] });
        },
    });

    // 3. VERİ OLUŞTURMA: Yeni kategori ekleyen mutation
    const createCategoryMutation = useMutation({
        mutationFn: async ({ name, file }: { name: string, file: File | null }) => {
            const token = Cookies.get('jwt');
            if (!token) throw new Error('Not authenticated');

            let imageId: number | undefined = undefined;

            // 1. Eğer dosya seçilmişse, önce onu yükle
            if (file) {
                imageId = await uploadFile(file, token);
            }

            // 2. Kategori verisini hazırla
            const newOrder = categories.length;
            const categoryData: NewCategoryData = {
                name: name,
                restaurant: +restaurantId,
                display_order: newOrder,
                image: imageId, // Varsa resim ID'sini ekle
            };

            // 3. Kategoriyi oluştur
            return createCategory(categoryData, token);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['restaurant', restaurantId] });
            setModalOpen(false);
            setNewCategoryName('');
            setSelectedFile(null); // Formu temizle
        }
    });

    // Drag-and-drop için sensörler
    const sensors = useSensors(useSensor(PointerSensor));

    // Sürükleme bittiğinde çalışacak fonksiyon
    function handleDragEnd(event: DragEndEvent) {
        const { active, over } = event;
        if (over && active.id !== over.id) {
            setCategories((items) => {
                const oldIndex = items.findIndex((item) => item.id === active.id);
                const newIndex = items.findIndex((item) => item.id === over.id);
                const newOrder = arrayMove(items, oldIndex, newIndex);

                const updatedOrderForApi = newOrder.map((item, index) => ({
                    id: item.id,
                    display_order: index,
                }));

                updateOrderMutation.mutate(updatedOrderForApi);
                return newOrder;
            });
        }
    }

    // Yeni kategori oluşturma formu gönderildiğinde
    const handleCreateCategory = () => {
        if (newCategoryName.trim()) {
            createCategoryMutation.mutate({ name: newCategoryName, file: selectedFile });
        }
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files.length > 0) {
            setSelectedFile(event.target.files[0]);
        }
    };

    if (isLoading) return <CircularProgress />;
    if (isError) return <Alert severity="error">{error.message}</Alert>;

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                <Typography variant="h5" component="h1" sx={{ fontWeight: 'bold' }}>
                    Kategori Yönetimi ({categories.length})
                </Typography>
                <Button variant="contained" color="secondary" startIcon={<Add />} onClick={() => setModalOpen(true)}>
                    Yeni Kategori Ekle
                </Button>
            </Box>

            {categories.length > 0 ? (
                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                    <SortableContext items={categories} strategy={verticalListSortingStrategy}>
                        <List>
                            {categories.map(category => (
                                <SortableCategoryItem key={category.id} category={category} />
                            ))}
                        </List>
                    </SortableContext>
                </DndContext>
            ) : (
                <Paper
                    variant="outlined"
                    sx={{
                        mt: 4,
                        p: 8,
                        textAlign: 'center',
                        borderColor: 'divider',
                        borderStyle: 'dashed'
                    }}
                >
                    <Typography variant="h6" color="text.secondary">
                        Henüz hiç kategori oluşturmadınız.
                    </Typography>
                    <Typography color="text.secondary" sx={{ mt: 1, mb: 2 }}>
                        Başlamak için "Yeni Kategori Ekle" butonuna tıklayın.
                    </Typography>
                    <Button
                        variant="contained"
                        color="secondary"
                        onClick={() => setModalOpen(true)}
                        startIcon={<Add />}
                    >
                        İlk Kategoriyi Oluştur
                    </Button>
                </Paper>
            )}
            <AddCategoryModal
                open={isModalOpen}
                onClose={() => setModalOpen(false)}
                restaurantId={restaurantId}
                currentCategoryCount={categories.length}
            />
        </Box>
    );
}