// app/(dashboard)/abonelik/yenile/RenewSubscriptionClientPage.tsx
'use client';

import { useState } from 'react'; // useState import ediyoruz
import type { Restaurant } from '@/app/types/strapi';
import { Box, Typography, Paper, Button, List, ListItem, ListItemText, Divider, Radio, RadioGroup, FormControlLabel, FormControl, FormLabel } from '@mui/material';
import { WarningAmber as WarningIcon, CreditCard } from '@mui/icons-material';

interface ClientPageProps {
  headerText: string;
  descriptionText: string;
  restaurantsToList: Restaurant[];
}

export default function RenewSubscriptionClientPage({
  headerText,
  descriptionText,
  restaurantsToList
}: ClientPageProps) {
  
  // YENİ: Seçilen restoranın ID'sini tutmak için bir state
  const [selectedRestaurantId, setSelectedRestaurantId] = useState<string | null>(
    // Eğer sadece tek bir restoran varsa, onu varsayılan olarak seçili yap
    restaurantsToList.length === 1 ? restaurantsToList[0].id.toString() : null
  );

  const handleSelectionChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedRestaurantId(event.target.value);
  };

  const handleRenewClick = () => {
    if (!selectedRestaurantId) {
      alert("Lütfen yenilemek için bir restoran seçin.");
      return;
    }
    // TODO: Bu ID ile ödeme sayfasına yönlendir
    alert(`Restoran ID: ${selectedRestaurantId} için ödeme adımına geçiliyor...`);
  };

  const showSelectionList = restaurantsToList.length > 1;

  return (
    <Box sx={{ maxWidth: 'md', mx: 'auto' }}>
      <Paper elevation={3} sx={{ p: 4, textAlign: 'center' }}>
        <WarningIcon color="warning" sx={{ fontSize: 60, mb: 2 }} />
        <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold' }}>
          {headerText}
        </Typography>
        <Typography color="text.secondary" sx={{ mt: 2, mb: 4 }}>
          {descriptionText}
          <br/>
          {showSelectionList && "Lütfen yenilemek istediğiniz restoranı seçin."}
        </Typography>
        
        {/* YENİ: Seçim Listesi Mantığı */}
        {showSelectionList ? (
          <FormControl component="fieldset" sx={{ width: '100%', mb: 4 }}>
            <RadioGroup
              aria-label="restaurant-selection"
              name="restaurant-selection-group"
              value={selectedRestaurantId}
              onChange={handleSelectionChange}
            >
              <List sx={{ bgcolor: 'action.hover', borderRadius: 2 }}>
                {restaurantsToList.map((r, index) => (
                    <Box key={r.id}>
                      <ListItem>
                        <FormControlLabel 
                            value={r.id.toString()} 
                            control={<Radio />} 
                            label={`${r.name} (Premium Plan - Süresi Doldu)`} 
                            sx={{width: '100%'}}
                        />
                      </ListItem>
                      {index < restaurantsToList.length - 1 && <Divider component="li" />}
                    </Box>
                ))}
              </List>
            </RadioGroup>
          </FormControl>
        ) : (
          // Eğer tek restoran varsa, sadece bilgi olarak göster
          restaurantsToList.length === 1 && (
            <Paper variant="outlined" sx={{ p: 2, textAlign: 'left', mb: 4 }}>
              <Typography sx={{fontWeight: 'bold'}}>{restaurantsToList[0].name}</Typography>
              <Typography variant="body2" color="text.secondary">Premium Plan - Süresi Doldu</Typography>
            </Paper>
          )
        )}

        <Button 
            variant="contained" 
            color="secondary" 
            size="large"
            startIcon={<CreditCard />}
            onClick={handleRenewClick}
            // YENİ: Bir restoran seçili değilse butonu pasif yap
            disabled={!selectedRestaurantId}
        >
          Seçili Aboneliği Yenile
        </Button>
      </Paper>
    </Box>
  );
}