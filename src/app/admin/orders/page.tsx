'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

import { Card } from '@/components/ui/card';
import axios from 'axios';
import Image from 'next/image';

interface Variant {
  size: string;
  color: string;
  stock: number;
  price: number;
  sku: string;
  _id: string;
}

interface Product {
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

interface OrderItem {
  selectedVariant: {
    size: string;
    color: string;
  };
  product: Product;
  quantity: number;
  _id: string;
}

interface OrderResponse {
  success: boolean;
  message: string;
  data: {
    orders: Order[];
    pagination: {
      currentPage: number;
      totalPages: number;
      totalOrders: number;
      hasNext: boolean;
      hasPrev: boolean;
    };
  };
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
  __v: number;
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

  useEffect(() => {
    fetchOrders();
  }, [currentPage]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem('accessToken');
      if (!token) {
        throw new Error('No access token found');
      }

      const response = await axios.get<OrderResponse>(`${backendUrl}/orders/all`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params: {
          page: currentPage,
          limit: 10,
        },
      });

      if (!response.data?.data?.orders) {
        throw new Error('Invalid response format from server');
      }

      setOrders(response.data.data.orders);
      setTotalPages(response.data.data.pagination.totalPages);
    } catch (error) {
      console.error('Error fetching orders:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch orders');
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        throw new Error('No access token found');
      }

      await axios.put(
        `${backendUrl}/orders/${orderId}`,
        { status: newStatus },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      fetchOrders();
    } catch (error) {
      console.error('Error updating order status:', error);
      setError(error instanceof Error ? error.message : 'Failed to update order status');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'shipped':
        return 'bg-purple-100 text-purple-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const viewOrderDetails = (order: Order) => {
    setSelectedOrder(order);
    setIsDialogOpen(true);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg">Loading orders...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-64">
        <Card className="p-6">
          <div className="text-red-600 mb-4">Error: {error}</div>
          <Button onClick={fetchOrders} variant="outline">
            Retry
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Orders Management</h1>
      </div>

      {orders.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-gray-500">No orders found</p>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order ID</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Items</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Shipping</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Delivery Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map((order) => (
                  <TableRow key={order._id} className={order.isCancelled ? 'bg-red-50' : ''}>
                    <TableCell className="font-medium">{order._id}</TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{order.user.name}</div>
                        <div className="text-sm text-gray-500">{order.user.email}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {order.items.map((item, index) => (
                          <div key={item._id} className="mb-1">
                            {item.quantity}x {item.product.name}
                            <span className="text-gray-500">
                              ({item.selectedVariant.size}, {item.selectedVariant.color})
                            </span>
                          </div>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>₹{order.totalPrice}</TableCell>
                    <TableCell>₹{order.shippingCost}</TableCell>
                    <TableCell>
                      <span
                        className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(
                          order.status
                        )}`}
                      >
                        {order.status}
                      </span>
                    </TableCell>
                    <TableCell>
                      {new Date(order.estimatedDeliveryDate).toLocaleDateString()}
                    </TableCell>
                    
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {totalPages > 1 && (
            <div className="flex justify-center mt-4 space-x-2">
              <Button
                variant="outline"
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              <span className="py-2 px-4">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                variant="outline"
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </div>
          )}
        </>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Order Details</DialogTitle>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="font-medium mb-2">Customer Information</h3>
                  <p>Name: {selectedOrder.user.name}</p>
                  <p>Email: {selectedOrder.user.email}</p>
                  <p className="mt-2">Shipping Address:</p>
                  <p className="text-sm text-gray-600">{selectedOrder.shippingAddress}</p>
                </div>
                <div>
                  <h3 className="font-medium mb-2">Order Information</h3>
                  <p>Order ID: {selectedOrder._id}</p>
                  <p>Order Date: {new Date(selectedOrder.createdAt).toLocaleString()}</p>
                  <p>Status: {selectedOrder.status}</p>
                  <p>Estimated Delivery: {new Date(selectedOrder.estimatedDeliveryDate).toLocaleDateString()}</p>
                  {selectedOrder.notes && (
                    <div className="mt-2">
                      <p className="font-medium">Notes:</p>
                      <p className="text-sm text-gray-600">{selectedOrder.notes}</p>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <h3 className="font-medium mb-4">Order Items</h3>
                <div className="space-y-4">
                  {selectedOrder.items.map((item) => (
                    <div
                      key={item._id}
                      className="flex items-center space-x-4 p-4 border rounded-lg"
                    >
                      <div className="relative w-16 h-16">
                        <Image
                          src={item.product.imageUrl}
                          alt={item.product.name}
                          fill
                          className="object-cover rounded-lg"
                        />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium">{item.product.name}</h4>
                        <p className="text-sm text-gray-500">
                          Size: {item.selectedVariant.size}, Color: {item.selectedVariant.color}
                        </p>
                        <p className="text-sm">Quantity: {item.quantity}</p>
                        <p className="text-sm">Base Price: ₹{item.product.basePrice}</p>
                        {item.product.discount > 0 && (
                          <p className="text-sm text-green-600">Discount: {item.product.discount}%</p>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="font-medium">
                          ₹{(item.product.basePrice * (1 - item.product.discount / 100) * item.quantity).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t pt-4">
                <div className="flex justify-between items-center">
                  <span>Subtotal</span>
                  <span>₹{(selectedOrder.totalPrice - selectedOrder.shippingCost).toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center mt-2">
                  <span>Shipping</span>
                  <span>₹{selectedOrder.shippingCost.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center mt-2 text-lg font-medium">
                  <span>Total</span>
                  <span>₹{selectedOrder.totalPrice.toFixed(2)}</span>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
} 