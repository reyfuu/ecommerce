'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';
import { ShoppingBag, ArrowLeft, ShieldCheck, Truck, Plus, Minus, Check } from 'lucide-react';
import { Product, APIResponse } from '@/types';
import { api, formatRupiah } from '@/lib/api';
import { useCart } from '@/context/CartContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [product, setProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(true);
  const [added, setAdded] = useState<boolean>(false);
  const { addToCart } = useCart();

  useEffect(() => {
    if (!id) return;
    const fetchProduct = async () => {
      try {
        const res = await api.get<APIResponse<Product>>(`/products/${id}`);
        if (res.data.success && res.data.data) {
          setProduct(res.data.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  const handleAddToCart = async () => {
    if (!product) return;
    try {
      await addToCart(product.id, quantity);
      setAdded(true);
      setTimeout(() => setAdded(false), 2000);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Gagal menambahkan ke keranjang');
    }
  };

  const handleBuyNow = async () => {
    await handleAddToCart();
    router.push('/cart');
  };

  if (loading) {
    return (
      <div className="h-96 rounded-2xl bg-slate-800/50 animate-pulse border border-slate-800 flex items-center justify-center text-slate-500">
        Memuat detail produk...
      </div>
    );
  }

  if (!product) {
    return (
      <div className="text-center py-20 space-y-4">
        <h2 className="text-2xl font-bold text-white">Produk tidak ditemukan</h2>
        <Button onClick={() => router.push('/products')} variant="outline" className="border-slate-700 bg-slate-800 text-slate-200">
          Kembali ke Katalog
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <Button
        onClick={() => router.back()}
        variant="ghost"
        className="text-slate-400 hover:text-white hover:bg-slate-800 gap-2 text-xs"
      >
        <ArrowLeft className="h-4 w-4" /> Kembali
      </Button>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-slate-900/60 border border-slate-800 p-6 md:p-8 rounded-3xl backdrop-blur-md">
        {/* Product Image */}
        <div className="relative h-80 sm:h-96 w-full overflow-hidden rounded-2xl bg-slate-950 border border-slate-800">
          {product.image_url ? (
            <Image src={product.image_url} alt={product.name} fill className="object-cover" />
          ) : (
            <div className="flex h-full items-center justify-center text-slate-600">No Image</div>
          )}
        </div>

        {/* Product Information */}
        <div className="flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <Badge className="bg-indigo-500/10 border-indigo-500/20 text-cyan-400 text-xs font-medium">
              {product.category?.name || 'Katalog'}
            </Badge>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-white leading-tight">{product.name}</h1>

            <div className="flex items-baseline gap-4">
              <span className="text-3xl font-bold text-white">{formatRupiah(product.price)}</span>
              <span className="text-xs text-slate-400">Tersedia: {product.stock} unit</span>
            </div>

            <p className="text-sm text-slate-300 leading-relaxed pt-2 border-t border-slate-800/80">
              {product.description || 'Tidak ada deskripsi rinci.'}
            </p>

            {/* Quantity Selector */}
            <div className="space-y-2 pt-2">
              <label className="text-xs font-semibold text-slate-300">Kuantitas Pembelian:</label>
              <div className="flex items-center gap-3">
                <div className="flex items-center border border-slate-700 bg-slate-800 rounded-xl">
                  <Button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 text-slate-300 hover:text-white"
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="w-12 text-center text-sm font-bold text-white">{quantity}</span>
                  <Button
                    onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 text-slate-300 hover:text-white"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <span className="text-xs text-slate-400">Total: {formatRupiah(product.price * quantity)}</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3 pt-4 border-t border-slate-800">
            <div className="grid grid-cols-2 gap-3">
              <Button
                onClick={handleAddToCart}
                disabled={product.stock <= 0}
                variant="outline"
                className="border-indigo-600/50 bg-indigo-600/10 text-indigo-300 hover:bg-indigo-600 hover:text-white font-semibold rounded-xl h-11 gap-2"
              >
                {added ? <Check className="h-4 w-4 text-emerald-400" /> : <ShoppingBag className="h-4 w-4" />}
                {added ? 'Berhasil Ditambah' : 'Tambah Keranjang'}
              </Button>

              <Button
                onClick={handleBuyNow}
                disabled={product.stock <= 0}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl h-11 shadow-lg shadow-indigo-600/25"
              >
                Beli Langsung
              </Button>
            </div>

            {/* Trust Info */}
            <div className="flex items-center justify-around pt-2 text-[11px] text-slate-400">
              <span className="flex items-center gap-1"><Truck className="h-3.5 w-3.5 text-indigo-400" /> Gratis Ongkir</span>
              <span className="flex items-center gap-1"><ShieldCheck className="h-3.5 w-3.5 text-cyan-400" /> Garansi Resmi</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
