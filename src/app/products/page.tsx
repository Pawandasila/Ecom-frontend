"use client";

import React, { useState, useEffect } from "react";
import {
  ShoppingCart,
  Star,
  StarHalf,
  ShoppingBag,
  Badge,
  User,
  Grid,
  List,
  Heart,
  Pencil,
  Trash2
} from "lucide-react";
import axios from "axios";
import { ApiResponse, CartItem, Product } from "./types";
import { useRouter, useSearchParams } from "next/navigation";

import {
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuContent
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function ProductsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<{[key: string]: CartItem}>({});
  const [selectedVariants, setSelectedVariants] = useState<{[key: string]: string}>({});
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalProducts: 0,
    hasNextPage: false,
    hasPrevPage: false
  });
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
  const [userRole, setUserRole] = useState<string>('customer');

  useEffect(() => {
    const page = searchParams?.get('page') || '1';
    fetchProducts(Number(page));
    
    // Get user role from localStorage
    const user = localStorage.getItem('user');
    if (user) {
      const userData = JSON.parse(user);
      setUserRole(userData.role);
    }
  }, []);

  const fetchProducts = async (page: number = 1) => {
    try {
      setLoading(true);
      let url = new URL(`${backendUrl}/products/`);
      
      // Add query parameters
      const params = new URLSearchParams();
      params.append('page', page.toString());
      params.append('limit', '9');
      
      url.search = params.toString();

      const response = await axios.get<ApiResponse>(url.toString(), {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem("accessToken")}`,
        }
      });
      
      if (response.data.success) {
        if (Array.isArray(response.data.data)) {
          setProducts(response.data.data);
          if (response.data.pagination) {
            setPagination({
              currentPage: response.data.pagination.currentPage || 1,
              totalPages: response.data.pagination.totalPages || 1,
              totalProducts: response.data.pagination.totalProducts || 0,
              hasNextPage: response.data.pagination.hasNextPage || false,
              hasPrevPage: response.data.pagination.hasPrevPage || false
            });
          }
        } else {
          console.error('Products data is not an array:', response.data.data);
          setProducts([]);
        }
      } else {
        console.error('API response indicates failure:', response.data);
        setProducts([]);
      }
    } catch (error) {
      console.error("Error fetching products:", error);
      if (axios.isAxiosError(error)) {
        console.error('Response data:', error.response?.data);
        console.error('Response status:', error.response?.status);
      }
      setError("Failed to fetch products");
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = async (product: Product, variantId: string) => {
    const variant = product.variants.find(v => v._id === variantId);
    if (!variant) return;

    try {
      const cartData = {
        productId: product._id,
        quantity: 1,
        selectedVariant: {
          size: variant.size,
          color: variant.color
        }
      };

      const response = await axios.post(`${backendUrl}/cart`, cartData, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem("accessToken")}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.data.success) {
        setCart(prevCart => ({
          ...prevCart,
          [variantId]: {
            ...variant,
            productId: product._id,
            productName: product.name,
            quantity: (prevCart[variantId]?.quantity || 0) + 1
          }
        }));
        router.refresh();
      } else {
        alert(response.data.message || 'Failed to add to cart');
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      if (axios.isAxiosError(error)) {
        alert(error.response?.data?.message || 'Failed to add to cart');
      }
    }
  };

  const calculateDiscountedPrice = (basePrice: number, discount: number) => {
    return basePrice - (basePrice * discount / 100);
  };

  const renderRatingStars = (rating: number) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    
    return (
      <div className="flex items-center space-x-1">
        {[...Array(fullStars)].map((_, i) => (
          <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
        ))}
        {hasHalfStar && <StarHalf className="h-4 w-4 fill-yellow-400 text-yellow-400" />}
        <span className="text-sm text-gray-600 ml-1">({rating})</span>
      </div>
    );
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      fetchProducts(newPage);
      router.push(`/products?page=${newPage}`);
    }
  };

  const toggleFavorite = (productId: string) => {
    setFavorites(prev => {
      const newFavorites = new Set(prev);
      if (newFavorites.has(productId)) {
        newFavorites.delete(productId);
      } else {
        newFavorites.add(productId);
      }
      return newFavorites;
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-xl mb-4">{error}</div>
          <Button
            onClick={() => fetchProducts(1)}
            variant="outline"
            className="text-blue-600 hover:text-blue-800"
          >
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Our Products
              </h1>
              <Badge className="bg-red-100 text-red-700 hover:bg-red-200">
                New Arrivals
              </Badge>
            </div>

            <div className="flex items-center space-x-4">
              {userRole === 'admin' && (
                <Button
                  variant="default"
                  className="bg-green-600 hover:bg-green-700"
                  onClick={() => router.push('/admin/products/new')}
                >
                  Add New Product
                </Button>
              )}

              <div className="relative">
                <Button
                  variant="outline"
                  size="icon"
                  className="relative"
                  onClick={() => router.push("/cart")}
                >
                  <ShoppingCart className="h-5 w-5" />
                  {Object.values(cart).reduce((a, b) => a + b.quantity, 0) > 0 && (
                    <Badge className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 bg-blue-600">
                      {Object.values(cart).reduce((a, b) => a + b.quantity, 0)}
                    </Badge>
                  )}
                </Button>
              </div>

              <Button
                variant="outline"
                className="flex items-center space-x-2"
                onClick={() => router.push("/orders")}
              >
                <ShoppingBag className="h-4 w-4" />
                <span>Orders</span>
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    className="bg-gradient-to-r from-blue-500 to-purple-500 text-white border-0 hover:from-blue-600 hover:to-purple-600"
                  >
                    <User className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem>Profile</DropdownMenuItem>
                  {userRole === 'admin' && (
                    <DropdownMenuItem onClick={() => router.push('/admin/dashboard')}>
                      Admin Dashboard
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem>Settings</DropdownMenuItem>
                  <DropdownMenuItem>Order History</DropdownMenuItem>
                  <DropdownMenuItem>Logout</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => (
            <Card
              key={product._id}
              className="group overflow-hidden hover:shadow-xl transition-all duration-300 bg-white/80 backdrop-blur-sm border-gray-200"
            >
              <div className="relative">
                <img
                  src={product.imageUrl || "https://via.placeholder.com/300"}
                  alt={product.name}
                  className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                />
                {product.discount > 0 && (
                  <Badge className="absolute top-3 left-3 bg-red-500 hover:bg-red-600 text-white">
                    {product.discount}% OFF
                  </Badge>
                )}
                {userRole === 'admin' && (
                  <div className="absolute top-3 right-3 flex space-x-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="bg-white/80 backdrop-blur-sm hover:bg-white"
                      onClick={() => router.push(`/admin/products/edit/${product._id}`)}
                    >
                      <Pencil className="h-4 w-4 text-blue-600" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="bg-white/80 backdrop-blur-sm hover:bg-white"
                      onClick={() => {
                        if (confirm('Are you sure you want to delete this product?')) {
                          // Add delete functionality
                        }
                      }}
                    >
                      <Trash2 className="h-4 w-4 text-red-600" />
                    </Button>
                  </div>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-3 right-3 bg-white/80 backdrop-blur-sm hover:bg-white"
                  onClick={() => toggleFavorite(product._id)}
                >
                  <Heart
                    className={`h-4 w-4 ${
                      favorites.has(product._id)
                        ? "fill-red-500 text-red-500"
                        : "text-gray-600"
                    }`}
                  />
                </Button>
              </div>

              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <h3 
                    onClick={() => router.push(`/productDetail/${product._id}`)}
                    className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors cursor-pointer line-clamp-1"
                  >
                    {product.name}
                  </h3>
                  {product.averageRating > 0 && (
                    <div className="flex-shrink-0">
                      {renderRatingStars(product.averageRating)}
                    </div>
                  )}
                </div>

                <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                  {product.description}
                </p>

                <div className="mb-4">
                  <Select
                    value={selectedVariants[product._id] || ""}
                    onValueChange={(value) =>
                      setSelectedVariants((prev) => ({
                        ...prev,
                        [product._id]: value,
                      }))
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select Size" />
                    </SelectTrigger>
                    <SelectContent>
                      {product.variants.map((variant) => (
                        <SelectItem key={variant._id} value={variant._id}>
                          {variant.size} - ${variant.price} ({variant.stock} available)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="text-xl font-bold text-gray-900">
                      ${calculateDiscountedPrice(product.basePrice, product.discount).toFixed(2)}
                    </span>
                    {product.discount > 0 && (
                      <span className="text-sm text-gray-500 line-through">
                        ${product.basePrice.toFixed(2)}
                      </span>
                    )}
                  </div>

                  <Button
                    onClick={() =>
                      selectedVariants[product._id] &&
                      addToCart(product, selectedVariants[product._id])
                    }
                    disabled={!selectedVariants[product._id]}
                    className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white border-0 flex items-center space-x-2"
                  >
                    <ShoppingCart className="h-4 w-4" />
                    <span>Add to Cart</span>
                  </Button>
                </div>

                {cart[selectedVariants[product._id]] && (
                  <div className="mt-2 text-sm text-blue-600 font-medium">
                    {cart[selectedVariants[product._id]].quantity} in cart
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {pagination.totalPages > 1 && (
          <div className="mt-8 flex items-center justify-center space-x-4">
            <Button
              onClick={() => handlePageChange(pagination.currentPage - 1)}
              disabled={!pagination.hasPrevPage}
              variant="outline"
            >
              Previous
            </Button>
            <span className="text-sm text-gray-700">
              Page {pagination.currentPage} of {pagination.totalPages}
            </span>
            <Button
              onClick={() => handlePageChange(pagination.currentPage + 1)}
              disabled={!pagination.hasNextPage}
              variant="outline"
            >
              Next
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
