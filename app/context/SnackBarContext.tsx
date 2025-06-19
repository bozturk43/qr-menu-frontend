'use client';

import { createContext, useContext, useState, ReactNode } from 'react';
import { Snackbar, Alert, AlertColor } from '@mui/material';

// Context'in içinde paylaşacağımız fonksiyonun tipini tanımlıyoruz
interface SnackbarContextType {
  showSnackbar: (message: string, severity: AlertColor, duration?: number) => void;
}

const SnackbarContext = createContext<SnackbarContextType | undefined>(undefined);

// Diğer bileşenlerden kolayca çağırmak için özel bir hook
export function useSnackbar() {
  const context = useContext(SnackbarContext);
  if (!context) {
    throw new Error('useSnackbar must be used within a SnackbarProvider');
  }
  return context;
}

// Bu Provider, tüm uygulamayı saracak ve Snackbar bileşenini render edecek
export function SnackbarProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [duration, setDuration] = useState(6000); // Varsayılan 6 saniye
  const [severity, setSeverity] = useState<AlertColor>('success');

  const showSnackbar = (message: string, severity: AlertColor, duration = 6000) => {
    setMessage(message);
    setSeverity(severity);
    setDuration(duration);
    setOpen(true);
  };

  const handleClose = (event?: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === 'clickaway') {
      return;
    }
    setOpen(false);
  };

  const value = { showSnackbar };

  return (
    <SnackbarContext.Provider value={value}>
      {children}
      <Snackbar
        open={open}
        autoHideDuration={duration}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={handleClose} severity={severity} variant="filled" sx={{ width: '100%' }}>
          {message}
        </Alert>
      </Snackbar>
    </SnackbarContext.Provider>
  );
}