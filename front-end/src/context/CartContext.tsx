'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { Cart, APIResponse } from '@/types';
import { api } from '@/lib/api';
import { useAuth } from './AuthContext';

interface CartContextType {
  cart: Cart | null;
  itemCount: number;
  loading: boolean;
  addToCart: (productId: string, quantity?: number) => Promise<void>;
  updateQuantity: (itemId: string, quantity: number) => Promise<void>;
  removeFromCart: (itemId: string) => Promise<void>;
  refreshCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const refreshCart = useCallback(async () => {
    if (!user) {
      setCart(null);
      return;
    }
    setLoading(true);
    try {
      const response = await api.get<APIResponse<Cart>>('/cart');
      if (response.data.success && response.data.data) {
        setCart(response.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch cart:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    refreshCart();
  }, [refreshCart]);

  const addToCart = async (productId: string, quantity = 1) => {
    if (!user) {
      throw new Error('Please login to add items to cart');
    }
    const response = await api.post<APIResponse<Cart>>('/cart/items', {
      product_id: productId,
      quantity,
    });
    if (response.data.success && response.data.data) {
      setCart(response.data.data);
    } else {
      throw new Error(response.data.message || 'Failed to add item to cart');
    }
  };

  const updateQuantity = async (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      return removeFromCart(itemId);
    }
    const response = await api.put<APIResponse<Cart>>(`/cart/items/${itemId}`, { quantity });
    if (response.data.success && response.data.data) {
      setCart(response.data.data);
    }
  };

  const removeFromCart = async (itemId: string) => {
    const response = await api.delete<APIResponse<Cart>>(`/cart/items/${itemId}`);
    if (response.data.success && response.data.data) {
      setCart(response.data.data);
    }
  };

  const itemCount = cart?.items?.reduce((total, item) => total + item.quantity, 0) || 0;

  return (
    <CartContext.Provider
      value={{
        cart,
        itemCount,
        loading,
        addToCart,
        updateQuantity,
        removeFromCart,
        refreshCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
