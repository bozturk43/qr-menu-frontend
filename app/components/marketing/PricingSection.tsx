// src/components/marketing/PricingSection.tsx
'use client';

import { Box, Typography, Paper, Button, List, ListItem, ListItemIcon, ListItemText, Chip } from '@mui/material';
import { Check } from 'lucide-react';

// Bu bileşenin alacağı propların tipi
interface PricingSectionProps {
  tiers: any[]; // Tipi daha sonra detaylandırabiliriz
}

export default function PricingSection({ tiers }: PricingSectionProps) {
  return (
    <Box sx={{ py: { xs: 8, md: 16 } }}>
      <Typography variant="h2" component="h2" sx={{ textAlign: 'center', fontWeight: 'bold', mb: 8,color:"#f8f7f4" }}>
        Size Uygun Planı Seçin
      </Typography>
      <Box 
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          justifyContent: 'center',
          alignItems: 'center',
          gap: 4,
        }}
      >
        {tiers?.sort((a, b) => a.id - b.id).map((tier) => (
          <Paper
            key={tier.id}
            elevation={tier.is_featured ? 12 : 3}
            sx={{
              p: 4,
              width: '100%',
              maxWidth: 360,
              border: tier.is_featured ? '2px solid' : '1px solid',
              borderColor: tier.is_featured ? 'secondary.main' : 'divider',
              transform: tier.is_featured ? 'scale(1.05)' : 'none',
              transition: 'transform 0.3s ease, box-shadow 0.3s ease',
            }}
          >
            {tier.is_featured && (
                <Chip label="Önerilen" color="secondary" sx={{mb: 2, fontWeight:'bold'}}/>
            )}
            <Typography variant="h4" component="h3" sx={{ fontWeight: 'bold' }}>
              {tier.plan_name}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'baseline', my: 2 }}>
              <Typography variant="h5" component="span" sx={{ fontWeight: 'bold' }}>
                {tier.price}/
              </Typography>
              <Typography variant="h6" color="text.secondary">
                {tier.billing_period}
              </Typography>
            </Box>
            <Typography variant="body1" color="text.secondary" sx={{ minHeight: '50px' }}>
              {tier.description}
            </Typography>
            <List sx={{ my: 3 }}>
              {tier.features.map((feature: any) => (
                <ListItem key={feature.id} disableGutters>
                  <ListItemIcon sx={{minWidth: 'auto', mr: 1.5, color: 'success.main'}}>
                    <Check />
                  </ListItemIcon>
                  <ListItemText primary={feature.text} />
                </ListItem>
              ))}
            </List>
            <Button 
                fullWidth 
                variant={tier.is_featured ? 'contained' : 'outlined'} 
                color="secondary"
                href="/kayit-ol"
                sx={{py: 1.5, fontSize: '1.1rem'}}
            >
              Hemen Başla
            </Button>
          </Paper>
        ))}
      </Box>
    </Box>
  );
}