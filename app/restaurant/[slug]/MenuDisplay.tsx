// src/components/MenuDisplay.tsx

"use client";

import { useQuery } from "@tanstack/react-query";
import { getRestaurantBySlug } from "@/app/lib/api";

// Artık tema haritasını doğrudan 'themes' klasörünün index'inden alıyoruz!
import { THEME_MAP } from "@/app/themes"; 
// Varsayılan tema olarak kullanmak için bir tanesini ayrıca import edebiliriz.
import { ClassicTheme } from "@/app/themes";

export default function MenuDisplay({ slug }: { slug: string }) {
    const { data: restaurant, isLoading, error } = useQuery({
        queryKey: ['restaurant', slug],
        queryFn: () => getRestaurantBySlug(slug),
    });

    if (isLoading) return <div className="text-center p-8">Yükleniyor...</div>;
    if (error) return <div className="text-center p-8 text-red-500">Hata oluştu.</div>;
    if (!restaurant) return <div className="text-center p-8">Restoran bulunamadı.</div>;
    console.log("RESTORAN",restaurant);

    // Gelen veriden tema kimliğini alıyoruz
    const themeIdentifier = restaurant.selected_theme?.identifier || 'classic_theme';
    
    // Haritadan doğru tema bileşenini seçiyoruz. 
    // Eğer gelen identifier haritada yoksa, varsayılan olarak ClassicTheme'i kullan.
    const SelectedThemeComponent = THEME_MAP[themeIdentifier as keyof typeof THEME_MAP] || ClassicTheme;

    // Seçilen tema bileşenini render ediyor ve tüm restoran verisini ona prop olarak gönderiyoruz.
    return <SelectedThemeComponent restaurant={restaurant} />;
}