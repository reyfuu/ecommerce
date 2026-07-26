import React from 'react';
import Link from 'next/link';
import { Store, ShieldCheck, Truck, Headphones, Heart } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="border-t border-slate-800 bg-slate-950 text-slate-400 mt-20">
      {/* Features Bar */}
      <div className="border-b border-slate-800/80 bg-slate-900/50 py-8">
        <div className="container mx-auto grid grid-cols-1 gap-6 px-4 sm:grid-cols-3 text-center">
          <div className="flex flex-col items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-500/10 text-indigo-400">
              <Truck className="h-5 w-5" />
            </div>
            <h4 className="font-semibold text-slate-200">Pengiriman Cepat & Aman</h4>
            <p className="text-xs text-slate-400">Jaminan barang sampai tujuan dalam kondisi terbaik</p>
          </div>

          <div className="flex flex-col items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-cyan-500/10 text-cyan-400">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <h4 className="font-semibold text-slate-200">Garansi & Produk 100% Ori</h4>
            <p className="text-xs text-slate-400">Kualitas terjamin dengan dukungan pengembalian resmi</p>
          </div>

          <div className="flex flex-col items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-400">
              <Headphones className="h-5 w-5" />
            </div>
            <h4 className="font-semibold text-slate-200">Layanan Bantuan 24/7</h4>
            <p className="text-xs text-slate-400">Tim dukungan siap membantu pertanyaan transaksi Anda</p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-white">
                <Store className="h-4 w-4" />
              </div>
              <span className="text-lg font-bold text-white">NEXUSSHOP</span>
            </div>
            <p className="text-xs leading-relaxed text-slate-400">
              Platform e-commerce generasi baru yang memadukan kecepatan, keamanan, dan keindahan desain visual modern.
            </p>
          </div>

          <div>
            <h5 className="mb-3 text-sm font-semibold text-slate-200">Navigasi Utama</h5>
            <ul className="space-y-2 text-xs">
              <li><Link href="/" className="hover:text-indigo-400 transition-colors">Beranda</Link></li>
              <li><Link href="/products" className="hover:text-indigo-400 transition-colors">Katalog Produk</Link></li>
              <li><Link href="/cart" className="hover:text-indigo-400 transition-colors">Keranjang Belanja</Link></li>
            </ul>
          </div>

          <div>
            <h5 className="mb-3 text-sm font-semibold text-slate-200">Kategori Populer</h5>
            <ul className="space-y-2 text-xs">
              <li><Link href="/products?category=elektronik-gadget" className="hover:text-cyan-400 transition-colors">Elektronik & Gadget</Link></li>
              <li><Link href="/products?category=komputer-aksesori" className="hover:text-cyan-400 transition-colors">Komputer & Aksesori</Link></li>
              <li><Link href="/products?category=pakaian-fashion" className="hover:text-cyan-400 transition-colors">Pakaian & Fashion</Link></li>
            </ul>
          </div>

          <div>
            <h5 className="mb-3 text-sm font-semibold text-slate-200">Bantuan & Syarat</h5>
            <ul className="space-y-2 text-xs">
              <li><span className="cursor-pointer hover:text-slate-200">Panduan Pembelian</span></li>
              <li><span className="cursor-pointer hover:text-slate-200">Kebijakan Privasi</span></li>
              <li><span className="cursor-pointer hover:text-slate-200">Syarat & Ketentuan</span></li>
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t border-slate-900 pt-6 text-center text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© 2026 NEXUSSHOP E-Commerce. All rights reserved.</p>
          <p className="flex items-center gap-1">
            Built with <Heart className="h-3.5 w-3.5 text-red-500 fill-red-500" /> Go & Next.js
          </p>
        </div>
      </div>
    </footer>
  );
};
