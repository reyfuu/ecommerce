'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ShoppingBag, Search, User as UserIcon, LogOut, ShieldAlert, Package, Store } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export const Navbar = () => {
  const router = useRouter();
  const { user, logout, isAdmin } = useAuth();
  const { itemCount } = useCart();
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-800 bg-slate-900/80 backdrop-blur-md">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 to-cyan-500 text-white shadow-lg shadow-indigo-500/20">
            <Store className="h-5 w-5" />
          </div>
          <span className="bg-gradient-to-r from-indigo-400 via-cyan-400 to-white bg-clip-text text-xl font-bold tracking-tight text-transparent">
            NEXUS<span className="text-cyan-400">SHOP</span>
          </span>
        </Link>

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="hidden flex-1 max-w-md mx-6 md:flex relative">
          <Input
            type="text"
            placeholder="Cari produk impian Anda..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-800/80 border-slate-700 text-slate-100 placeholder:text-slate-400 focus-visible:ring-indigo-500 pl-10 rounded-full"
          />
          <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-slate-400" />
        </form>

        {/* Right Nav Options */}
        <div className="flex items-center gap-3">
          <Link href="/products">
            <Button variant="ghost" className="text-slate-300 hover:text-white hover:bg-slate-800 hidden sm:flex">
              Katalog Produk
            </Button>
          </Link>

          {/* Cart Link */}
          <Link href="/cart">
            <Button variant="ghost" size="icon" className="relative text-slate-300 hover:text-white hover:bg-slate-800">
              <ShoppingBag className="h-5 w-5" />
              {itemCount > 0 && (
                <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-gradient-to-r from-indigo-500 to-cyan-500 p-0 text-[11px] font-bold text-white flex items-center justify-center border-2 border-slate-900">
                  {itemCount}
                </Badge>
              )}
            </Button>
          </Link>

          {/* User Profile / Auth */}
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger className="outline-none">
                <Button variant="outline" className="border-slate-700 bg-slate-800/60 text-slate-200 hover:bg-slate-800 hover:text-white gap-2 rounded-full px-3">
                  <div className="h-6 w-6 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs font-bold">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="hidden md:inline font-medium text-sm max-w-[100px] truncate">{user.name}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 bg-slate-900 border-slate-800 text-slate-200 shadow-xl">
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-semibold text-white">{user.name}</p>
                    <p className="text-xs text-slate-400 truncate">{user.email}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-slate-800" />
                
                <DropdownMenuItem onClick={() => router.push('/orders')} className="cursor-pointer hover:bg-slate-800 focus:bg-slate-800 text-slate-200">
                  <Package className="mr-2 h-4 w-4 text-cyan-400" />
                  <span>Pesanan Saya</span>
                </DropdownMenuItem>

                {isAdmin && (
                  <DropdownMenuItem onClick={() => router.push('/admin')} className="cursor-pointer hover:bg-slate-800 focus:bg-slate-800 text-indigo-400 font-medium">
                    <ShieldAlert className="mr-2 h-4 w-4 text-indigo-400" />
                    <span>Dasbor Admin</span>
                  </DropdownMenuItem>
                )}

                <DropdownMenuSeparator className="bg-slate-800" />
                <DropdownMenuItem onClick={logout} className="cursor-pointer text-red-400 hover:bg-slate-800 focus:bg-slate-800">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Keluar / Logout</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex items-center gap-2">
              <Link href="/login">
                <Button variant="ghost" className="text-slate-300 hover:text-white hover:bg-slate-800">
                  Masuk
                </Button>
              </Link>
              <Link href="/register">
                <Button className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-600/20">
                  Daftar
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
