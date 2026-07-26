'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ShoppingBag, ShieldAlert, ArrowLeft, CheckCircle2, Clock, Truck, AlertCircle } from 'lucide-react';
import { Order, APIResponse } from '@/types';
import { api, formatRupiah } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function AdminOrdersPage() {
  const router = useRouter();
  const { user, isAdmin } = useAuth();

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchOrders = async () => {
    try {
      const res = await api.get<APIResponse<Order[]>>('/admin/orders');
      if (res.data.success && res.data.data) {
        setOrders(res.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user || !isAdmin) return;
    fetchOrders();
  }, [user, isAdmin]);

  const handleUpdateStatus = async (orderId: string, newStatus: string) => {
    try {
      await api.put(`/admin/orders/${orderId}/status`, { status: newStatus });
      alert(`Status pesanan berhasil diperbarui ke '${newStatus}'`);
      fetchOrders();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Gagal memperbarui status pesanan');
    }
  };

  if (!user || !isAdmin) {
    return (
      <div className="text-center py-20">
        <ShieldAlert className="h-12 w-12 text-red-400 mx-auto" />
        <h2 className="text-2xl font-bold text-white">Akses Ditolak</h2>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <Button onClick={() => router.push('/admin')} variant="ghost" className="text-slate-400 hover:text-white text-xs gap-2">
        <ArrowLeft className="h-4 w-4" /> Kembali ke Dasbor Admin
      </Button>

      <div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">Manajemen Pemrosesan Pesanan</h1>
        <p className="text-sm text-slate-400">Pantau seluruh pesanan masuk dan perbarui status pengiriman</p>
      </div>

      <Card className="bg-slate-900/60 border-slate-800 p-6 rounded-3xl space-y-6">
        {loading ? (
          <div className="h-48 animate-pulse bg-slate-800/40 rounded-xl" />
        ) : orders.length === 0 ? (
          <p className="text-center py-10 text-xs text-slate-500">Belum ada transaksi pesanan masuk.</p>
        ) : (
          <div className="space-y-4">
            {orders.map((o) => (
              <div key={o.id} className="bg-slate-800/40 border border-slate-800 p-5 rounded-2xl space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3 text-xs">
                  <div>
                    <span className="font-bold text-white text-sm">{o.order_number}</span>
                    <span className="text-slate-400 ml-3">Pembeli: <strong className="text-slate-200">{o.user?.name || 'Pelanggan'}</strong> ({o.user?.email})</span>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-slate-400">{new Date(o.created_at).toLocaleString('id-ID')}</span>
                    {/* Status Updater Dropdown */}
                    <select
                      value={o.status}
                      onChange={(e) => handleUpdateStatus(o.id, e.target.value)}
                      className="bg-slate-900 border border-slate-700 text-white rounded-lg px-2.5 py-1 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="pending">pending (Menunggu)</option>
                      <option value="paid">paid (Lunas)</option>
                      <option value="processing">processing (Diproses)</option>
                      <option value="shipped">shipped (Dikirim)</option>
                      <option value="completed">completed (Selesai)</option>
                      <option value="cancelled">cancelled (Dibatalkan)</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1.5 text-xs text-slate-300">
                  {o.items?.map((item) => (
                    <div key={item.id} className="flex justify-between">
                      <span>{item.product_name} x{item.quantity}</span>
                      <span className="font-semibold text-slate-200">{formatRupiah(item.subtotal)}</span>
                    </div>
                  ))}
                </div>

                <div className="border-t border-slate-800/80 pt-3 flex flex-wrap items-center justify-between text-xs gap-2">
                  <div className="text-slate-400">
                    <span>Alamat Pengiriman: <strong className="text-slate-200">{o.shipping_address}</strong></span>
                  </div>
                  <div className="text-sm font-bold text-white">
                    Total: <span className="text-cyan-400">{formatRupiah(o.total_amount + o.shipping_fee)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
