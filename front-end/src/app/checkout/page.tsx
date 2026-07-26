'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ShieldCheck, CreditCard, MapPin, Truck, CheckCircle2, ArrowRight } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { api, formatRupiah } from '@/lib/api';
import { APIResponse, Order } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';

export default function CheckoutPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { cart, refreshCart } = useCart();

  const [address, setAddress] = useState<string>('Jl. Sudirman No. 45, Jakarta Selatan');
  const [city, setCity] = useState<string>('Jakarta Selatan');
  const [phone, setPhone] = useState<string>(user?.phone || '081234567890');
  const [paymentMethod, setPaymentMethod] = useState<string>('BCA Transfer Bank');
  const [submitting, setSubmitting] = useState<boolean>(false);

  const items = cart?.items || [];
  const subtotal = items.reduce((total, item) => total + (item.product?.price || 0) * item.quantity, 0);
  const shippingFee = 15000;
  const grandTotal = subtotal + shippingFee;

  const handleCreateOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) return;

    setSubmitting(true);
    try {
      const fullShippingAddress = `${address}, ${city} (No. Telp: ${phone})`;
      const response = await api.post<APIResponse<Order>>('/orders/checkout', {
        shipping_address: fullShippingAddress,
        payment_method: paymentMethod,
      });

      if (response.data.success) {
        await refreshCart();
        alert('Pesanan Anda berhasil dibuat!');
        router.push('/orders');
      } else {
        alert(response.data.message || 'Gagal memproses checkout');
      }
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Gagal membuat pesanan');
    } finally {
      setSubmitting(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="text-center py-20 space-y-4">
        <h2 className="text-2xl font-bold text-white">Keranjang Anda Kosong</h2>
        <Button onClick={() => router.push('/products')} className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl">
          Kembali ke Katalog
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">Checkout Pesanan</h1>
        <p className="text-sm text-slate-400">Lengkapi pengiriman dan konfirmasi pembayaran Anda</p>
      </div>

      <form onSubmit={handleCreateOrder} className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Shipping & Payment Form */}
        <div className="md:col-span-2 space-y-6">
          {/* Alamat Pengiriman */}
          <Card className="bg-slate-900/60 border-slate-800 p-6 rounded-3xl space-y-4">
            <div className="flex items-center gap-2 text-indigo-400 font-semibold text-base border-b border-slate-800 pb-3">
              <MapPin className="h-5 w-5" />
              <span>1. Alamat Pengiriman</span>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1">Alamat Lengkap</label>
                <Input
                  required
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Jl. Nama Jalan, No. Rumah, RT/RW, Kelurahan"
                  className="bg-slate-800 border-slate-700 text-slate-100 placeholder:text-slate-500 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-slate-300 block mb-1">Kota / Kabupaten</label>
                  <Input
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="Kota"
                    className="bg-slate-800 border-slate-700 text-slate-100 rounded-xl"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-300 block mb-1">Nomor Telepon Penerima</label>
                  <Input
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="08xxxxxxxxxx"
                    className="bg-slate-800 border-slate-700 text-slate-100 rounded-xl"
                  />
                </div>
              </div>
            </div>
          </Card>

          {/* Metode Pembayaran */}
          <Card className="bg-slate-900/60 border-slate-800 p-6 rounded-3xl space-y-4">
            <div className="flex items-center gap-2 text-cyan-400 font-semibold text-base border-b border-slate-800 pb-3">
              <CreditCard className="h-5 w-5" />
              <span>2. Metode Pembayaran</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                'BCA Transfer Bank',
                'Mandiri Virtual Account',
                'QRIS / GoPay / OVO',
                'Kartu Kredit / Debit',
              ].map((method) => (
                <div
                  key={method}
                  onClick={() => setPaymentMethod(method)}
                  className={`p-3.5 rounded-xl border text-sm font-medium cursor-pointer transition-all flex items-center justify-between ${
                    paymentMethod === method
                      ? 'bg-indigo-600/10 border-indigo-500 text-white'
                      : 'bg-slate-800/40 border-slate-700/60 text-slate-400 hover:border-slate-600'
                  }`}
                >
                  <span>{method}</span>
                  {paymentMethod === method && <CheckCircle2 className="h-4 w-4 text-cyan-400" />}
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Order Summary & Submit */}
        <div>
          <Card className="bg-slate-900/80 border-slate-800 p-6 rounded-3xl space-y-6 sticky top-24">
            <h2 className="text-lg font-bold text-white">Ringkasan Pesanan</h2>

            <div className="space-y-3 max-h-48 overflow-y-auto pr-1">
              {items.map((item) => (
                <div key={item.id} className="flex justify-between text-xs text-slate-300">
                  <span className="line-clamp-1">{item.product?.name} x{item.quantity}</span>
                  <span className="font-semibold">{formatRupiah((item.product?.price || 0) * item.quantity)}</span>
                </div>
              ))}
            </div>

            <div className="space-y-2 text-xs border-t border-slate-800 pt-3">
              <div className="flex justify-between text-slate-400">
                <span>Subtotal Produk</span>
                <span className="text-white">{formatRupiah(subtotal)}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Ongkos Kirim</span>
                <span className="text-white">{formatRupiah(shippingFee)}</span>
              </div>
              <div className="border-t border-slate-800 pt-2 flex justify-between text-sm font-bold text-white">
                <span>Total Pembayaran</span>
                <span className="text-cyan-400">{formatRupiah(grandTotal)}</span>
              </div>
            </div>

            <Button
              type="submit"
              disabled={submitting}
              className="w-full bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white font-semibold rounded-xl h-11 shadow-lg shadow-indigo-500/25 gap-2"
            >
              {submitting ? 'Memproses Pesanan...' : 'Konfirmasi & Bayar'} <ArrowRight className="h-4 w-4" />
            </Button>
          </Card>
        </div>
      </form>
    </div>
  );
}
