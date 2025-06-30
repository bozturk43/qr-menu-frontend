// app/(marketing)/layout.tsx

import MarketingHeader from "@/app/components/marketing/MarketingHeader";
import MarketingFooter from "@/app/components/marketing/MarketingFooter";
import { Box } from "@mui/material";

export default function MarketingLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            <MarketingHeader />
            {/* Header'ın sabit (fixed) olmasından dolayı içeriğin altına girmemesi için bir boşluk bırakıyoruz */}
            <Box component="main" sx={{
                flexGrow: 1,
                background: 'linear-gradient(45deg, #0D253F 50%, #FFAA00 90%)',

            }}>
                {children}
            </Box>
            <MarketingFooter />
        </Box>
    );
}