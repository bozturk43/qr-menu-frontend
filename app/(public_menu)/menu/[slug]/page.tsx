// app(public_menu)/menu/[slug]/page.tsx

import MenuDisplay from "./MenuDisplay"; // Yeni oluşturduğumuz bileşeni import et

// Bu bir Sunucu Bileşeni olarak kalıyor.
export default async function MenuPage({ params }: { params: Promise<{ slug: string }>}) {
    
    // Sunucu tarafında 'slug' parametresini alıyoruz.
    const {slug} = await params;


    // Tek görevi, slug'ı Client Component olan MenuDisplay'e prop olarak geçirmek.
    return (
        <MenuDisplay slug={slug} />
    );
}