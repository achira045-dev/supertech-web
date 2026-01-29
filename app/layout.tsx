import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Navbar from "./components/Navbar";
import MobileNav from "./components/MobileNav";
import Footer from "./components/Footer";
import { CartProvider } from "./context/CartContext";
import { AuthProvider } from "./context/AuthContext";
import { ProductProvider } from "./context/ProductContext";
import { Toaster } from "react-hot-toast";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });


export const metadata: Metadata = {
  title: "Supertech | Gaming Gear & PC Store",
  description: "สุดยอดร้านค้าอุปกรณ์เกมมิ่งเกียร์และคอมพิวเตอร์",
  viewport: "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th">
      <body
        className={`${inter.className} antialiased bg-[#f8f9fa]`}
      >
        <AuthProvider>
          <ProductProvider>
            <CartProvider>
              <Toaster position="top-center" toastOptions={{ duration: 3000 }} />
              <Navbar />
              <main className="min-h-screen pb-20 md:pb-0">
                {children}
              </main>
              <div className="hidden md:block">
                <Footer />
              </div>
              <MobileNav />
            </CartProvider>
          </ProductProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
