'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Star, StarHalf, ShoppingCart, ChevronLeft } from 'lucide-react';
import axios from 'axios';
import Link from 'next/link';
import { ApiResponse, Product } from '@/app/products/types';
import { useRouter } from 'next/navigation';

export default function ProductDetailPage() {
  const { id } = useParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [selectedVariant, setSelectedVariant] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [quantity, setQuantity] = useState(1);
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
  const router = useRouter();

  useEffect(() => {
    fetchProductDetails();
  }, [id]);

  const fetchProductDetails = async () => {
    try {
      const response = await axios.get<ApiResponse>(`${backendUrl}/products/${id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem("accessToken")}`,
          // Add cache control headers to force fresh response
          // 'Cache-Control': 'no-cache',
          // 'Pragma': 'no-cache'
        }
      });
      
      
      if (response.data.success) {
        // Handle single object response
        const productData = response.data.data;
        if (productData && !Array.isArray(productData)) {
          setProduct(productData);
        } else {
          console.error('Invalid product data:', response.data);
          setError('Product not found or invalid data');
        }
      } else {
        console.error('API response indicates failure:', response.data);
        setError(response.data.message || 'Failed to load product details');
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching product details:', error);
      if (axios.isAxiosError(error)) {
        console.error('Response data:', error.response?.data);
        console.error('Response status:', error.response?.status);
        setError(error.response?.data?.message || 'Failed to load product details');
      } else {
        setError('An unexpected error occurred');
      }
      setLoading(false);
    }
  };

  const renderRatingStars = (rating: number) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    
    return (
      <div className="flex items-center space-x-1">
        {[...Array(fullStars)].map((_, i) => (
          <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
        ))}
        {hasHalfStar && <StarHalf className="h-5 w-5 fill-yellow-400 text-yellow-400" />}
        <span className="text-sm text-gray-600 ml-1">({rating})</span>
      </div>
    );
  };

  const calculateDiscountedPrice = (basePrice: number, discount: number) => {
    return basePrice - (basePrice * discount / 100);
  };

  const addToCart = async () => {
    if (!product || !selectedVariant) return;
    
    const variant = product.variants.find(v => v._id === selectedVariant);
    if (!variant) return;

    try {
      const cartData = {
        productId: product._id,
        quantity: quantity,
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
        alert('Product added to cart successfully!');
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error || 'Product not found'}</p>
          <Link href="/products" className="text-blue-600 hover:underline">
            Return to Products
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <Link href="/products" className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-6">
          <ChevronLeft className="h-5 w-5" />
          <span>Back to Products</span>
        </Link>

        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-8">
            {/* Product Image */}
            <div className="relative">
              <img
                src={product.imageUrl || "https://via.placeholder.com/600"}
                alt={product.name}
                className="w-full h-[500px] object-cover rounded-lg"
              />
              {product.discount > 0 && (
                <div className="absolute top-4 right-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                  {product.discount}% OFF
                </div>
              )}
            </div>

            {/* Product Info */}
            <div className="space-y-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{product.name}</h1>
                <p className="text-gray-600 mt-2">{product.description}</p>
              </div>

              <div className="flex items-center space-x-4">
                <div className="flex flex-col">
                  <span className="text-3xl font-bold text-gray-900">
                    ${calculateDiscountedPrice(product.basePrice, product.discount).toFixed(2)}
                  </span>
                  {product.discount > 0 && (
                    <span className="text-lg text-gray-500 line-through">
                      ${product.basePrice.toFixed(2)}
                    </span>
                  )}
                </div>
                {product.averageRating > 0 && renderRatingStars(product.averageRating)}
              </div>

              {/* Variants Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Select Size</label>
                <select
                  value={selectedVariant}
                  onChange={(e) => setSelectedVariant(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg py-2 px-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Choose a size</option>
                  {product.variants.map((variant) => (
                    <option 
                      key={variant._id} 
                      value={variant._id}
                      disabled={variant.stock === 0}
                    >
                      {variant.size} - ${variant.price} ({variant.stock} available)
                    </option>
                  ))}
                </select>
              </div>

              {/* Quantity Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Quantity</label>
                <select
                  value={quantity}
                  onChange={(e) => setQuantity(Number(e.target.value))}
                  className="w-full border border-gray-300 rounded-lg py-2 px-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {[...Array(10)].map((_, i) => (
                    <option key={i + 1} value={i + 1}>
                      {i + 1}
                    </option>
                  ))}
                </select>
              </div>

              {/* Add to Cart Button */}
              <button
                onClick={addToCart}
                disabled={!selectedVariant}
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ShoppingCart className="h-5 w-5" />
                <span>Add to Cart</span>
              </button>

              {/* Additional Info */}
              <div className="border-t border-gray-200 pt-6 space-y-4">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">Product Details</h3>
                  <p className="text-gray-600 mt-2">Category: {product.category}</p>
                </div>

                {/* Reviews Section */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900">Reviews ({product.totalReviews})</h3>
                  <div className="mt-4 space-y-4">
                    {product.reviews.map((review) => (
                      <div key={review._id} className="border-b border-gray-200 pb-4">
                        <div className="flex items-center mb-2">
                          {renderRatingStars(review.rating)}
                        </div>
                        <p className="text-gray-600">{review.comment}</p>
                        <p className="text-sm text-gray-500 mt-1">
                          {new Date(review.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}