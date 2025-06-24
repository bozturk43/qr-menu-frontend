// app/(frameless)/layout.tsx
import { ReactNode } from "react";

export default function FramelessLayout({ children }: { children: ReactNode }) {
  // Bu layout, dashboard'un sidebar/header'ını veya marketing'in
  // header/footer'ını devralmaz. Sadece sayfayı olduğu gibi render eder.
  return <>{children}</>;
}