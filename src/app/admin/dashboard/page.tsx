"use client";

import React, { useEffect, useState } from "react";
import { AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import axios from "axios";
import { DashboardStats, LowStockProduct, UserResponse } from "../type";


export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalProducts: 0,
    totalOrders: 0,
    recentUsers: [],
    recentProducts: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);

        const token = localStorage.getItem("accessToken");
        if (!token) {
          throw new Error("No access token found");
        }

        const headers = {
          Authorization: `Bearer ${token}`,
        };

        const [usersRes, productsRes, ordersRes] = await Promise.all([
          axios.get<UserResponse>(`${backendUrl}/users/all`, { headers }),
          axios.get(`${backendUrl}/products/`, { headers }),
          axios.get(`${backendUrl}/orders/all`, { headers }),
        ]);

        console.log("Users Response:", usersRes.data);
        console.log("Products Response:", productsRes.data);
        console.log("Orders Response:", ordersRes.data);

        const users = usersRes.data?.users || [];
        const products = productsRes.data?.data || productsRes.data || [];
        const orders =
          ordersRes.data?.orders ||
          ordersRes.data?.data ||
          ordersRes.data ||
          [];

        setStats({
          totalUsers: usersRes.data.pagination.totalUsers,
          totalProducts: products.length,
          totalOrders: orders.length,
          recentUsers: users,
          recentProducts: products,
        });
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        setError(
          error instanceof Error
            ? error.message
            : "Failed to fetch dashboard data"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [backendUrl]);

  const recentOrders = [
    {
      id: "#12345",
      customer: "John Doe",
      amount: "$120.00",
      status: "Completed",
    },
    {
      id: "#12346",
      customer: "Jane Smith",
      amount: "$85.00",
      status: "Processing",
    },
    {
      id: "#12347",
      customer: "Mike Johnson",
      amount: "$200.00",
      status: "Pending",
    },
  ];

  const lowStockProducts: LowStockProduct[] = stats.recentProducts
    .filter((product) => {
      const totalStock =
        product.variants?.reduce(
          (sum, variant) => sum + (variant.stock || 0),
          0
        ) || 0;
      return totalStock < 50;
    })
    .slice(0, 3)
    .map((product) => ({
      name: product.name,
      stock:
        product.variants?.reduce(
          (sum, variant) => sum + (variant.stock || 0),
          0
        ) || 0,
      threshold: 50,
    }));

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-center items-center h-64">
            <div className="text-lg">Loading dashboard data...</div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-center items-center h-64">
            <Card className="p-6">
              <div className="flex items-center space-x-2 text-red-600">
                <AlertCircle className="h-5 w-5" />
                <span>Error: {error}</span>
              </div>
              <Button
                onClick={() => window.location.reload()}
                className="mt-4"
                variant="outline"
              >
                Retry
              </Button>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <div className="flex space-x-4">
            <Button variant="outline">Download Report</Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button>Actions</Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem>Add Product</DropdownMenuItem>
                <DropdownMenuItem>Manage Users</DropdownMenuItem>
                <DropdownMenuItem>View Reports</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Card className="p-6">
            <h3 className="text-lg font-medium">Total Users</h3>
            <p className="mt-2 text-3xl font-bold">{stats.totalUsers}</p>
          </Card>
          <Card className="p-6">
            <h3 className="text-lg font-medium">Total Products</h3>
            <p className="mt-2 text-3xl font-bold">{stats.totalProducts}</p>
          </Card>
          <Card className="p-6">
            <h3 className="text-lg font-medium">Total Orders</h3>
            <p className="mt-2 text-3xl font-bold">{stats.totalOrders}</p>
          </Card>
        </div>

        {/* Recent Users */}
        <div className="mt-8">
          <h2 className="text-xl font-bold mb-4">Users</h2>
          <div className="overflow-x-auto">
            {stats.recentUsers.length > 0 ? (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Role
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Created At
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Updated At
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {stats.recentUsers.map((user) => (
                    <tr key={user._id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {user.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {user.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            user.role === "admin"
                              ? "bg-purple-100 text-purple-800"
                              : "bg-green-100 text-green-800"
                          }`}
                        >
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {new Date(user.updatedAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <Card className="p-6">
                <p className="text-gray-500">No users found</p>
              </Card>
            )}
          </div>
        </div>

        {/* Recent Products */}
        <div className="mt-8">
          <h2 className="text-xl font-bold mb-4">Recent Products</h2>
          <div className="overflow-x-auto">
            {stats.recentProducts.length > 0 ? (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Image
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Base Price
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Stock
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Category
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Rating
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {stats.recentProducts.map((product) => (
                    <tr key={product._id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <img
                          src={product.imageUrl}
                          alt={product.name}
                          className="h-12 w-12 object-cover rounded-md"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {product.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        ₹{product.basePrice}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {product.variants.reduce(
                          (sum, variant) => sum + variant.stock,
                          0
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {product.category}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {product.averageRating.toFixed(1)} (
                        {product.totalReviews})
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <Card className="p-6">
                <p className="text-gray-500">No products found</p>
              </Card>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
          {/* Recent Orders */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Orders</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentOrders.map((order) => (
                  <div
                    key={order.id}
                    className="flex items-center justify-between p-4 bg-white rounded-lg shadow-sm"
                  >
                    <div>
                      <div className="font-medium">{order.id}</div>
                      <div className="text-sm text-gray-500">
                        {order.customer}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">{order.amount}</div>
                      <div className="text-sm text-green-500">
                        {order.status}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Low Stock Alert */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
                Low Stock Alerts
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {lowStockProducts.length > 0 ? (
                  lowStockProducts.map((product, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-4 bg-white rounded-lg shadow-sm"
                    >
                      <div>
                        <div className="font-medium">{product.name}</div>
                        <div className="text-sm text-gray-500">
                          Stock: {product.stock} / {product.threshold}
                        </div>
                      </div>
                      <Button variant="outline" size="sm">
                        Restock
                      </Button>
                    </div>
                  ))
                ) : (
                  <div className="text-gray-500">No low stock items</div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
