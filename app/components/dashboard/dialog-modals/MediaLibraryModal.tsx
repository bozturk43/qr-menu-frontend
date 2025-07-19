// app/components/dashboard/MediaLibraryModal.tsx
'use client';

import { useEffect, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import Cookies from 'js-cookie';
import { getMyMediaFiles, uploadFile } from '@/app/lib/api';
import type { StrapiMedia } from '@/app/types/strapi';
import {
    Dialog, DialogTitle, DialogContent, DialogActions, Tabs, Tab, Box,
    CircularProgress, ImageList, ImageListItem, ImageListItemBar, IconButton, Button, Alert,
    TextField
} from '@mui/material';
import { CheckCircle } from '@mui/icons-material';
import { getStrapiMedia } from '@/app/lib/utils';
import { useSnackbar } from '@/app/context/SnackBarContext';
import { getStockImages } from '@/app/lib/api/stock-image.api';

interface MediaLibraryModalProps {
    open: boolean;
    onClose: () => void;
    onSelect: (media: StrapiMedia | StrapiMedia[]) => void;
    multiple: boolean;

}

// "Galerim" sekmesinin içeriğini yönetecek alt bileşen
function MyGalleryTab({ onImageSelect, selectedImages }: { onImageSelect: (file: StrapiMedia) => void, selectedImages: StrapiMedia[] }) {
    const { data: files, isLoading, isError } = useQuery({
        queryKey: ['my-media-files'],
        queryFn: () => getMyMediaFiles(Cookies.get('jwt')!),
    });
    const handleSelect = (file: StrapiMedia) => {
        onImageSelect(file);
    };
    if (isLoading) return <CircularProgress sx={{ display: 'block', mx: 'auto', my: 4 }} />;
    if (isError) return <Alert severity="error">Dosyalar yüklenirken bir hata oluştu.</Alert>;

    return (
        <ImageList cols={5} /*...*/ >
            {(files ?? []).map(file => {
                const isSelected = selectedImages.some(img => img.id === file.id);
                return (
                    <ImageListItem key={file.id} onClick={() => handleSelect(file)} /*...*/ >
                        <img src={getStrapiMedia(file)} /*...*/ />
                        {/* Seçim göstergesi artık Checkbox veya başka bir ikon olabilir */}
                        {isSelected && (
                            <ImageListItemBar
                                position="top"
                                actionIcon={<IconButton sx={{ color: 'white' }}><CheckCircle color="success" /></IconButton>}
                            />
                        )}
                    </ImageListItem>
                );
            })}
        </ImageList>
    );
}
function UploadNewTab({ onUploadComplete }: { onUploadComplete: (file: StrapiMedia) => void }) {
    const [isUploading, setUploading] = useState(false);
    const { showSnackbar } = useSnackbar();
    // queryClient'ı da alalım ki galeriyi tazeleyebilelim
    const queryClient = useQueryClient();

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files.length > 0) {
            const file = event.target.files[0];
            setUploading(true);
            try {
                const token = Cookies.get('jwt');
                if (!token) throw new Error('Not authenticated');

                // uploadFile'dan dönen verinin tek bir obje olduğunu varsayıyoruz
                // Genellikle tek dosya yüklemede Strapi dizi içinde tek obje döndürür.
                // Biz de ilk elemanı alıyoruz.
                const uploadedFiles = await uploadFile(file, token);

                // DEĞİŞİKLİK BURADA:
                // Dönen verinin bir dizi ve içinde en az bir eleman olduğundan emin oluyoruz.
                if (Array.isArray(uploadedFiles) && uploadedFiles.length > 0) {
                    const newFile = uploadedFiles[0];
                    showSnackbar('Dosya başarıyla yüklendi!', 'success');

                    // "Galerim" sekmesindeki veriyi tazelemek için query'yi geçersiz kıl
                    queryClient.invalidateQueries({ queryKey: ['my-media-files'] });

                    onUploadComplete(newFile); // Yüklenen dosyayı ana modal'a geri döndür
                } else {
                    throw new Error('Dosya yüklendi ancak sunucudan geçerli bir yanıt alınamadı.');
                }
            } catch (error) {
                showSnackbar((error as Error).message, 'error');
            } finally {
                setUploading(false);
            }
        }
    };

    return (
        <Box sx={{ p: 4, textAlign: 'center' }}>
            <Button variant="contained" component="label" disabled={isUploading}>
                {isUploading ? 'Yükleniyor...' : 'Bilgisayardan Dosya Seç'}
                <input type="file" hidden onChange={handleFileChange} />
            </Button>
        </Box>
    );
}
function StockGalleryTab({ onImageSelect, selectedImageId }: {
    onImageSelect: (file: StrapiMedia) => void,
    selectedImageId: number | null
}) {
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');

    // Kullanıcı yazmayı bıraktıktan sonra arama yapmak için (performans)
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedSearchTerm(searchTerm);
        }, 500); // 500ms bekle

        return () => clearTimeout(handler);
    }, [searchTerm]);

    const { data: stockImages, isLoading, isError } = useQuery({
        queryKey: ['stock-images', debouncedSearchTerm],
        queryFn: () => getStockImages(debouncedSearchTerm),
    });

    if (isError) return <Alert severity="error">Görseller yüklenirken bir hata oluştu.</Alert>;

    return (
        <Box sx={{ mt: 2 }}>
            <TextField
                fullWidth
                label="Görsel Ara (örn: çorba, kebap, içecek)"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
            />
            {isLoading ? <CircularProgress sx={{ display: 'block', mx: 'auto', my: 4 }} /> : (
                <ImageList cols={5} gap={8} sx={{ mt: 2, maxHeight: '45vh' }}>
                    {(stockImages ?? []).map(stockImage => {
                        if (!stockImage) return null;
                        return (
                            <ImageListItem
                                key={stockImage.id}
                                onClick={() => onImageSelect(stockImage)}
                                sx={{
                                    cursor: 'pointer',
                                    border: selectedImageId === stockImage.id ? '3px solid' : '2px solid transparent',
                                    borderColor: 'primary.main',
                                }}
                            >
                                <img src={getStrapiMedia(stockImage)} alt={stockImage.alternativeText || stockImage.name} loading="lazy" />
                                {selectedImageId === stockImage.id && (
                                    <ImageListItemBar
                                        position="top"
                                        actionIcon={<IconButton sx={{ color: 'white' }}><CheckCircle color="success" /></IconButton>}
                                    />
                                )}
                            </ImageListItem>
                        );
                    })}
                </ImageList>
            )}
        </Box>
    );
}

