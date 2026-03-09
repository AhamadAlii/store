import "./globals.css";
import Script from "next/script";
import { CartProvider } from "@/components/context/CartContext";
import LayoutShell from "@/components/layout/LayoutShell";

export const metadata = {
  title: "Utensil Store",
  description: "Pre-order utensils and pick up from store",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <CartProvider>
          <LayoutShell>{children}</LayoutShell>
        </CartProvider>
        <Script
          src="https://checkout.razorpay.com/v1/checkout.js"
          strategy="lazyOnload"
        />
      </body>
    </html>
  );
}
