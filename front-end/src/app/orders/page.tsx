'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Package, Clock, CheckCircle2, Truck, AlertCircle, ArrowRight } from 'lucide-react';
import { Order, APIResponse } from '@/types';
import { api, formatRupiah } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function OrdersPage() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (!user) return;
    const fetchOrders = async () => {
      try {
        const res = await api.get<APIResponse<Order[]>>('/orders');
        if (res.data.success && res.data.data) {
          setOrders(res.data.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [user]);

  if (!user) {
    return (
      <div className="text-center py-20 space-y-4">
        <h2 className="text-2xl font-bold text-white">Silakan Login Terlebih Dahulu</h2>
        <Link href="/login">
          <Button className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl">Masuk ke Akun</Button>
        </Link>
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return <Badge className="bg-emerald-500/10 border-emerald-500/30 text-emerald-400 gap-1"><CheckCircle2 className="h-3 w-3" /> Dibayar</Badge>;
      case 'processing':
        return <Badge className="bg-cyan-500/10 border-cyan-500/30 text-cyan-400 gap-1"><Clock className="h-3 w-3" /> Diproses</Badge>;
      case 'shipped':
        return <Badge className="bg-indigo-500/10 border-indigo-500/30 text-indigo-400 gap-1"><Truck className="h-3 w-3" /> Dikirim</Badge>;
      case 'completed':
        return <Badge className="bg-emerald-600 text-white gap-1"><CheckCircle2 className="h-3 w-3" /> Selesai</Badge>;
      case 'cancelled':
        return <Badge className="bg-red-500/10 border-red-500/30 text-red-400 gap-1"><AlertCircle className="h-3 w-3" /> Dibatalkan</Badge>;
      default:
        return <Badge className="bg-amber-500/10 border-amber-500/30 text-amber-400 gap-1"><Clock className="h-3 w-3" /> Menunggu</Badge>;
    }
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">Riwayat Pesanan Saya</h1>
        <p className="text-sm text-slate-400">Pantau status transaksi dan riwayat belanja Anda</p>
      </div>

      {loading ? (
        <div className="h-64 rounded-2xl bg-slate-800/50 animate-pulse border border-slate-800 flex items-center justify-center text-slate-500">
          Memuat riwayat pesanan...
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-20 bg-slate-900/40 rounded-3xl border border-slate-800 space-y-4">
          <Package className="h-12 w-12 text-slate-600 mx-auto" />
          <h2 className="text-xl font-bold text-white">Belum Ada Pesanan</h2>
          <p className="text-xs text-slate-400">Anda belum memiliki transaksi pemesanan produk.</p>
          <Link href="/products">
            <Button className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl gap-2">
              Mulai Belanja <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <Card key={order.id} className="bg-slate-900/60 border-slate-800 p-6 rounded-3xl space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3 text-xs">
                <div>
                  <span className="text-slate-400">No. Invoice: </span>
                  <span className="font-bold text-white">{order.order_number}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-slate-400">{new Date(order.created_at).toLocaleDateString('id-ID')}</span>
                  {getStatusBadge(order.status)}
                </div>
              </div>

              <div className="space-y-3">
                {order.items?.map((item) => (
                  <div key={item.id} className="flex justify-between text-xs text-slate-300">
                    <div>
                      <span className="font-medium text-white">{item.product_name}</span>
                      <span className="text-slate-500 ml-2">x{item.quantity}</span>
                    </div>
                    <span className="font-semibold text-slate-200">{formatRupiah(item.subtotal)}</span>
                  </div>
                ))}
              </div>

              <div className="border-t border-slate-800/80 pt-3 flex flex-wrap items-center justify-between text-xs gap-2">
                <div className="text-slate-400">
                  <span>Metode: <strong className="text-slate-200">{order.payment_method || 'Transfer Bank'}</strong></span>
                </div>
                <div className="text-sm font-bold text-white">
                  Total: <span className="text-cyan-400">{formatRupiah(order.total_amount + order.shipping_fee)}</span>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
