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
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import axios from 'axios';
import Image from 'next/image';

interface Variant {
  color: string;
  stock: number;
  price: number;
  sku: string;
  _id?: string;
}

interface Review {
  user: string;
  rating: number;
  comment: string;
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
  reviews: Review[];
  averageRating: number;
  totalReviews: number;
}

interface ProductResponse {
  success: boolean;
  data: Product[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalProducts: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    basePrice: 0,
    discount: 0,
    imageUrl: '',
    variants: [{ color: '', stock: 0, price: 0, sku: '' }],
  });

  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem('accessToken');
      if (!token) {
        throw new Error('No access token found');
      }

      const response = await axios.get<ProductResponse>(`${backendUrl}/products`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setProducts(response.data.data);
    } catch (error) {
      console.error('Error fetching products:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch products');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        throw new Error('No access token found');
      }

      const headers = {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      };

      if (selectedProduct) {
        
        await axios.put(
          `${backendUrl}/products/${selectedProduct._id}`,
          formData,
          { headers }
        );
      } else {

        await axios.post(`${backendUrl}/products`, formData, { headers });
      }

      setIsDialogOpen(false);
      fetchProducts();
      resetForm();
    } catch (error) {
      console.error('Error saving product:', error);
      setError(error instanceof Error ? error.message : 'Failed to save product');
    }
  };

  const handleDelete = async (productId: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;

    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        throw new Error('No access token found');
      }

      await axios.delete(`${backendUrl}/products/${productId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      fetchProducts();
    } catch (error) {
      console.error('Error deleting product:', error);
      setError(error instanceof Error ? error.message : 'Failed to delete product');
    }
  };

  const handleEdit = (product: Product) => {
    setSelectedProduct(product);
    setFormData({
      name: product.name,
      description: product.description,
      category: product.category,
      basePrice: product.basePrice,
      discount: product.discount,
      imageUrl: product.imageUrl,
      variants: product.variants,
    });
    setIsDialogOpen(true);
  };

  const resetForm = () => {
    setSelectedProduct(null);
    setFormData({
      name: '',
      description: '',
      category: '',
      basePrice: 0,
      discount: 0,
      imageUrl: '',
      variants: [{ color: '', stock: 0, price: 0, sku: '' }],
    });
  };

  const addVariant = () => {
    setFormData({
      ...formData,
      variants: [
        ...formData.variants,
        { color: '', stock: 0, price: 0, sku: '' },
      ],
    });
  };

  const removeVariant = (index: number) => {
    setFormData({
      ...formData,
      variants: formData.variants.filter((_, i) => i !== index),
    });
  };

  const updateVariant = (index: number, field: keyof Variant, value: string | number) => {
    const newVariants = [...formData.variants];
    newVariants[index] = {
      ...newVariants[index],
      [field]: value,
    };
    setFormData({ ...formData, variants: newVariants });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg">Loading products...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-64">
        <Card className="p-6">
          <div className="text-red-600 mb-4">Error: {error}</div>
          <Button onClick={fetchProducts} variant="outline">
            Retry
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Products Management</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>Add New Product</Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{selectedProduct ? 'Edit Product' : 'Add New Product'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Name</label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Category</label>
                  <Input
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Description</label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  required
                />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Base Price</label>
                  <Input
                    type="number"
                    value={formData.basePrice}
                    onChange={(e) => setFormData({ ...formData, basePrice: Number(e.target.value) })}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Discount (%)</label>
                  <Input
                    type="number"
                    value={formData.discount}
                    onChange={(e) => setFormData({ ...formData, discount: Number(e.target.value) })}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Image URL</label>
                  <Input
                    value={formData.imageUrl}
                    onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium">Variants</h3>
                  <Button type="button" onClick={addVariant} variant="outline">
                    Add Variant
                  </Button>
                </div>
                {formData.variants.map((variant, index) => (
                  <div key={index} className="p-4 border rounded-lg space-y-4">
                    <div className="flex justify-between items-center">
                      <h4 className="font-medium">Variant {index + 1}</h4>
                      {formData.variants.length > 1 && (
                        <Button
                          type="button"
                          onClick={() => removeVariant(index)}
                          variant="destructive"
                          size="sm"
                        >
                          Remove
                        </Button>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Color</label>
                        <Input
                          value={variant.color}
                          onChange={(e) => updateVariant(index, 'color', e.target.value)}
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">SKU</label>
                        <Input
                          value={variant.sku}
                          onChange={(e) => updateVariant(index, 'sku', e.target.value)}
                          required
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Stock</label>
                        <Input
                          type="number"
                          value={variant.stock}
                          onChange={(e) => updateVariant(index, 'stock', Number(e.target.value))}
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Price</label>
                        <Input
                          type="number"
                          value={variant.price}
                          onChange={(e) => updateVariant(index, 'price', Number(e.target.value))}
                          required
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <Button type="submit">{selectedProduct ? 'Update' : 'Create'}</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Image</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Base Price</TableHead>
              <TableHead>Total Stock</TableHead>
              <TableHead>Rating</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map((product) => (
              <TableRow key={product._id}>
                <TableCell>
                  <div className="relative w-12 h-12">
                    <Image
                      src={product.imageUrl}
                      alt={product.name}
                      fill
                      className="object-cover rounded-lg"
                    />
                  </div>
                </TableCell>
                <TableCell className="font-medium">{product.name}</TableCell>
                <TableCell>{product.category}</TableCell>
                <TableCell>₹{product.basePrice}</TableCell>
                <TableCell>
                  {product.variants.reduce((sum, variant) => sum + variant.stock, 0)}
                </TableCell>
                <TableCell>
                  {product.averageRating.toFixed(1)} ({product.totalReviews})
                </TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                    <Button variant="outline" onClick={() => handleEdit(product)}>
                      Edit
                    </Button>
                    <Button variant="destructive" onClick={() => handleDelete(product._id)}>
                      Delete
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}