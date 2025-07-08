'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { CreditCard, ShoppingBag, Truck, AlertCircle } from 'lucide-react';
import Link from 'next/link';

interface CartItem {
  _id: string;
  product: {
    _id: string;
    name: string;
    basePrice: number;
    discount: number;
    imageUrl: string;
  };
  selectedVariant: {
    size: string;
    color: string;
  };
  quantity: number;
}

interface ShippingDetails {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
}

export default function CheckoutPage() {
  const router = useRouter();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

  const [shippingDetails, setShippingDetails] = useState<ShippingDetails>({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
  });

  useEffect(() => {
    fetchCart();
    // Auto-fill user details from localStorage
    const userDataString = localStorage.getItem('user');
    if (userDataString) {
      try {
        const userData = JSON.parse(userDataString);
        setShippingDetails(prev => ({
          ...prev,
          fullName: userData.name || '',
          email: userData.email || ''
        }));
      } catch (error) {
        console.error('Error parsing user data:', error);
      }
    }
  }, []);

  const fetchCart = async () => {
    try {
      const response = await axios.get(`${backendUrl}/cart`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem("accessToken")}`
        }
      });

      if (response.data.success) {
        setCartItems(response.data.data.items || []);
      } else {
        setError('Failed to fetch cart items');
      }
    } catch (error) {
      console.error('Error fetching cart:', error);
      setError('Failed to fetch cart items');
    } finally {
      setLoading(false);
    }
  };

  const calculateDiscountedPrice = (basePrice: number, discount: number) => {
    return basePrice - (basePrice * discount / 100);
  };

  const calculateSubtotal = () => {
    return cartItems.reduce((total, item) => {
      const itemPrice = calculateDiscountedPrice(item.product.basePrice, item.product.discount);
      return total + (itemPrice * item.quantity);
    }, 0);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setShippingDetails(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      // Create order with shipping details and cart items
      const orderData = {
        name: shippingDetails.fullName,
        email: shippingDetails.email,
        phone: shippingDetails.phone,
        shippingAddress: `${shippingDetails.address}, ${shippingDetails.city}, ${shippingDetails.state} ${shippingDetails.zipCode}`,
        items: cartItems.map(item => ({
          productId: item.product._id,
          quantity: item.quantity,
          selectedVariant: item.selectedVariant
        })),
        totalAmount: calculateSubtotal()
      };

      console.log('Creating order:', orderData);

      const response = await axios.post(`${backendUrl}/orders`, orderData, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem("accessToken")}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('Order created:', response.data.data._id);

      if (response.data.success) {
        // Clear cart data from localStorage if you're storing it
        localStorage.removeItem('cartItems');
        // Redirect to success page
        router.push('/order-success');
      } else {
        setError(response.data.message || 'Failed to create order');
      }
    } catch (error) {
      console.error('Error creating order:', error);
      if (axios.isAxiosError(error)) {
        setError(error.response?.data?.message || 'Failed to create order');
      } else {
        setError('An unexpected error occurred');
      }
    } finally {
      setIsSubmitting(false);
    }
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
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Error</h3>
          <p className="text-gray-600">{error}</p>
          <Link href="/cart" className="mt-4 inline-block text-blue-600 hover:underline">
            Return to Cart
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Shipping Form */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Shipping Information</h2>
            <form onSubmit={handleCheckout} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    name="fullName"
                    required
                    value={shippingDetails.fullName}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="John Doe"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    required
                    value={shippingDetails.email}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="john@example.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  name="phone"
                  required
                  value={shippingDetails.phone}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="+1 (555) 000-0000"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Address
                </label>
                <input
                  type="text"
                  name="address"
                  required
                  value={shippingDetails.address}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="1234 Main St"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    City
                  </label>
                  <input
                    type="text"
                    name="city"
                    required
                    value={shippingDetails.city}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="City"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    State
                  </label>
                  <input
                    type="text"
                    name="state"
                    required
                    value={shippingDetails.state}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="State"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    ZIP Code
                  </label>
                  <input
                    type="text"
                    name="zipCode"
                    required
                    value={shippingDetails.zipCode}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="12345"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting || cartItems.length === 0}
                className="w-full mt-6 bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <CreditCard className="h-5 w-5" />
                    <span>Place Order</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Order Summary */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Order Summary</h2>
            <div className="space-y-4">
              {cartItems.map((item) => (
                <div key={item._id} className="flex items-center space-x-4">
                  <img
                    src={item.product.imageUrl || "https://via.placeholder.com/100"}
                    alt={item.product.name}
                    className="w-20 h-20 object-cover rounded-lg"
                  />
                  <div className="flex-1">
                    <h3 className="text-lg font-medium text-gray-900">{item.product.name}</h3>
                    <p className="text-sm text-gray-600">
                      Size: {item.selectedVariant.size} | Color: {item.selectedVariant.color}
                    </p>
                    <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-medium text-gray-900">
                      ${(calculateDiscountedPrice(item.product.basePrice, item.product.discount) * item.quantity).toFixed(2)}
                    </p>
                    {item.product.discount > 0 && (
                      <p className="text-sm text-gray-500 line-through">
                        ${(item.product.basePrice * item.quantity).toFixed(2)}
                      </p>
                    )}
                  </div>
                </div>
              ))}

              <div className="border-t border-gray-200 pt-4 mt-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-base text-gray-600">
                    <span>Subtotal</span>
                    <span>${calculateSubtotal().toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-base text-gray-600">
                    <span>Shipping</span>
                    <span className="text-green-600">Free</span>
                  </div>
                  <div className="border-t border-gray-200 pt-2 mt-2">
                    <div className="flex justify-between text-lg font-medium text-gray-900">
                      <span>Total</span>
                      <span>${calculateSubtotal().toFixed(2)}</span>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">Including all taxes</p>
                  </div>
                </div>
              </div>

              <div className="mt-6 space-y-4">
                <div className="flex items-center text-green-600">
                  <Truck className="h-5 w-5 mr-2" />
                  <span>Free shipping on all orders</span>
                </div>
                <div className="flex items-center text-blue-600">
                  <ShoppingBag className="h-5 w-5 mr-2" />
                  <span>{cartItems.length} items in your cart</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}