export interface Variant {
  _id: string;
  size: string;
  color: string;
  stock: number;
  price: number;
  sku: string;
}

export interface Review {
  _id: string;
  user: string;
  rating: number;
  comment: string;
  createdAt: string;
  updatedAt: string;
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
  reviews: Review[];
  createdAt: string;
  updatedAt: string;
}

export interface ApiResponse {
  success: boolean;
  message: string;
  data: Product | Product[];
  pagination?: {
    currentPage: number;
    totalPages: number;
    totalProducts: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

export interface CartItem extends Variant {
  productId: string;
  productName: string;
  quantity: number;
}
