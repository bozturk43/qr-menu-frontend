// src/components/dashboard/StatCard.tsx
'use client';

import { Paper, Box, Typography, Avatar } from '@mui/material';
import { ReactNode } from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: ReactNode; // İkonu bir bileşen olarak alacağız
  color?: string; // Avatarın rengini özelleştirmek için
}

export default function StatCard({ title, value, icon, color = 'primary.main' }: StatCardProps) {
  return (
    <Paper 
        elevation={3} 
        sx={{ 
            p: 3, 
            display: 'flex', 
            alignItems: 'center', 
            gap: 2,
            flex: 1, // Esnek bir şekilde büyümesi için
        }}
    >
      <Avatar sx={{ bgcolor: color, width: 56, height: 56 }}>
        {icon}
      </Avatar>
      <Box>
        <Typography color="text.secondary" sx={{ textTransform: 'uppercase', fontSize: '0.8rem', fontWeight: 'bold' }}>
          {title}
        </Typography>
        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
          {value}
        </Typography>
      </Box>
    </Paper>
  );
}