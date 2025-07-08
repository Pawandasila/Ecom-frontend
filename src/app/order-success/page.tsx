'use client';

import React from 'react';
import { CheckCircle2, ShoppingBag, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function OrderSuccessPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-lg">
        <div className="text-center">
          <CheckCircle2 className="mx-auto h-16 w-16 text-green-500" />
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Order Successful!
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Thank you for your purchase. Your order has been successfully placed.
          </p>
        </div>

        <div className="mt-8 space-y-6">
          <div className="bg-green-50 rounded-lg p-4">
            <div className="flex items-center">
              <ShoppingBag className="h-6 w-6 text-green-600" />
              <span className="ml-3 text-green-700 font-medium">
                Your order is being processed
              </span>
            </div>
            <p className="mt-2 text-sm text-green-600">
              You will receive an email confirmation with your order details shortly.
            </p>
          </div>

          <div className="space-y-4">
            <Link
              href="/products"
              className="w-full flex items-center justify-center px-4 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors"
            >
              Continue Shopping
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>

            <Link
              href="/orders"
              className="w-full flex items-center justify-center px-4 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors"
            >
              View My Orders
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
} 