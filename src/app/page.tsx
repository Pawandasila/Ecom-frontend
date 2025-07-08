'use client';

import React, { useState } from "react";
import { Eye, EyeOff, Mail, Lock, ArrowRight, AlertCircle } from "lucide-react";
import Link from "next/link";
import axios from "axios";
import { useRouter } from "next/navigation";
import { setCookie } from 'cookies-next';

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "pawandasila06@gmail.com",
    password: "Pawan2004*",
  });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    
    try {
      const response = await axios.post(`${backendUrl}/users/login`, formData, {
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 10000, 
      });
  
      if (response.status === 200) {
        const { accessToken, refreshToken, user } = response.data;
        
        
        setCookie('accessToken', accessToken, {
          maxAge: 60 * 60 * 24, 
          path: '/',
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict'
        });
        
        setCookie('refreshToken', refreshToken, {
          maxAge: 60 * 60 * 24 * 7, 
          path: '/',
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict'
        });
        
        setCookie('userRole', user.role, {
          maxAge: 60 * 60 * 24, 
          path: '/',
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict'
        });

        
        localStorage.setItem("user", JSON.stringify(user));
        localStorage.setItem("accessToken", accessToken);
        localStorage.setItem("refreshToken", refreshToken);
        
        
        if (user.role === 'admin') {
          router.push("/admin/dashboard");
        } else {
          router.push("/products");
        }
      }
    } catch (error) {
      console.error("Error logging in:", error);
      
      if (axios.isAxiosError(error)) {
        if (error.response) {
          const status = error.response.status;
          const errorData = error.response.data;
          
          switch (status) {
            case 400:
              if (errorData?.message) {
                setError(errorData.message);
              } else if (errorData?.error) {
                setError(errorData.error);
              } else {
                setError("Invalid request. Please check your email and password format.");
              }
              break;
            case 401:
              setError("Invalid email or password. Please try again.");
              break;
            case 404:
              setError("User not found. Please check your email or sign up.");
              break;
            case 422:
              setError("Please provide valid email and password.");
              break;
            case 500:
              setError("Server error. Please try again later.");
              break;
            default:
              setError("An unexpected error occurred. Please try again.");
          }
        } else if (error.request) {
          setError("Network error. Please check your connection and try again.");
        } else {
          setError("An unexpected error occurred. Please try again.");
        }
      } else {
        setError("An unexpected error occurred. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Left Column */}
      <div className="hidden lg:flex w-1/2 bg-gradient-to-br from-blue-600 via-purple-600 to-blue-800 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/30" />
        <div className="relative z-10 flex flex-col justify-center items-center text-white p-12 text-center">
          <h1 className="text-4xl font-bold mb-4">Welcome Back</h1>
          <p className="text-lg opacity-90 mb-6">
            Sign in to access your account and continue your journey with us
          </p>
          <div className="space-y-3">
            {["Secure & encrypted data", "24/7 customer support", "Easy to use interface"].map(
              (item) => (
                <div key={item} className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-white rounded-full" />
                  <span>{item}</span>
                </div>
              )
            )}
          </div>
        </div>
        <div className="absolute top-20 right-20 w-32 h-32 bg-white/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 left-20 w-24 h-24 bg-white/10 rounded-full blur-2xl animate-pulse" />
      </div>

      {/* Right Column */}
      <div className="flex flex-1 flex-col justify-center items-center p-8">
        <div className="w-full max-w-md space-y-6">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900">Sign In</h2>
            <p className="text-gray-600 mt-1">Welcome back! Please enter your details.</p>
          </div>

          {/* Error Display */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start space-x-3">
              <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm text-red-800 font-medium">Error</p>
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <input
                  type="email"
                  required
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                  disabled={isLoading}
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            {/* Remember me & Forgot */}
            <div className="flex items-center justify-between">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  className="accent-blue-600 rounded border-gray-300"
                  disabled={isLoading}
                />
                <span className="text-sm text-gray-600">Remember me</span>
              </label>
              <Link href="#" className="text-sm text-blue-600 hover:underline">
                Forgot password?
              </Link>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center group disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Signing In...
                </>
              ) : (
                <>
                  Sign In
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center justify-center space-x-2">
            <div className="w-full border-t border-gray-300" />
            <span className="text-sm text-gray-500">or continue with</span>
            <div className="w-full border-t border-gray-300" />
          </div>

          {/* Social Login */}
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              aria-label="Continue with Google"
              className="flex items-center justify-center py-2 border border-gray-300 rounded-lg bg-white hover:bg-gray-50 transition-colors"
              disabled={isLoading}
            >
              <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
                <path d="M21.35 11.1h-9.16v2.92h5.57c-.24 1.26-.97 2.32-2.08 3.04l3.19 2.49c1.87-1.73 2.95-4.27 2.95-7.17 0-.67-.07-1.33-.19-1.96z" />
                <path d="M12.19 22c2.48 0 4.57-.82 6.1-2.23l-3.19-2.49c-.89.6-2.02.95-3.23.95-2.48 0-4.58-1.67-5.33-3.93H3.11v2.46C4.65 19.94 8.12 22 12.19 22z" />
                <path d="M6.86 13.3c-.2-.6-.31-1.23-.31-1.9s.11-1.3.31-1.9V7.04H3.11C2.4 8.45 2 10.17 2 12c0 1.83.4 3.55 1.11 4.96l3.75-2.92z" />
                <path d="M12.19 5.99c1.35 0 2.56.47 3.52 1.39l2.63-2.63C16.76 2.8 14.67 2 12.19 2 8.12 2 4.65 4.06 3.11 7.04l3.75 2.92c.75-2.26 2.85-3.93 5.33-3.93z" />
              </svg>
              <span className="text-sm font-medium text-gray-700">Google</span>
            </button>
            <button
              type="button"
              aria-label="Continue with Facebook"
              className="flex items-center justify-center py-2 border border-gray-300 rounded-lg bg-white hover:bg-gray-50 transition-colors"
              disabled={isLoading}
            >
              <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                <path d="M22.676 0H1.326C.593 0 0 .593 0 1.326v21.348C0 23.407.593 24 1.326 24h11.494v-9.294H9.691V11.09h3.129V8.414c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.464.099 2.795.143v3.24h-1.918c-1.504 0-1.797.715-1.797 1.764v2.31h3.59l-.467 3.616h-3.123V24h6.116c.733 0 1.326-.593 1.326-1.326V1.326C24 .593 23.407 0 22.676 0" />
              </svg>
              <span className="text-sm font-medium text-gray-700">Facebook</span>
            </button>
          </div>

          {/* Sign up */}
          <div className="text-center text-sm text-gray-600 mt-6">
            Don&apos;t have an account?{" "}
            <Link href="/signup" className="text-blue-600 hover:underline font-medium">
              Sign up
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}