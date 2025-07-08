'use client';

import React, { useState, useEffect } from 'react';
import { Package, ChevronLeft, ChevronRight, Calendar, MapPin, AlertCircle, Truck, XCircle, CheckCircle, Clock } from 'lucide-react';
import axios from 'axios';
import Link from 'next/link';

interface OrderItem {
  selectedVariant: {
    size: string;
    color: string;
  };
  product: {
    _id: string;
    name: string;
    description: string;
    basePrice: number;
    discount: number;
    imageUrl: string;
  };
  quantity: number;
  _id: string;
}

interface Order {
  _id: string;
  user: {
    _id: string;
    name: string;
    email: string;
  };
  items: OrderItem[];
  totalPrice: number;
  shippingCost: number;
  shippingAddress: string;
  status: string;
  estimatedDeliveryDate: string;
  isCancelled: boolean;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalOrders: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [pagination, setPagination] = useState<PaginationInfo>({
    currentPage: 1,
    totalPages: 1,
    totalOrders: 0,
    hasNext: false,
    hasPrev: false
  });
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

  const fetchOrders = async (page: number = 1) => {
    try {
      setLoading(true);
      const response = await axios.get(`${backendUrl}/orders/all?page=${page}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem("accessToken")}`
        }
      });

      if (response.data.success) {
        setOrders(response.data.data.orders);
        setPagination(response.data.data.pagination);
      } else {
        setError('Failed to fetch orders');
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      setError('Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      fetchOrders(newPage);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getStatusColor = (status: string, isCancelled: boolean) => {
    if (isCancelled) return 'text-red-600';
    switch (status.toLowerCase()) {
      case 'delivered':
        return 'text-green-600';
      case 'pending':
        return 'text-yellow-600';
      case 'processing':
        return 'text-blue-600';
      default:
        return 'text-gray-600';
    }
  };

  const getStatusIcon = (status: string, isCancelled: boolean) => {
    if (isCancelled) return <XCircle className="h-5 w-5 text-red-600" />;
    switch (status.toLowerCase()) {
      case 'delivered':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'pending':
        return <Clock className="h-5 w-5 text-yellow-600" />;
      case 'processing':
        return <Truck className="h-5 w-5 text-blue-600" />;
      default:
        return <Package className="h-5 w-5 text-gray-600" />;
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
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-8">My Orders</h1>

        <div className="space-y-6">
          {orders.map((order) => (
            <div key={order._id} className="bg-white rounded-lg shadow-md p-6">
              {/* Order Header */}
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-lg font-medium text-gray-900">
                    Order #{order._id}
                  </h2>
                  <p className="text-sm text-gray-500">
                    Placed on {formatDate(order.createdAt)}
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  {getStatusIcon(order.status, order.isCancelled)}
                  <span className={`font-medium ${getStatusColor(order.status, order.isCancelled)}`}>
                    {order.isCancelled ? 'Cancelled' : order.status}
                  </span>
                </div>
              </div>

              {/* Order Items */}
              <div className="border-t border-b border-gray-200 py-4 mb-4">
                {order.items.map((item) => (
                  <div key={item._id} className="flex items-center py-2">
                    <img
                      src={item.product.imageUrl || "https://via.placeholder.com/100"}
                      alt={item.product.name}
                      className="w-16 h-16 object-cover rounded-lg"
                    />
                    <div className="ml-4 flex-1">
                      <h3 className="text-sm font-medium text-gray-900">
                        {item.product.name}
                      </h3>
                      <p className="text-sm text-gray-500">
                        Size: {item.selectedVariant.size} | Color: {item.selectedVariant.color}
                      </p>
                      <p className="text-sm text-gray-500">
                        Quantity: {item.quantity}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">
                        ${((item.product.basePrice - (item.product.basePrice * item.product.discount / 100)) * item.quantity).toFixed(2)}
                      </p>
                      {item.product.discount > 0 && (
                        <p className="text-xs text-gray-500 line-through">
                          ${(item.product.basePrice * item.quantity).toFixed(2)}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Order Footer */}
              <div className="flex flex-col md:flex-row md:justify-between">
                <div className="flex items-start space-x-2 mb-4 md:mb-0">
                  <MapPin className="h-5 w-5 text-gray-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Shipping Address</p>
                    <p className="text-sm text-gray-500">{order.shippingAddress}</p>
                  </div>
                </div>
                <div className="flex flex-col text-right">
                  <div className="text-sm text-gray-500">
                    <span>Subtotal: ${order.totalPrice.toFixed(2)}</span>
                  </div>
                  <div className="text-sm text-gray-500">
                    <span>Shipping: ${order.shippingCost.toFixed(2)}</span>
                  </div>
                  <div className="text-base font-medium text-gray-900">
                    <span>Total: ${(order.totalPrice + order.shippingCost).toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="mt-8 flex items-center justify-center space-x-4">
            <button
              onClick={() => handlePageChange(pagination.currentPage - 1)}
              disabled={!pagination.hasPrev}
              className="flex items-center px-3 py-2 border rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="h-5 w-5 mr-1" />
              Previous
            </button>
            <span className="text-sm text-gray-600">
              Page {pagination.currentPage} of {pagination.totalPages}
            </span>
            <button
              onClick={() => handlePageChange(pagination.currentPage + 1)}
              disabled={!pagination.hasNext}
              className="flex items-center px-3 py-2 border rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
              <ChevronRight className="h-5 w-5 ml-1" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}