// app/components/menu/ProductWithOptionsModal.tsx
'use client';

import { useState, useMemo } from 'react';
import type { Product, Option } from '@/app/types/strapi';
import { useCartStore, CartItem } from '@/app/stores/cartStore';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Box, Typography, RadioGroup, FormControlLabel, Radio, Checkbox, FormGroup } from '@mui/material';

interface ModalProps {
  product: Product;
  open: boolean;
  onClose: () => void;
}

export default function ProductWithOptionsModal({ product, open, onClose }: ModalProps) {
  const addToCart = useCartStore((state) => state.addToCart);
  // Seçilen varyasyonları tutmak için bir state
  const [selections, setSelections] = useState<Record<string, any>>({});

  // Seçim değiştikçe çalışacak fonksiyon
  const handleSelectionChange = (groupTitle: string, option: Option, type: 'single' | 'multiple') => {
    setSelections(prev => {
      const newSelections = { ...prev };
      if (type === 'single') {
        newSelections[groupTitle] = option;
      } else {
        const currentGroup = (newSelections[groupTitle] as Option[]) || [];
        const isSelected = currentGroup.some(o => o.id === option.id);
        if (isSelected) {
          newSelections[groupTitle] = currentGroup.filter(o => o.id !== option.id);
        } else {
          newSelections[groupTitle] = [...currentGroup, option];
        }
      }
      return newSelections;
    });
  };

  // Fiyatı anlık olarak hesapla
  const finalPrice = useMemo(() => {
    let price = product.price;
    Object.values(selections).forEach(selection => {
      if (Array.isArray(selection)) {
        selection.forEach(option => price += option.price_adjustment);
      } else if (selection) {
        price += (selection as Option).price_adjustment;
      }
    });
    return price;
  }, [product.price, selections]);

  // Sepete ekleme fonksiyonu
  const handleAddToCart = () => {
    const selectedVariations = Object.entries(selections).flatMap(([groupTitle, optionOrOptions]) => {
      if(Array.isArray(optionOrOptions)) {
        return optionOrOptions.map(option => ({ groupTitle, option }));
      }
      return { groupTitle, option: optionOrOptions as Option };
    });
    
    const newItem: CartItem = {
      product,
      quantity: 1,
      selectedVariations,
      uniqueId: `${product.id}-${JSON.stringify(selections)}-${Date.now()}`
    };
    addToCart(newItem);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle>{product.name}</DialogTitle>
      <DialogContent>
        {product.variations?.map(group => (
          <Box key={group.id} my={2}>
            <Typography variant="h6">{group.title}</Typography>
            {group.type === 'single' ? (
              <RadioGroup onChange={(e) => handleSelectionChange(group.title, JSON.parse(e.target.value), 'single')}>
                {group.options.map(option => (
                  <FormControlLabel key={option.id} value={JSON.stringify(option)} control={<Radio />} label={`${option.name} (+${option.price_adjustment} TL)`} />
                ))}
              </RadioGroup>
            ) : (
              <FormGroup>
                {group.options.map(option => (
                  <FormControlLabel key={option.id} control={<Checkbox onChange={() => handleSelectionChange(group.title, option, 'multiple')}/>} label={`${option.name} (+${option.price_adjustment} TL)`} />
                ))}
              </FormGroup>
            )}
          </Box>
        ))}
      </DialogContent>
      <DialogActions>
        <Typography variant="h6" sx={{flexGrow: 1, fontWeight: 'bold'}}>{finalPrice} TL</Typography>
        <Button onClick={onClose}>İptal</Button>
        <Button onClick={handleAddToCart} variant="contained">Sepete Ekle</Button>
      </DialogActions>
    </Dialog>
  );
}