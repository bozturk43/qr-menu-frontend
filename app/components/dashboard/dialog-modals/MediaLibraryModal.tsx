// app/components/dashboard/MediaLibraryModal.tsx
'use client';

import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import Cookies from 'js-cookie';
import { getMyMediaFiles, uploadFile } from '@/app/lib/api';
import type { StrapiMedia } from '@/app/types/strapi';
import {
    Dialog, DialogTitle, DialogContent, DialogActions, Tabs, Tab, Box,
    CircularProgress, ImageList, ImageListItem, ImageListItemBar, IconButton, Button, Alert,
    Typography
} from '@mui/material';
import { CheckCircle } from '@mui/icons-material';
import { getStrapiMedia } from '@/app/lib/utils';
import { useSnackbar } from '@/app/context/SnackBarContext';

interface MediaLibraryModalProps {
    open: boolean;
    onClose: () => void;
    onSelect: (media: StrapiMedia) => void;
}

// "Galerim" sekmesinin içeriğini yönetecek alt bileşen
function MyGalleryTab({ onImageSelect, selectedImageId }: { onImageSelect: (file: StrapiMedia) => void, selectedImageId: number | null }) {
    const { data: files, isLoading, isError } = useQuery({
        queryKey: ['my-media-files'],
        queryFn: () => getMyMediaFiles(Cookies.get('jwt')!),
    });
    console.log(files);
    if (isLoading) return <CircularProgress sx={{ display: 'block', mx: 'auto', my: 4 }} />;
    if (isError) return <Alert severity="error">Dosyalar yüklenirken bir hata oluştu.</Alert>;

    return (
        <ImageList cols={5} gap={8} sx={{ mt: 2, maxHeight: '50vh' }}>
            {(files ?? []).map(file => {
                const displayMedia = file.formats?.thumbnail
                    ? { ...file, url: file.formats.thumbnail.url }
                    : file;
                return (
                    <ImageListItem
                        key={file.id}
                        onClick={() => onImageSelect(file)}
                        sx={{
                            cursor: 'pointer',
                            border: selectedImageId === file.id ? '3px solid' : '2px solid transparent',
                            borderColor: 'primary.main',
                            borderRadius: 1,
                            overflow: 'hidden'
                        }}
                    >
                        <img src={getStrapiMedia(displayMedia)} alt={file.alternativeText || file.name} loading="lazy" />
                        {selectedImageId === file.id && (
                            <ImageListItemBar
                                sx={{ bgcolor: 'rgba(0,0,0,0.7)' }}
                                position="top"
                                actionIcon={<IconButton sx={{ color: 'white' }}><CheckCircle color="success" /></IconButton>}
                            />
                        )}
                    </ImageListItem>
                )
            })}
        </ImageList>
    );
}
// app/components/dashboard/MediaLibraryModal.tsx

// ...

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

export default function MediaLibraryModal({ open, onClose, onSelect }: MediaLibraryModalProps) {
    const queryClient = useQueryClient(); // QueryClient hook'unu çağır

    const [tab, setTab] = useState(0);
    const [selectedImage, setSelectedImage] = useState<StrapiMedia | null>(null);

    const handleSelectAndClose = () => {
        if (selectedImage) {
            onSelect(selectedImage);
            onClose();
            setSelectedImage(null); // Modalı bir sonrakine hazırla
        }
    };

    const handleClose = () => {
        setSelectedImage(null);
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

                {tab === 0 && <MyGalleryTab onImageSelect={setSelectedImage} selectedImageId={selectedImage?.id || null} />}
                {tab === 1 && <Box sx={{ p: 4, textAlign: 'center' }}><Typography>Stok görseller özelliği yakında!</Typography></Box>}
                {tab === 2 && <UploadNewTab onUploadComplete={handleUploadAndSelect} />}

            </DialogContent>
            <DialogActions>
                <Button onClick={handleClose}>İptal</Button>
                <Button onClick={handleSelectAndClose} disabled={!selectedImage} variant="contained">
                    Seç
                </Button>
            </DialogActions>
        </Dialog>
    );
}