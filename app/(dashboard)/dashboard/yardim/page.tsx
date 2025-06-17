'use client';

import { useState } from 'react';
import { Box, Typography, Container, TextField, InputAdornment, Accordion, AccordionSummary, AccordionDetails, Paper, Card, CardHeader, CardContent, Button, CardActions } from '@mui/material';
import { Search as SearchIcon, ExpandMore as ExpandMoreIcon, Mail as MailIcon, HelpCenter } from '@mui/icons-material';

// Örnek SSS verisi aynı kalabilir
const faqData = [
    {
        id: 'faq1',
        question: 'Yeni bir restoran nasıl eklerim?',
        answer: 'Panel ana sayfasındaki "Yeni Restoran Ekle" butonuna tıklayarak başlayabilirsiniz. Ücretsiz planınızda bir restoran hakkınız bulunmaktadır.',
    },
    {
        id: 'faq2',
        question: 'Kategorilerimi nasıl sıralayabilirim?',
        answer: 'Kategori Yönetimi sayfasında, her bir kategorinin solundaki sürükle ikonundan tutarak istediğiniz sıraya getirebilirsiniz. Değişiklikler otomatik olarak kaydedilecektir.',
    },
    {
        id: 'faq3',
        question: 'Premium planın avantajları nelerdir?',
        answer: 'Premium plan ile birden fazla restoran ekleyebilir, daha fazla tema seçeneğine ve öncelikli desteğe sahip olabilirsiniz.',
    },
];

export default function HelpCenterPage() {
    const [expanded, setExpanded] = useState<string | false>(false);

    const handleChange = (panel: string) => (event: React.SyntheticEvent, isExpanded: boolean) => {
        setExpanded(isExpanded ? panel : false);
    };

    return (
        <Container maxWidth="lg">
            {/* 1. BÖLÜM: KARŞILAMA VE ARAMA (Değişiklik yok) */}
            <Box sx={{ textAlign: 'center', py: 8, backgroundColor: 'primary.main', color: 'primary.contrastText', borderRadius: 4, mb: 6 }}>
                <HelpCenter sx={{ fontSize: 60, mb: 2 }} />
                <Typography variant="h2" component="h1" sx={{ fontWeight: 'bold' }}>
                    Yardım Merkezi
                </Typography>
                <Typography variant="h6" sx={{ mt: 1, mb: 4, color: 'primary.light' }}>
                    Size nasıl yardımcı olabiliriz?
                </Typography>
                <Box sx={{ maxWidth: 600, mx: 'auto' }}>
                    <TextField
                        fullWidth
                        placeholder="Sorunuzu buraya yazın (ör: şifre değiştirme)"
                        variant="filled"
                        sx={{
                            backgroundColor: 'white',
                            borderRadius: '8px',
                            '&:hover': { backgroundColor: '#f1f1f1' },
                            '.MuiFilledInput-root': { borderRadius: '8px' }
                        }}
                        slotProps={{
                            input: { // <-- 'input' slot'unu hedefliyoruz
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <SearchIcon />
                                    </InputAdornment>
                                ),
                            }
                        }}
                    />
                </Box>
            </Box>

            {/* --- GRID YERİNE YENİ FLEXBOX YAPISI --- */}
            <Box
                sx={{
                    display: 'flex',
                    flexDirection: { xs: 'column', md: 'row' }, // Küçük ekranda alt alta, büyükte yan yana
                    gap: 4 // Aradaki boşluk
                }}
            >
                {/* Sol Sütun (SSS Bölümü) */}
                <Box sx={{ flex: { xs: 1, md: 2 } }}> {/* Büyük ekranda 2 birim yer kaplar */}
                    <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 3 }}>
                        Sıkça Sorulan Sorular
                    </Typography>
                    {faqData.map((faq) => (
                        <Accordion key={faq.id} expanded={expanded === faq.id} onChange={handleChange(faq.id)} elevation={2}>
                            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                                <Typography sx={{ fontWeight: 'medium' }}>{faq.question}</Typography>
                            </AccordionSummary>
                            <AccordionDetails>
                                <Typography color="text.secondary">
                                    {faq.answer}
                                </Typography>
                            </AccordionDetails>
                        </Accordion>
                    ))}
                </Box>

                {/* Sağ Sütun (İletişim Formu) */}
                <Box sx={{ flex: 1 }}> {/* Büyük ekranda 1 birim yer kaplar */}
                    <Card>
                        <CardHeader
                            avatar={<MailIcon color="primary" />}
                            title="Cevap Bulamadınız mı?"
                            subheader="Destek ekibimizle iletişime geçin."
                        />
                        <CardContent>
                            <TextField label="Konu" fullWidth margin="normal" />
                            <TextField label="Mesajınız" fullWidth multiline rows={4} margin="normal" />
                        </CardContent>
                        <CardActions sx={{ p: 2 }}>
                            <Button fullWidth variant="contained" color="secondary">Gönder</Button>
                        </CardActions>
                    </Card>
                </Box>
            </Box>
        </Container>
    );
}