'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Store, LogIn, Lock, Mail, AlertCircle } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();

  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      router.push('/');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Login gagal');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[70vh] py-10">
      <Card className="w-full max-w-md bg-slate-900/80 border-slate-800 p-8 rounded-3xl backdrop-blur-xl shadow-2xl space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-indigo-600 to-cyan-500 text-white shadow-lg shadow-indigo-500/30">
            <Store className="h-6 w-6" />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Selamat Datang Kembali</h1>
          <p className="text-xs text-slate-400">Masukkan kredensial Anda untuk masuk ke akun NEXUSSHOP</p>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-300">Email Address</label>
            <div className="relative">
              <Input
                type="email"
                required
                placeholder="nama@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-slate-800 border-slate-700 text-slate-100 placeholder:text-slate-500 pl-10 rounded-xl"
              />
              <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-300">Kata Sandi (Password)</label>
            <div className="relative">
              <Input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-slate-800 border-slate-700 text-slate-100 placeholder:text-slate-500 pl-10 rounded-xl"
              />
              <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
            </div>
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white font-semibold rounded-xl h-11 shadow-lg shadow-indigo-500/25 gap-2 pt-1"
          >
            <LogIn className="h-4 w-4" /> {loading ? 'Memproses...' : 'Masuk Sekarang'}
          </Button>
        </form>

        <div className="text-center text-xs text-slate-400 pt-2 border-t border-slate-800/80">
          Belum memiliki akun?{' '}
          <Link href="/register" className="text-cyan-400 hover:underline font-semibold">
            Daftar Sekarang
          </Link>
        </div>
      </Card>
    </div>
  );
}
