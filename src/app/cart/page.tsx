'use client';

import React, { useState, useEffect } from 'react';
import { Trash2, MinusCircle, PlusCircle, ArrowLeft, ShoppingBag } from 'lucide-react';
import axios from 'axios';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface ProductVariant {
  size: string;
  color: string;
  stock: number;
  price: number;
  sku: string;
  _id: string;
}

interface CartProduct {
  _id: string;
  name: string;
  description: string;
  imageUrl: string;
  basePrice: number;
  discount: number;
  variants: ProductVariant[];
}

interface CartItem {
  _id: string;
  product: CartProduct;
  quantity: number;
  selectedVariant: {
    size: string;
    color: string;
  };
}

interface Cart {
  _id: string;
  user: string;
  items: CartItem[];
  totalPrice: number;
  createdAt: string;
  updatedAt: string;
}

interface CartResponse {
  success: boolean;
  message: string;
  data: Cart;
}

export default function CartPage() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [totalAmount, setTotalAmount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
  const router = useRouter();

  useEffect(() => {
    fetchCart();
  }, []);

  const fetchCart = async () => {
    try {
      const response = await axios.get<CartResponse>(`${backendUrl}/cart`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem("accessToken")}`
        }
      });

      console.log('Cart Response:', response.data);

      if (response.data.success && response.data.data) {
        setCartItems(response.data.data.items || []);
        setTotalAmount(response.data.data.totalPrice || 0);
      } else {
        console.error('API response indicates failure:', response.data.message);
        setCartItems([]);
        setTotalAmount(0);
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching cart:', error);
      if (axios.isAxiosError(error)) {
        setError(error.response?.data?.message || 'Failed to load cart items');
      } else {
        setError('An unexpected error occurred');
      }
      setCartItems([]);
      setTotalAmount(0);
      setLoading(false);
    }
  };

  const updateQuantity = async (itemId: string, newQuantity: number) => {
    if (newQuantity < 1) return;

    try {
      console.log('Updating quantity for item:', itemId);
      const response = await axios.put(`${backendUrl}/cart/${itemId}`, 
        { quantity: newQuantity },
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem("accessToken")}`,
            'Content-Type': 'application/json'
          }
        }
      );

      console.log('Update response:', response.data);

      if (response.data.success) {
        await fetchCart(); // Refresh cart after update
      } else {
        alert(response.data.message || 'Failed to update quantity');
      }
    } catch (error) {
      console.error('Error updating quantity:', error);
      if (axios.isAxiosError(error)) {
        alert(error.response?.data?.message || 'Failed to update quantity');
      } else {
        alert('An unexpected error occurred');
      }
    }
  };

  const removeItem = async (itemId: string) => {
    try {
      console.log('Removing item:', itemId);
      const response = await axios.delete(`${backendUrl}/cart/${itemId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem("accessToken")}`
        }
      });

      console.log('Remove response:', response.data);

      if (response.data.success) {
        await fetchCart(); // Refresh cart after removal
      } else {
        alert(response.data.message || 'Failed to remove item');
      }
    } catch (error) {
      console.error('Error removing item:', error);
      if (axios.isAxiosError(error)) {
        alert(error.response?.data?.message || 'Failed to remove item');
      } else {
        alert('An unexpected error occurred');
      }
    }
  };

  const calculateDiscountedPrice = (basePrice: number, discount: number) => {
    return basePrice - (basePrice * discount / 100);
  };

  const calculateCartTotal = () => {
    return cartItems.reduce((total, item) => {
      const itemPrice = calculateDiscountedPrice(item.product.basePrice, item.product.discount);
      return total + (itemPrice * item.quantity);
    }, 0);
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
          <p className="text-red-600 mb-4">{error}</p>
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
          <ArrowLeft className="h-5 w-5 mr-2" />
          <span>Continue Shopping</span>
        </Link>

        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="p-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-8">Shopping Cart</h1>

            {cartItems.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg mb-4">Your cart is empty</p>
                <Link 
                  href="/products" 
                  className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                >
                  Start Shopping
                </Link>
              </div>
            ) : (
              <>
                {/* Cart Items */}
                <div className="divide-y divide-gray-200">
                  {cartItems.map((item) => (
                    <div key={item._id} className="py-6 flex items-center">
                      {/* Product Image */}
                      <img
                        src={item.product.imageUrl || "https://via.placeholder.com/150"}
                        alt={item.product.name}
                        className="w-24 h-24 object-cover rounded-lg"
                      />

                      {/* Product Details */}
                      <div className="ml-6 flex-1">
                        <h3 className="text-lg font-medium text-gray-900">{item.product.name}</h3>
                        <p className="mt-1 text-sm text-gray-500">
                          Size: {item.selectedVariant.size} | Color: {item.selectedVariant.color}
                        </p>
                        <div className="mt-2 flex items-center space-x-4">
                          <span className="text-lg font-medium text-gray-900">
                            ${calculateDiscountedPrice(item.product.basePrice, item.product.discount).toFixed(2)}
                          </span>
                          {item.product.discount > 0 && (
                            <span className="text-sm text-gray-500 line-through">
                              ${item.product.basePrice.toFixed(2)}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Quantity Controls */}
                      <div className="flex items-center space-x-4">
                        <button
                          onClick={() => updateQuantity(item._id, item.quantity - 1)}
                          className="text-gray-400 hover:text-gray-600"
                          disabled={item.quantity <= 1}
                        >
                          <MinusCircle className="h-5 w-5" />
                        </button>
                        <span className="text-gray-600 w-8 text-center">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item._id, item.quantity + 1)}
                          className="text-gray-400 hover:text-gray-600"
                        >
                          <PlusCircle className="h-5 w-5" />
                        </button>
                      </div>

                      {/* Remove Button */}
                      <button
                        onClick={() => removeItem(item._id)}
                        className="ml-6 text-red-500 hover:text-red-600"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Cart Summary */}
                <div className="mt-8 bg-white rounded-lg shadow-md p-6">
                  <h2 className="text-lg font-medium text-gray-900 mb-4">Cart Summary</h2>
                  <div className="space-y-2">
                    <div className="flex justify-between text-base text-gray-600">
                      <span>Subtotal</span>
                      <span>${calculateCartTotal().toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-base text-gray-600">
                      <span>Shipping</span>
                      <span>Free</span>
                    </div>
                    <div className="border-t border-gray-200 pt-2 mt-2">
                      <div className="flex justify-between text-lg font-medium text-gray-900">
                        <span>Total</span>
                        <span>${calculateCartTotal().toFixed(2)}</span>
                      </div>
                      <p className="text-sm text-gray-500 mt-1">Including all taxes</p>
                    </div>
                    <button
                      onClick={() => router.push('/checkout')}
                      className="w-full mt-6 bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
                    >
                      <ShoppingBag className="h-5 w-5" />
                      <span>Proceed to Checkout</span>
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}