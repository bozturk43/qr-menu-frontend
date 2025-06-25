// app/components/menu/CartFab.tsx
'use client';

import { useCartStore } from '@/app/stores/cartStore';
import { Fab, Badge } from '@mui/material';
import { ShoppingCart } from 'lucide-react';

interface CartFabProps {
  onClick: () => void;
}

export default function CartFab({ onClick }: CartFabProps) {
  // Zustand store'undan toplam ürün sayısını alıyoruz.
  // Bu hook sayesinde, sepete her ürün eklendiğinde bu bileşen otomatik olarak güncellenir.
  const totalItems = useCartStore((state) => state.totalItems());

  // Eğer sepette ürün yoksa, butonu hiç gösterme
  if (totalItems === 0) {
    return null;
  }

  return (
    <Fab
      color="secondary"
      aria-label="sepeti göster"
      onClick={onClick}
      sx={{
        position: 'fixed', // Ekranın köşesine sabitle
        bottom: 16,
        right: 16,
        zIndex: 1300, // Diğer her şeyin üstünde olmasını sağlar
      }}
    >
      <Badge badgeContent={totalItems} color="primary">
        <ShoppingCart />
      </Badge>
    </Fab>
  );
}