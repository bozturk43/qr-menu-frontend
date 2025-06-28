// app/(pos_panel)/layout.tsx
import { ReactNode } from "react";

// Bu layout, dashboard'un sidebar/header'ını devralmaz.
// Sadece sayfayı olduğu gibi, tam ekran render eder.
export default function PosPanelLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}