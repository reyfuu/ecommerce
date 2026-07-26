'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, ShoppingBag, Sparkles, Tag, CheckCircle2 } from 'lucide-react';
import { Category, Product, APIResponse } from '@/types';
import { api, formatRupiah } from '@/lib/api';
import { useCart } from '@/context/CartContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function HomePage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const { addToCart } = useCart();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [catRes, prodRes] = await Promise.all([
          api.get<APIResponse<Category[]>>('/categories'),
          api.get<APIResponse<Product[]>>('/products'),
        ]);

        if (catRes.data.success && catRes.data.data) {
          setCategories(catRes.data.data);
        }
        if (prodRes.data.success && prodRes.data.data) {
          setProducts(prodRes.data.data);
        }
      } catch (err) {
        console.error('Failed to load home data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="space-y-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950/80 to-slate-900 border border-slate-800 p-8 sm:p-12 md:p-16 shadow-2xl">
        <div className="absolute top-0 right-0 -mt-12 -mr-12 h-96 w-96 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -mb-12 -ml-12 h-96 w-96 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-2xl space-y-6">
          <Badge className="bg-indigo-500/10 border-indigo-500/20 text-cyan-400 px-3 py-1 text-xs font-semibold gap-1 rounded-full">
            <Sparkles className="h-3.5 w-3.5" /> Platform Belanja E-Commerce 2026
          </Badge>

          <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl leading-tight">
            Temukan Produk <br />
            <span className="bg-gradient-to-r from-indigo-400 via-cyan-400 to-teal-300 bg-clip-text text-transparent">
              Terbaik & Impian Anda
            </span>
          </h1>

          <p className="text-base text-slate-300 sm:text-lg leading-relaxed">
            Pilihan lengkap gadgets, aksesoris komputer, dan fashion terbaru dengan jaminan kualitas 100% original serta pengiriman super cepat.
          </p>

          <div className="flex flex-wrap gap-4 pt-2">
            <Link href="/products">
              <Button size="lg" className="bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white font-semibold shadow-lg shadow-indigo-500/25 rounded-xl gap-2">
                Jelajahi Katalog <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/register">
              <Button size="lg" variant="outline" className="border-slate-700 bg-slate-800/40 text-slate-200 hover:bg-slate-800 hover:text-white rounded-xl">
                Daftar Akun Baru
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Categories Grid */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white tracking-tight">Kategori Pilihan</h2>
            <p className="text-sm text-slate-400">Pilih kategori favorit sesuai kebutuhan belanja Anda</p>
          </div>
          <Link href="/products" className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1">
            Lihat Semua <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-36 rounded-2xl bg-slate-800/50 animate-pulse border border-slate-800" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {categories.map((category) => (
              <Link key={category.id} href={`/products?category_id=${category.id}`}>
                <Card className="group relative overflow-hidden bg-slate-800/50 border-slate-800 hover:border-indigo-500/50 transition-all duration-300 hover:shadow-xl hover:shadow-indigo-500/10 cursor-pointer h-36">
                  {category.image_url && (
                    <Image
                      src={category.image_url}
                      alt={category.name}
                      fill
                      className="object-cover opacity-30 group-hover:opacity-40 group-hover:scale-105 transition-all duration-500"
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent p-4 flex flex-col justify-end">
                    <h3 className="font-bold text-white group-hover:text-cyan-400 transition-colors text-sm sm:text-base">
                      {category.name}
                    </h3>
                    <p className="text-xs text-slate-400 line-clamp-1">{category.description}</p>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Featured Products */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white tracking-tight">Produk Unggulan</h2>
            <p className="text-sm text-slate-400">Rekomendasi barang populer dengan ulasan terbaik</p>
          </div>
          <Link href="/products" className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1">
            Lihat Semua Produk <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-80 rounded-2xl bg-slate-800/50 animate-pulse border border-slate-800" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <Card key={product.id} className="group overflow-hidden bg-slate-800/40 border-slate-800 hover:border-slate-700 transition-all duration-300 flex flex-col justify-between hover:shadow-xl hover:shadow-indigo-500/5">
                <div>
                  <div className="relative h-48 w-full overflow-hidden bg-slate-900">
                    {product.image_url ? (
                      <Image
                        src={product.image_url}
                        alt={product.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-slate-600">No Image</div>
                    )}
                    {product.stock <= 5 && (
                      <Badge className="absolute top-2 right-2 bg-amber-500/80 text-slate-950 font-bold text-[10px]">
                        Stok Cepat Habis
                      </Badge>
                    )}
                  </div>

                  <CardContent className="p-4 space-y-2">
                    <p className="text-xs font-medium text-indigo-400">{product.category?.name || 'Katalog'}</p>
                    <Link href={`/products/${product.id}`}>
                      <h3 className="font-semibold text-slate-100 group-hover:text-cyan-400 transition-colors line-clamp-1 text-sm sm:text-base">
                        {product.name}
                      </h3>
                    </Link>
                    <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">{product.description}</p>
                  </CardContent>
                </div>

                <div className="p-4 pt-0 space-y-3">
                  <div className="flex items-baseline justify-between">
                    <span className="text-lg font-bold text-white">{formatRupiah(product.price)}</span>
                    <span className="text-xs text-slate-400">Stok: {product.stock}</span>
                  </div>

                  <Button
                    onClick={async () => {
                      try {
                        await addToCart(product.id, 1);
                        alert(`"${product.name}" berhasil ditambahkan ke keranjang!`);
                      } catch (err: unknown) {
                        alert(err instanceof Error ? err.message : 'Gagal menambahkan ke keranjang');
                      }
                    }}
                    size="sm"
                    className="w-full bg-slate-800 hover:bg-indigo-600 text-slate-200 hover:text-white border border-slate-700 hover:border-indigo-500 transition-colors gap-2"
                  >
                    <ShoppingBag className="h-4 w-4" /> Beli Sekarang
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
