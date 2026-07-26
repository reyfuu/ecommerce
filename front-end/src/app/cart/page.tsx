'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { ShoppingBag, Trash2, Plus, Minus, ArrowRight, ArrowLeft } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { api, formatRupiah } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export default function CartPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { cart, loading, updateQuantity, removeFromCart } = useCart();

  if (!user) {
    return (
      <div className="text-center py-20 bg-slate-900/40 rounded-3xl border border-slate-800 space-y-4 max-w-lg mx-auto my-10">
        <ShoppingBag className="h-12 w-12 text-slate-500 mx-auto" />
        <h2 className="text-2xl font-bold text-white">Silakan Login Terlebih Dahulu</h2>
        <p className="text-sm text-slate-400">Masuk ke akun Anda untuk melihat keranjang belanja dan melanjutkan transaksi.</p>
        <Link href="/login">
          <Button className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl">
            Masuk ke Akun
          </Button>
        </Link>
      </div>
    );
  }

  const items = cart?.items || [];
  const subtotal = items.reduce((total, item) => {
    const price = item.product?.price || 0;
    return total + price * item.quantity;
  }, 0);
  const shippingFee = items.length > 0 ? 15000 : 0;
  const grandTotal = subtotal + shippingFee;

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">Keranjang Belanja</h1>
        <p className="text-sm text-slate-400">Kelola item pilihan Anda sebelum checkout</p>
      </div>

      {loading ? (
        <div className="h-64 rounded-2xl bg-slate-800/50 animate-pulse border border-slate-800 flex items-center justify-center text-slate-500">
          Memuat keranjang...
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-20 bg-slate-900/40 rounded-3xl border border-slate-800 space-y-4">
          <ShoppingBag className="h-12 w-12 text-slate-600 mx-auto" />
          <h2 className="text-xl font-bold text-white">Keranjang Belanja Masih Kosong</h2>
          <p className="text-xs text-slate-400">Jelajahi berbagai produk menarik di katalog kami.</p>
          <Link href="/products">
            <Button className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl gap-2">
              Jelajahi Produk <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items List */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => (
              <Card key={item.id} className="bg-slate-900/60 border-slate-800 p-4 rounded-2xl flex flex-col sm:flex-row gap-4 items-center justify-between">
                <div className="flex items-center gap-4 w-full sm:w-auto">
                  <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-xl bg-slate-950 border border-slate-800">
                    {item.product?.image_url ? (
                      <Image src={item.product.image_url} alt={item.product.name} fill className="object-cover" />
                    ) : (
                      <div className="flex h-full items-center justify-center text-xs text-slate-600">No Image</div>
                    )}
                  </div>
                  <div>
                    <h3 className="font-semibold text-white text-sm sm:text-base line-clamp-1">{item.product?.name}</h3>
                    <p className="text-xs text-indigo-400 font-medium">{formatRupiah(item.product?.price || 0)}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between w-full sm:w-auto gap-6 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-800">
                  {/* Quantity controls */}
                  <div className="flex items-center border border-slate-700 bg-slate-800 rounded-lg">
                    <Button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-slate-300 hover:text-white"
                    >
                      <Minus className="h-3.5 w-3.5" />
                    </Button>
                    <span className="w-8 text-center text-xs font-bold text-white">{item.quantity}</span>
                    <Button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-slate-300 hover:text-white"
                    >
                      <Plus className="h-3.5 w-3.5" />
                    </Button>
                  </div>

                  <span className="text-sm font-bold text-white min-w-[90px] text-right">
                    {formatRupiah((item.product?.price || 0) * item.quantity)}
                  </span>

                  <Button
                    onClick={() => removeFromCart(item.id)}
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-red-400 hover:text-red-300 hover:bg-red-500/10"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </Card>
            ))}

            <div className="pt-2">
              <Link href="/products">
                <Button variant="ghost" className="text-slate-400 hover:text-white text-xs gap-2">
                  <ArrowLeft className="h-4 w-4" /> Tambah Produk Lainnya
                </Button>
              </Link>
            </div>
          </div>

          {/* Order Summary Card */}
          <div>
            <Card className="bg-slate-900/80 border-slate-800 p-6 rounded-3xl space-y-6 sticky top-24">
              <h2 className="text-lg font-bold text-white">Ringkasan Belanja</h2>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between text-slate-400">
                  <span>Subtotal Produk</span>
                  <span className="text-white font-medium">{formatRupiah(subtotal)}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Estimasi Ongkos Kirim</span>
                  <span className="text-white font-medium">{formatRupiah(shippingFee)}</span>
                </div>
                <div className="border-t border-slate-800 pt-3 flex justify-between text-base font-bold text-white">
                  <span>Total Pembayaran</span>
                  <span className="text-cyan-400">{formatRupiah(grandTotal)}</span>
                </div>
              </div>

              <Button
                onClick={() => router.push('/checkout')}
                className="w-full bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white font-semibold rounded-xl h-11 shadow-lg shadow-indigo-500/20 gap-2"
              >
                Lanjut ke Checkout <ArrowRight className="h-4 w-4" />
              </Button>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
