export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: 'customer' | 'admin';
  created_at: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  image_url?: string;
  description?: string;
  created_at: string;
}

export interface Product {
  id: string;
  category_id: string;
  category?: Category;
  name: string;
  slug: string;
  description?: string;
  price: number;
  stock: number;
  weight_grams: number;
  image_url?: string;
  is_active: boolean;
  created_at: string;
}

export interface CartItem {
  id: string;
  cart_id: string;
  product_id: string;
  product?: Product;
  quantity: number;
  created_at: string;
}

export interface Cart {
  id: string;
  user_id: string;
  items: CartItem[];
  updated_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  product?: Product;
  product_name: string;
  price: number;
  quantity: number;
  subtotal: number;
}

export interface Order {
  id: string;
  order_number: string;
  user_id: string;
  user?: User;
  total_amount: number;
  shipping_fee: number;
  status: 'pending' | 'paid' | 'processing' | 'shipped' | 'completed' | 'cancelled';
  shipping_address: string;
  payment_method?: string;
  payment_status: 'unpaid' | 'paid' | 'failed';
  items: OrderItem[];
  created_at: string;
  updated_at: string;
}

export interface APIResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}
