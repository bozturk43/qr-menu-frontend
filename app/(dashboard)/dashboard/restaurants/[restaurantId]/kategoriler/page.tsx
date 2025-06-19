// app/(dashboard)/restaurants/[restaurantId]/kategoriler/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams } from 'next/navigation';
import Cookies from 'js-cookie';
import type { Category } from '@/app/types/strapi';
import AddCategoryModal from '@/app/components/dashboard/dialog-modals/AddCategoryModal';
// API Fonksiyonları
import { getRestaurantById } from '@/app/lib/api/restaurant.api';
import { deleteCategory, updateCategoryOrder } from '@/app/lib/api/category.api';
// Drag and Drop Kütüphanesi
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
// MUI ve İkonlar
import { Box, Typography, Button, Paper, List, ListItem, ListItemText, IconButton, CircularProgress, Alert, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions } from '@mui/material';
import { Add, DragHandle as DragHandleIcon, Delete, Edit } from '@mui/icons-material';
import EditCategoryModal from '@/app/components/dashboard/dialog-modals/EditCategoryModal';
import { useSnackbar } from '@/app/context/SnackBarContext';

// Sürüklenebilir her bir kategori satırını temsil eden bileşen
function SortableCategoryItem({ category, onEdit, onDelete }: { category: Category, onEdit: (category: Category) => void, onDelete: (category: Category) => void }) {
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
                    <Edit fontSize="small" onClick={() => onEdit(category)} />
                </IconButton>
                <IconButton aria-label="delete" color="error" onClick={() => onDelete(category)}>
                    <Delete fontSize="small" />
                </IconButton>
            </ListItem>
        </Paper>
    );
}


export default function CategoriesPage() {
    const params = useParams();
    const {showSnackbar} = useSnackbar();
    const queryClient = useQueryClient();
    const restaurantId = params.restaurantId as string;
    // Sıralanabilir kategorileri tutmak için lokal bir state
    const [categories, setCategories] = useState<Category[]>([]);
    const [editingCategory, setEditingCategory] = useState<Category | null>(null);
    const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);

    const deleteCategoryMutation = useMutation({
        mutationFn: (categoryId: number) => deleteCategory(categoryId, Cookies.get('jwt')!),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['restaurant', restaurantId] });
            setCategoryToDelete(null); // Onay kutusunu kapat
        },
        onError: (error) => {
            showSnackbar(`Hata: ${error.message}`,'error');
            setCategoryToDelete(null); // Hata sonrası onay kutusunu yine de kapat

        }
    });

    // Modal (pop-up) yönetimi için state'ler
    const [isModalOpen, setModalOpen] = useState(false);
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

    // Edit modal'ını açacak fonksiyon
    const handleOpenEditModal = (category: Category) => {
        setEditingCategory(category);
    };

    // Edit modal'ını kapatacak fonksiyon
    const handleCloseEditModal = () => {
        setEditingCategory(null);
    };

    // Silme onay kutusunu açan fonksiyon
    const handleOpenDeleteConfirm = (category: Category) => {
        setCategoryToDelete(category);
    };

    // Silme işlemini başlatan fonksiyon
    const handleDeleteConfirm = () => {
        if (categoryToDelete) {
            deleteCategoryMutation.mutate(categoryToDelete.id);
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
                                <SortableCategoryItem
                                    key={category.id}
                                    category={category}
                                    onEdit={handleOpenEditModal}
                                    onDelete={handleOpenDeleteConfirm}
                                />
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
            {editingCategory && (
                <EditCategoryModal
                    open={!!editingCategory}
                    onClose={handleCloseEditModal}
                    category={editingCategory}
                    restaurantId={restaurantId}
                />
            )}
            <Dialog
                open={!!categoryToDelete}
                onClose={() => setCategoryToDelete(null)}
            >
                <DialogTitle>Kategoriyi Silmeyi Onayla</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Emin misiniz? **"{categoryToDelete?.name}"** adlı kategori kalıcı olarak silinecektir. Bu işlem geri alınamaz.
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setCategoryToDelete(null)}>İptal</Button>
                    <Button
                        onClick={handleDeleteConfirm}
                        color="error"
                        disabled={deleteCategoryMutation.isPending}
                    >
                        {deleteCategoryMutation.isPending ? 'Siliniyor...' : 'Evet, Sil'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}