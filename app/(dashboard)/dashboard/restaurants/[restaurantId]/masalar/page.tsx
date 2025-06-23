// app/(dashboard)/restaurants/[restaurantId]/masalar/page.tsx
'use client';

import { useQuery } from '@tanstack/react-query';
import { useParams } from 'next/navigation';
import Cookies from 'js-cookie';
import { getRestaurantById } from '@/app/lib/api';

// MUI & İkonlar
import { Box, Typography, Button, Paper, CircularProgress, Alert, List, ListItem, ListItemText, IconButton } from '@mui/material';
import { Add, QrCode2 as QrCodeIcon, Edit, Delete } from '@mui/icons-material';

export default function TablesPage() {
  const params = useParams();
  const restaurantId = params.restaurantId as string;

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
        <Button variant="contained" color="secondary" startIcon={<Add />}>
          Yeni Masa Ekle
        </Button>
      </Box>

      <Paper elevation={3}>
        <List>
          {restaurant.tables?.map(table => (
            <ListItem 
              key={table.id}
              secondaryAction={
                <Box>
                  <IconButton edge="end" aria-label="qr-code">
                    <QrCodeIcon />
                  </IconButton>
                  <IconButton edge="end" aria-label="edit">
                    <Edit />
                  </IconButton>
                  <IconButton edge="end" aria-label="delete">
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
    </Box>
  );
}