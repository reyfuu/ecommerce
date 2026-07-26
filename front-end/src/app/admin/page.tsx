'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { DollarSign, ShoppingBag, Package, Users, ShieldAlert, Plus, ArrowRight } from 'lucide-react';
import { Order, Product, APIResponse } from '@/types';
import { api, formatRupiah } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export default function AdminDashboardPage() {
  const router = useRouter();
  const { user, isAdmin } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (!user || !isAdmin) return;

    const fetchData = async () => {
      try {
        const [ordersRes, prodsRes] = await Promise.all([
          api.get<APIResponse<Order[]>>('/admin/orders'),
          api.get<APIResponse<Product[]>>('/products'),
        ]);

        if (ordersRes.data.success && ordersRes.data.data) {
          setOrders(ordersRes.data.data);
        }
        if (prodsRes.data.success && prodsRes.data.data) {
          setProducts(prodsRes.data.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user, isAdmin]);

  if (!user || !isAdmin) {
    return (
      <div className="text-center py-20 space-y-4">
        <ShieldAlert className="h-12 w-12 text-red-400 mx-auto" />
        <h2 className="text-2xl font-bold text-white">Akses Ditolak (Admin Only)</h2>
        <p className="text-xs text-slate-400">Halaman ini hanya dapat diakses oleh akun Administrator.</p>
        <Button onClick={() => router.push('/')} variant="outline" className="border-slate-700 bg-slate-800 text-slate-200">
          Kembali ke Beranda
        </Button>
      </div>
    );
  }

  const totalRevenue = orders.reduce((sum, o) => (o.status === 'paid' || o.status === 'completed' || o.status === 'shipped' ? sum + o.total_amount : sum), 0);
  const activeOrdersCount = orders.filter((o) => o.status !== 'completed' && o.status !== 'cancelled').length;
  const lowStockProductsCount = products.filter((p) => p.stock <= 5).length;

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <ShieldAlert className="h-7 w-7 text-indigo-400" /> Dasbor Pengelola (Admin)
          </h1>
          <p className="text-sm text-slate-400">Pantau performa penjualan, kelola stok produk, dan proses pesanan</p>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/admin/products">
            <Button className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl gap-2">
              <Package className="h-4 w-4" /> Kelola Produk
            </Button>
          </Link>
          <Link href="/admin/orders">
            <Button variant="outline" className="border-slate-700 bg-slate-800 text-slate-200 hover:text-white rounded-xl gap-2">
              <ShoppingBag className="h-4 w-4" /> Kelola Pesanan
            </Button>
          </Link>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-slate-900/60 border-slate-800 p-5 rounded-2xl space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Total Pendapatan</span>
            <DollarSign className="h-4 w-4 text-emerald-400" />
          </div>
          <p className="text-2xl font-bold text-white">{formatRupiah(totalRevenue)}</p>
          <p className="text-[11px] text-emerald-400">Transaksi Berhasil</p>
        </Card>

        <Card className="bg-slate-900/60 border-slate-800 p-5 rounded-2xl space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Pesanan Aktif</span>
            <ShoppingBag className="h-4 w-4 text-cyan-400" />
          </div>
          <p className="text-2xl font-bold text-white">{activeOrdersCount}</p>
          <p className="text-[11px] text-cyan-400">Perlu Diproses / Dikirim</p>
        </Card>

        <Card className="bg-slate-900/60 border-slate-800 p-5 rounded-2xl space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Total Katalog Produk</span>
            <Package className="h-4 w-4 text-indigo-400" />
          </div>
          <p className="text-2xl font-bold text-white">{products.length}</p>
          <p className="text-[11px] text-indigo-400">Produk Terdaftar</p>
        </Card>

        <Card className="bg-slate-900/60 border-slate-800 p-5 rounded-2xl space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Peringatan Stok Rendah</span>
            <ShieldAlert className="h-4 w-4 text-amber-400" />
          </div>
          <p className="text-2xl font-bold text-white">{lowStockProductsCount}</p>
          <p className="text-[11px] text-amber-400">Stok ≤ 5 Unit</p>
        </Card>
      </div>

      {/* Recent Orders Overview */}
      <Card className="bg-slate-900/60 border-slate-800 p-6 rounded-3xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h2 className="text-lg font-bold text-white">Pesanan Terbaru</h2>
          <Link href="/admin/orders" className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1">
            Lihat Semua Pesanan <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {loading ? (
          <div className="h-40 animate-pulse bg-slate-800/40 rounded-xl" />
        ) : orders.length === 0 ? (
          <p className="text-xs text-slate-500 py-6 text-center">Belum ada transaksi masuk.</p>
        ) : (
          <div className="space-y-3">
            {orders.slice(0, 5).map((o) => (
              <div key={o.id} className="flex flex-wrap items-center justify-between p-3.5 rounded-xl bg-slate-800/40 border border-slate-800/80 text-xs">
                <div className="space-y-0.5">
                  <p className="font-bold text-white">{o.order_number}</p>
                  <p className="text-slate-400">{o.user?.name || 'Pelanggan'} ({o.user?.email})</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-cyan-400">{formatRupiah(o.total_amount + o.shipping_fee)}</p>
                  <p className="text-slate-400 capitalize">{o.status}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
