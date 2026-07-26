'use client';

import React, { useEffect, useState, useCallback, Suspense } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Search, ShoppingBag } from 'lucide-react';
import { Product, Category, APIResponse } from '@/types';
import { api, formatRupiah } from '@/lib/api';
import { useCart } from '@/context/CartContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

function ProductCatalogContent() {
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get('category_id') || '';
  const initialSearch = searchParams.get('search') || '';

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory);
  const [searchQuery, setSearchQuery] = useState<string>(initialSearch);
  const [sortBy, setSortBy] = useState<string>('newest');

  const { addToCart } = useCart();

  const fetchCategories = async () => {
    try {
      const res = await api.get<APIResponse<Category[]>>('/categories');
      if (res.data.success && res.data.data) {
        setCategories(res.data.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedCategory) params.append('category_id', selectedCategory);
      if (searchQuery) params.append('search', searchQuery);
      if (sortBy) params.append('sort_by', sortBy);

      const res = await api.get<APIResponse<Product[]>>(`/products?${params.toString()}`);
      if (res.data.success && res.data.data) {
        setProducts(res.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [selectedCategory, searchQuery, sortBy]);

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  return (
    <div className="space-y-8">
      {/* Header Title */}
      <div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">Katalog Produk</h1>
        <p className="text-sm text-slate-400">Temukan barang berkualitas dengan harga terbaik</p>
      </div>

      {/* Filter & Search Controls */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-slate-900/60 border border-slate-800 p-4 rounded-2xl">
        {/* Search */}
        <div className="relative md:col-span-2">
          <Input
            type="text"
            placeholder="Cari berdasarkan nama produk..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-slate-800 border-slate-700 text-slate-100 placeholder:text-slate-400 pl-10 rounded-xl"
          />
          <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
        </div>

        {/* Category Dropdown */}
        <div className="relative">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 text-slate-100 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">Semua Kategori</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        {/* Sort Dropdown */}
        <div className="relative">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 text-slate-100 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="newest">Terbaru</option>
            <option value="price_asc">Harga: Rendah ke Tinggi</option>
            <option value="price_desc">Harga: Tinggi ke Rendah</option>
          </select>
        </div>
      </div>

      {/* Product Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-80 rounded-2xl bg-slate-800/50 animate-pulse border border-slate-800" />
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-16 bg-slate-900/40 rounded-2xl border border-slate-800 space-y-3">
          <p className="text-lg font-medium text-slate-300">Tidak ada produk yang ditemukan</p>
          <p className="text-xs text-slate-500">Coba ubah kata kunci pencarian atau filter kategori Anda.</p>
          <Button
            onClick={() => {
              setSelectedCategory('');
              setSearchQuery('');
              setSortBy('newest');
            }}
            variant="outline"
            className="border-slate-700 bg-slate-800 text-slate-300 hover:text-white"
          >
            Reset Filter
          </Button>
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
                  <Badge className="absolute top-2 left-2 bg-slate-900/80 text-cyan-400 border border-slate-700 text-[10px]">
                    {product.category?.name || 'Katalog'}
                  </Badge>
                </div>

                <CardContent className="p-4 space-y-2">
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
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={<div className="text-slate-400 py-10 text-center">Memuat katalog produk...</div>}>
      <ProductCatalogContent />
    </Suspense>
  );
}
