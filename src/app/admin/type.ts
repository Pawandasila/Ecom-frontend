export interface Variant {
  size: string;
  color: string;
  stock: number;
  price: number;
  sku: string;
  _id: string;
}

export interface Product {
  _id: string;
  name: string;
  description: string;
  category: string;
  basePrice: number;
  discount: number;
  imageUrl: string;
  variants: Variant[];
  averageRating: number;
  totalReviews: number;
}

export interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  address: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export interface OrderItem {
  selectedVariant: {
    size: string;
    color: string;
  };
  product: Product;
  quantity: number;
  _id: string;
}

export interface Order {
  _id: string;
  user: {
    _id: string;
    name: string;
    email: string;
  };
  items: OrderItem[];
  totalPrice: number;
  shippingCost: number;
  status: string;
  createdAt: string;
  updatedAt: string;
  isCancelled: boolean;
}

export interface OrdersResponse {
  orders: Order[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalOrders: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface DashboardStats {
  totalUsers: number;
  totalProducts: number;
  totalOrders: number;
  recentUsers: User[];
  recentProducts: Product[];
}

export interface LowStockProduct {
  name: string;
  stock: number;
  threshold: number;
}

export interface UserResponse {
  success: boolean;
  users: {
    _id: string;
    name: string;
    email: string;
    role: string;
    address: string;
    createdAt: string;
    updatedAt: string;
    __v: number;
  }[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalUsers: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}