export default function MediaLibraryModal({ open, onClose, onSelect, multiple = false }: MediaLibraryModalProps) {
    const queryClient = useQueryClient(); // QueryClient hook'unu çağır

    const [tab, setTab] = useState(0);
    const [selectedImages, setSelectedImages] = useState<StrapiMedia[]>([]);

    const handleToggleSelection = (image: StrapiMedia) => {
        setSelectedImages(prev => {
            // Eğer çoklu seçim aktif değilse, her zaman sadece son seçileni tut
            if (!multiple) {
                return [image];
            }
            // Çoklu seçim aktifse...
            const isSelected = prev.some(img => img.id === image.id);
            if (isSelected) {
                // Zaten seçiliyse, listeden çıkar
                return prev.filter(img => img.id !== image.id);
            } else {
                // Seçili değilse, listeye ekle
                return [...prev, image];
            }
        });
    };

    const handleSelectAndClose = () => {
        if (selectedImages.length > 0) {
            // Eğer çoklu seçim ise diziyi, değilse ilk elemanı gönder
            const selection = multiple ? selectedImages : selectedImages[0];
            onSelect(selection);
            handleClose();
        }
    };

    const handleClose = () => {
        setSelectedImages([]);
        onClose();
    }
    const handleUploadAndSelect = (newFile: StrapiMedia) => {
        // 1. "Galerim" sekmesinin cache'ini temizle ki yeni resmi görsün
        queryClient.invalidateQueries({ queryKey: ['my-media-files'] });
        // 2. Bu yeni resmi seç ve modalı kapat
        onSelect(newFile);
        setTab(0);
    };

    return (
        <Dialog open={open} onClose={handleClose} fullWidth maxWidth="md">
            <DialogTitle>Medya Kütüphanesi</DialogTitle>
            <DialogContent>
                <Tabs value={tab} onChange={(e, newValue) => setTab(newValue)} sx={{ borderBottom: 1, borderColor: 'divider' }}>
                    <Tab label="Galerim" />
                    <Tab label="Stok Görseller" />
                    <Tab label="Yeni Yükle" />
                </Tabs>

                {tab === 0 && (
                    <MyGalleryTab
                        onImageSelect={handleToggleSelection}
                        selectedImages={selectedImages}
                    />
                )}
                {tab === 1 && <StockGalleryTab onImageSelect={handleToggleSelection} selectedImageId={selectedImages[0]?.id || null} />}
                {tab === 2 && <UploadNewTab onUploadComplete={handleUploadAndSelect} />}

            </DialogContent>
            <DialogActions>
                <Button onClick={handleClose}>İptal</Button>
                <Button onClick={handleSelectAndClose} disabled={selectedImages.length === 0} variant="contained">
                    {selectedImages.length > 0 ? `${selectedImages.length} Öğe Seç` : 'Seç'}
                </Button>
            </DialogActions>
        </Dialog>
    );
}