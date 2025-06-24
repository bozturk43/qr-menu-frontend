// app/(dashboard)/restaurants/[restaurantId]/masalar/page.tsx
'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useParams } from 'next/navigation';
import Cookies from 'js-cookie';
import { deleteTable, getRestaurantById } from '@/app/lib/api';
import ReactDOMServer from 'react-dom/server'; // Bileşeni metne çevirmek için


// MUI & İkonlar
import { Box, Typography, Button, Paper, CircularProgress, Alert, List, ListItem, ListItemText, IconButton, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, ButtonGroup } from '@mui/material';
import { Add, QrCode2 as QrCodeIcon, Edit, Delete } from '@mui/icons-material';
import { useState } from 'react';
import AddTableModal from '@/app/components/dashboard/dialog-modals/AddTableModal';
import { Table } from '@/app/types/strapi';
import EditTableModal from '@/app/components/dashboard/dialog-modals/EditTableModal';
import Link from 'next/link'; // Link eklendi
import { QrCodeScanner } from '@mui/icons-material'; // Yeni ikon
import { QRCodeSVG } from 'qrcode.react'; // Kullandığımız kütüphaneden bileşeni alıyoruz



export default function TablesPage() {

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

  const params = useParams();
  const queryClient = useQueryClient();
  const restaurantId = params.restaurantId as string;
  const [isModalOpen, setModalOpen] = useState(false);
  const [tableToEdit, setTableToEdit] = useState<Table | null>(null);
  const [tableToDelete, setTableToDelete] = useState<Table | null>(null);


  // Veriyi TanStack Query'nin önbelleğinden alıyoruz.
  // Bu veri, layout'ta veya diğer sekmelerde zaten çekilmiş olabilir,
  // bu yüzden bu istek genellikle anında sonuç verir.
  const { data: restaurant, isLoading, isError, error } = useQuery({
    queryKey: ['restaurant', restaurantId],
    queryFn: () => {
      // Bu sorgunun populate ayarında 'masalar' ilişkisini de istediğimizden emin olmalıyız.
      // getRestaurantById fonksiyonunu kontrol edelim.
      return getRestaurantById(restaurantId, Cookies.get('jwt')!)
    },
    enabled: !!restaurantId,
  });

  const deleteMutation = useMutation({
    mutationFn: (tableId: number) => deleteTable(tableId, Cookies.get('jwt')!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['restaurant', restaurantId] });
      setTableToDelete(null);
    }
  });

  const handleDeleteConfirm = () => {
    if (tableToDelete) {
      deleteMutation.mutate(tableToDelete.id);
    }
  };

  const handleDownloadSingleQr = (table: { name: string; qr_code_identifier: string; }) => {
    const tableUrl = `${siteUrl}/menu/${restaurant?.slug}?table=${table.qr_code_identifier}`;

    try {
      // 1. QRCodeSVG bileşenini bir HTML metnine çeviriyoruz.
      // Bu, bize <svg>...</svg> şeklinde bir string verir.
      const qrCodeSvgString = ReactDOMServer.renderToString(
        <QRCodeSVG value={tableUrl} size={180} />
      );

      // 2. Kendi özel SVG şablonumuzu oluşturup, QR kodunu ve metni içine yerleştiriyoruz.
      const finalSvgString = `
        <svg width="200" height="230" xmlns="http://www.w3.org/2000/svg" style="background-color:white;">
          <g transform="translate(10, 10)">
            ${qrCodeSvgString}
          </g>
          <text x="100" y="215" font-family="Arial, sans-serif" font-size="16" font-weight="bold" text-anchor="middle" fill="black">
            ${table.name}
          </text>
        </svg>
      `;

      // 3. İndirme işlemini tetikliyoruz (bu kısım aynı).
      const blob = new Blob([finalSvgString], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${table.qr_code_identifier}.svg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

    } catch (err) {
      console.error('QR kod oluşturulurken hata oluştu', err);
      alert('QR kod oluşturulurken bir hata oluştu.');
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
          Masa Yönetimi ({restaurant.tables?.length || 0})
        </Typography>
        <ButtonGroup variant="contained" aria-label="outlined primary button group">
          <Button color="secondary" startIcon={<Add />} onClick={() => setModalOpen(true)}>
            Yeni Masa Ekle
          </Button>
          <Button
            component={Link}
            href={`/print/${restaurantId}`}
            startIcon={<QrCodeScanner />}
          >
            Tüm QR'ları Yazdır
          </Button>
        </ButtonGroup>
      </Box>

      <Paper elevation={3}>
        <List>
          {restaurant.tables?.map(table => (
            <ListItem
              key={table.id}
              secondaryAction={
                <Box>
                  <IconButton edge="end" aria-label="qr-code" onClick={() => handleDownloadSingleQr(table)}>
                    <QrCodeIcon />
                  </IconButton>
                  <IconButton edge="end" aria-label="edit" onClick={() => setTableToEdit(table)}>
                    <Edit />
                  </IconButton>
                  <IconButton edge="end" aria-label="delete" onClick={() => setTableToDelete(table)}>
                    <Delete />
                  </IconButton>
                </Box>
              }
            >
              <ListItemText
                primary={table.name}
                secondary={`QR ID: ${table.qr_code_identifier}`}
              />
            </ListItem>
          ))}
        </List>
      </Paper>
      <AddTableModal
        open={isModalOpen}
        onClose={() => setModalOpen(false)}
        restaurantId={restaurantId}
      />
      {tableToEdit && (
        <EditTableModal
          open={!!tableToEdit}
          onClose={() => setTableToEdit(null)}
          tableToEdit={tableToEdit}
          restaurantId={restaurantId}
        />
      )}
      <Dialog open={!!tableToDelete} onClose={() => setTableToDelete(null)}>
        <DialogTitle>Masayı Silmeyi Onayla</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Emin misiniz? **"{tableToDelete?.name}"** adlı masa kalıcı olarak silinecektir.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setTableToDelete(null)}>İptal</Button>
          <Button onClick={handleDeleteConfirm} color="error" disabled={deleteMutation.isPending}>
            {deleteMutation.isPending ? 'Siliniyor...' : 'Evet, Sil'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}