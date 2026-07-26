'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Plus, Edit, Trash2, ShieldAlert, ArrowLeft, Image as ImageIcon } from 'lucide-react';
import { Product, Category, APIResponse } from '@/types';
import { api, formatRupiah } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

export default function AdminProductsPage() {
  const router = useRouter();
  const { user, isAdmin } = useAuth();

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Form Modal State
  const [openModal, setOpenModal] = useState<boolean>(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const [formData, setFormData] = useState({
    category_id: '',
    name: '',
    description: '',
    price: 0,
    stock: 0,
    weight_grams: 0,
    image_url: '',
  });

  const fetchData = async () => {
    try {
      const [prodRes, catRes] = await Promise.all([
        api.get<APIResponse<Product[]>>('/products'),
        api.get<APIResponse<Category[]>>('/categories'),
      ]);

      if (prodRes.data.success && prodRes.data.data) {
        setProducts(prodRes.data.data);
      }
      if (catRes.data.success && catRes.data.data) {
        const catList = catRes.data.data;
        setCategories(catList);
        if (catList.length > 0 && !formData.category_id) {
          setFormData((prev) => ({ ...prev, category_id: catList[0].id }));
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user || !isAdmin) return;
    fetchData();
  }, [user, isAdmin]);

  const handleOpenAdd = () => {
    setEditingProduct(null);
    setFormData({
      category_id: categories[0]?.id || '',
      name: '',
      description: '',
      price: 100000,
      stock: 10,
      weight_grams: 500,
      image_url: '',
    });
    setOpenModal(true);
  };

  const handleOpenEdit = (p: Product) => {
    setEditingProduct(p);
    setFormData({
      category_id: p.category_id,
      name: p.name,
      description: p.description || '',
      price: p.price,
      stock: p.stock,
      weight_grams: p.weight_grams,
      image_url: p.image_url || '',
    });
    setOpenModal(true);
  };

  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingProduct) {
        await api.put(`/admin/products/${editingProduct.id}`, formData);
        alert('Produk berhasil diperbarui');
      } else {
        await api.post('/admin/products', formData);
        alert('Produk baru berhasil ditambahkan');
      }
      setOpenModal(false);
      fetchData();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Gagal menyimpan produk');
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus produk ini?')) return;
    try {
      await api.delete(`/admin/products/${id}`);
      alert('Produk berhasil dihapus');
      fetchData();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Gagal menghapus produk');
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

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Manajemen Katalog Produk</h1>
          <p className="text-sm text-slate-400">Tambah, ubah detail, dan hapus produk toko</p>
        </div>

        <Button onClick={handleOpenAdd} className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl gap-2 shadow-lg shadow-indigo-600/20">
          <Plus className="h-4 w-4" /> Tambah Produk Baru
        </Button>
      </div>

      {/* Modal Dialog Form */}
      <Dialog open={openModal} onOpenChange={setOpenModal}>
        <DialogContent className="bg-slate-900 border-slate-800 text-white max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">
              {editingProduct ? 'Edit Detail Produk' : 'Tambah Produk Baru'}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmitForm} className="space-y-4 pt-2">
            <div>
              <label className="text-xs font-medium text-slate-300 block mb-1">Nama Produk</label>
              <Input
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="misal: Mechanical Keyboard RGB"
                className="bg-slate-800 border-slate-700 text-white rounded-xl"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-slate-300 block mb-1">Kategori</label>
              <select
                value={formData.category_id}
                onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-3 py-2 text-sm"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1">Harga (Rp)</label>
                <Input
                  type="number"
                  required
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                  className="bg-slate-800 border-slate-700 text-white rounded-xl"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1">Jumlah Stok</label>
                <Input
                  type="number"
                  required
                  value={formData.stock}
                  onChange={(e) => setFormData({ ...formData, stock: parseInt(e.target.value) || 0 })}
                  className="bg-slate-800 border-slate-700 text-white rounded-xl"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-slate-300 block mb-1">URL Gambar Produk</label>
              <Input
                value={formData.image_url}
                onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                placeholder="https://..."
                className="bg-slate-800 border-slate-700 text-white rounded-xl"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-slate-300 block mb-1">Deskripsi Produk</label>
              <textarea
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <Button type="button" variant="ghost" onClick={() => setOpenModal(false)} className="text-slate-400">Batal</Button>
              <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl">Simpan</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Products Table */}
      <Card className="bg-slate-900/60 border-slate-800 p-6 rounded-3xl overflow-hidden">
        {loading ? (
          <div className="h-48 animate-pulse bg-slate-800/40 rounded-xl" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="border-b border-slate-800 text-slate-400 uppercase font-semibold">
                <tr>
                  <th className="py-3 px-4">Produk</th>
                  <th className="py-3 px-4">Kategori</th>
                  <th className="py-3 px-4">Harga</th>
                  <th className="py-3 px-4">Stok</th>
                  <th className="py-3 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {products.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-3 px-4 flex items-center gap-3">
                      <div className="relative h-10 w-10 overflow-hidden rounded-lg bg-slate-950 border border-slate-800 flex-shrink-0">
                        {p.image_url ? (
                          <Image src={p.image_url} alt={p.name} fill className="object-cover" />
                        ) : (
                          <ImageIcon className="h-5 w-5 text-slate-600 m-auto" />
                        )}
                      </div>
                      <span className="font-semibold text-white max-w-[200px] truncate">{p.name}</span>
                    </td>
                    <td className="py-3 px-4">{p.category?.name || '-'}</td>
                    <td className="py-3 px-4 font-bold text-white">{formatRupiah(p.price)}</td>
                    <td className="py-3 px-4">
                      <Badge className={p.stock <= 5 ? 'bg-amber-500/10 text-amber-400' : 'bg-slate-800 text-slate-300'}>
                        {p.stock} unit
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-right space-x-2">
                      <Button onClick={() => handleOpenEdit(p)} variant="ghost" size="icon" className="h-8 w-8 text-indigo-400 hover:bg-indigo-500/10">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button onClick={() => handleDeleteProduct(p.id)} variant="ghost" size="icon" className="h-8 w-8 text-red-400 hover:bg-red-500/10">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
