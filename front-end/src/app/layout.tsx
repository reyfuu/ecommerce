import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import { CartProvider } from '@/context/CartContext';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'NEXUSSHOP - Full-Stack E-Commerce Platform',
  description: 'Toko online modern berkecepatan tinggi dengan antarmuka elegan, pilihan produk terlengkap, dan checkout cepat.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className="dark">
      <body className={`${inter.className} bg-slate-900 text-slate-100 min-h-screen flex flex-col antialiased selection:bg-indigo-500 selection:text-white`}>
        <AuthProvider>
          <CartProvider>
            <Navbar />
            <main className="flex-1 container mx-auto px-4 py-8">{children}</main>
            <Footer />
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
