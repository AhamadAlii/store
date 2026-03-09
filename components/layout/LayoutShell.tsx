"use client";

import { usePathname } from "next/navigation";
import Navbar from "@/components/layout/Navbar";

export default function LayoutShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const hideNavbar = pathname.startsWith("/admin") || pathname.startsWith("/login");

  return (
    <>
      {!hideNavbar && <Navbar />}
      {children}
    </>
  );
}
