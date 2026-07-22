import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { productService, AdjustStockPayload } from '../services/productService';
import { Product } from '../types';
import { PageHeader } from '../components/common/PageHeader';
import { Table, Column } from '../components/ui/Table';
import { Pagination } from '../components/ui/Pagination';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Modal } from '../components/ui/Modal';
import { Badge } from '../components/ui/Badge';
import { Toast } from '../components/ui/Toast';
import { formatCurrency } from '../utils/formatters';
import { Plus, Search, Edit, Trash2, ArrowDownUp, AlertTriangle, Eye } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const productFormSchema = z.object({
  name: z.string().min(2, 'Product name is required'),
  sku: z.string().min(2, 'SKU code is required'),
  category: z.string().min(2, 'Category is required'),
  price: z.coerce.number().positive('Price must be greater than zero'),
  currentStock: z.coerce.number().int().min(0, 'Stock cannot be negative'),
  minimumStock: z.coerce.number().int().min(0, 'Minimum stock threshold must be >= 0'),
  warehouse: z.string().min(2, 'Warehouse location is required'),
  imageUrl: z.string().optional(),
});

type ProductFormData = z.infer<typeof productFormSchema>;

export const ProductsPage: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { hasRole } = useAuth();

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [lowStockFilter, setLowStockFilter] = useState(false);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [stockProduct, setStockProduct] = useState<Product | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Stock Adjustment State
  const [adjQty, setAdjQty] = useState<number>(1);
  const [adjType, setAdjType] = useState<'IN' | 'OUT'>('IN');
  const [adjReason, setAdjReason] = useState<string>('Restock Inventory');

  const canEdit = hasRole('ADMIN', 'WAREHOUSE');
  const canDelete = hasRole('ADMIN');

  const { data, isLoading } = useQuery({
    queryKey: ['products', page, search, categoryFilter, lowStockFilter],
    queryFn: () =>
      productService.getProducts({
        page,
        limit: 10,
        search,
        category: categoryFilter,
        lowStockOnly: lowStockFilter,
      }),
  });

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<ProductFormData>({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      currentStock: 0,
      minimumStock: 10,
    },
  });

  const createMutation = useMutation({
    mutationFn: productService.createProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      setIsAddModalOpen(false);
      reset();
      setToast({ message: 'Product created successfully', type: 'success' });
    },
    onError: (err: any) => {
      setToast({ message: err || 'Failed to create product', type: 'error' });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Product> }) =>
      productService.updateProduct(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      setEditingProduct(null);
      reset();
      setToast({ message: 'Product updated successfully', type: 'success' });
    },
    onError: (err: any) => {
      setToast({ message: err || 'Failed to update product', type: 'error' });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: productService.deleteProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      setToast({ message: 'Product deleted', type: 'success' });
    },
    onError: (err: any) => {
      setToast({ message: err || 'Failed to delete product', type: 'error' });
    },
  });

  const stockMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: AdjustStockPayload }) =>
      productService.adjustStock(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      setStockProduct(null);
      setToast({ message: 'Stock level updated', type: 'success' });
    },
    onError: (err: any) => {
      setToast({ message: err || 'Stock adjustment failed', type: 'error' });
    },
  });

  const handleOpenAdd = () => {
    reset({
      name: '',
      sku: `SKU-PROD-${Math.floor(100 + Math.random() * 900)}`,
      category: 'Electronics & Sensors',
      price: 99.99,
      currentStock: 50,
      minimumStock: 10,
      warehouse: 'Central Warehouse A',
      imageUrl: '',
    });
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (prod: Product) => {
    setEditingProduct(prod);
    setValue('name', prod.name);
    setValue('sku', prod.sku);
    setValue('category', prod.category);
    setValue('price', Number(prod.price));
    setValue('currentStock', prod.currentStock);
    setValue('minimumStock', prod.minimumStock);
    setValue('warehouse', prod.warehouse);
    setValue('imageUrl', prod.imageUrl || '');
  };

  const onSubmit = (formData: ProductFormData) => {
    if (editingProduct) {
      updateMutation.mutate({ id: editingProduct.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleAdjustStockSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!stockProduct) return;
    stockMutation.mutate({
      id: stockProduct.id,
      payload: {
        quantity: Number(adjQty),
        movementType: adjType,
        reason: adjReason,
      },
    });
  };

  const columns: Column<Product>[] = [
    {
      header: 'Product Details',
      cell: (prod) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center overflow-hidden shrink-0">
            {prod.imageUrl ? (
              <img src={prod.imageUrl} alt={prod.name} className="w-full h-full object-cover" />
            ) : (
              <span className="text-xs font-bold text-slate-400">{prod.name.charAt(0)}</span>
            )}
          </div>
          <div>
            <p className="font-bold text-slate-800 dark:text-slate-200">{prod.name}</p>
            <p className="text-[11px] text-slate-400">SKU: {prod.sku}</p>
          </div>
        </div>
      ),
    },
    {
      header: 'Category & Location',
      cell: (prod) => (
        <div className="text-xs">
          <p className="font-semibold text-slate-700 dark:text-slate-300">{prod.category}</p>
          <p className="text-[10px] text-slate-400">{prod.warehouse}</p>
        </div>
      ),
    },
    {
      header: 'Unit Price',
      cell: (prod) => <span className="font-bold text-slate-800 dark:text-slate-200">{formatCurrency(prod.price)}</span>,
    },
    {
      header: 'Stock Status',
      cell: (prod) => {
        const isLow = prod.currentStock <= prod.minimumStock;
        return (
          <div className="flex items-center gap-2">
            <span className={`font-extrabold text-sm ${isLow ? 'text-rose-600' : 'text-slate-800 dark:text-slate-200'}`}>
              {prod.currentStock}
            </span>
            <Badge variant={isLow ? 'danger' : 'success'} size="sm">
              {isLow ? 'Low Stock' : 'In Stock'}
            </Badge>
          </div>
        );
      },
    },
    {
      header: 'Actions',
      cell: (prod) => (
        <div className="flex items-center gap-1">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => navigate(`/products/${prod.id}`)}
            title="View Details & Movement Log"
          >
            <Eye className="w-4 h-4 text-blue-600" />
          </Button>
          {canEdit && (
            <>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  setStockProduct(prod);
                  setAdjQty(10);
                  setAdjType('IN');
                  setAdjReason('Restock Inventory');
                }}
                title="Adjust Stock (+ / -)"
              >
                <ArrowDownUp className="w-4 h-4 text-emerald-600" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => handleOpenEdit(prod)}
                title="Edit Product"
              >
                <Edit className="w-4 h-4 text-amber-600" />
              </Button>
            </>
          )}
          {canDelete && (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                if (window.confirm(`Delete product ${prod.name}?`)) {
                  deleteMutation.mutate(prod.id);
                }
              }}
              title="Delete Product"
            >
              <Trash2 className="w-4 h-4 text-red-500" />
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      <PageHeader
        title="Products Catalog & Inventory"
        description="Manage product definitions, warehouse stock levels, and alert thresholds."
        action={
          canEdit && (
            <Button leftIcon={<Plus className="w-4 h-4" />} onClick={handleOpenAdd}>
              Add Product
            </Button>
          )
        }
      />

      {/* Filters Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-sm items-center">
        <div className="sm:col-span-2">
          <Input
            placeholder="Search by product name, SKU, category, or warehouse..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            leftIcon={<Search className="w-4 h-4" />}
          />
        </div>
        <Select
          options={[
            { label: 'All Categories', value: '' },
            { label: 'Industrial Machinery', value: 'Industrial Machinery' },
            { label: 'Electronics & Sensors', value: 'Electronics & Sensors' },
            { label: 'Raw Materials', value: 'Raw Materials' },
            { label: 'Packaging & Container', value: 'Packaging & Container' },
            { label: 'Hardware & Tools', value: 'Hardware & Tools' },
          ]}
          value={categoryFilter}
          onChange={(e) => {
            setCategoryFilter(e.target.value);
            setPage(1);
          }}
        />
        <button
          onClick={() => {
            setLowStockFilter((prev) => !prev);
            setPage(1);
          }}
          className={`flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-semibold border transition ${
            lowStockFilter
              ? 'bg-rose-50 border-rose-300 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300'
              : 'border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300'
          }`}
        >
          <AlertTriangle className="w-4 h-4" />
          {lowStockFilter ? 'Showing Low Stock Only' : 'Filter Low Stock'}
        </button>
      </div>

      {/* Product Table */}
      <Table
        columns={columns}
        data={data?.data || []}
        keyExtractor={(item) => item.id}
        isLoading={isLoading}
        emptyMessage="No products match the search filters."
      />

      <Pagination meta={data?.meta} onPageChange={(p) => setPage(p)} />

      {/* Add / Edit Product Modal */}
      <Modal
        isOpen={isAddModalOpen || !!editingProduct}
        onClose={() => {
          setIsAddModalOpen(false);
          setEditingProduct(null);
        }}
        title={editingProduct ? 'Edit Product' : 'Add New Product to Catalog'}
        maxWidth="lg"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Product Name"
              placeholder="Industrial Part X"
              error={errors.name?.message}
              {...register('name')}
            />
            <Input
              label="SKU Code"
              placeholder="SKU-IND-101"
              error={errors.sku?.message}
              {...register('sku')}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Category"
              placeholder="Electronics & Sensors"
              error={errors.category?.message}
              {...register('category')}
            />
            <Input
              label="Unit Price ($)"
              type="number"
              step="0.01"
              placeholder="99.99"
              error={errors.price?.message}
              {...register('price')}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input
              label="Current Stock"
              type="number"
              error={errors.currentStock?.message}
              {...register('currentStock')}
            />
            <Input
              label="Minimum Alert Stock"
              type="number"
              error={errors.minimumStock?.message}
              {...register('minimumStock')}
            />
            <Input
              label="Warehouse Location"
              placeholder="Central Warehouse A"
              error={errors.warehouse?.message}
              {...register('warehouse')}
            />
          </div>

          <Input
            label="Image URL (AWS S3 / Public URL)"
            placeholder="https://images.unsplash.com/photo-..."
            error={errors.imageUrl?.message}
            {...register('imageUrl')}
          />

          <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100 dark:border-slate-800">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setIsAddModalOpen(false);
                setEditingProduct(null);
              }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              isLoading={createMutation.isPending || updateMutation.isPending}
            >
              {editingProduct ? 'Save Product' : 'Create Product'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Adjust Stock Movement Modal */}
      <Modal
        isOpen={!!stockProduct}
        onClose={() => setStockProduct(null)}
        title={`Adjust Stock Level - ${stockProduct?.name}`}
        maxWidth="md"
      >
        <form onSubmit={handleAdjustStockSubmit} className="space-y-4">
          <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs space-y-1">
            <p>
              Current Available Stock:{' '}
              <span className="font-bold text-blue-600">{stockProduct?.currentStock}</span>
            </p>
            <p>SKU Code: {stockProduct?.sku}</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Movement Type"
              options={[
                { label: 'IN (Restock / Add)', value: 'IN' },
                { label: 'OUT (Dispatch / Remove)', value: 'OUT' },
              ]}
              value={adjType}
              onChange={(e) => setAdjType(e.target.value as 'IN' | 'OUT')}
            />
            <Input
              label="Quantity"
              type="number"
              min="1"
              value={adjQty}
              onChange={(e) => setAdjQty(parseInt(e.target.value, 10) || 1)}
            />
          </div>

          <Input
            label="Reason for Movement"
            placeholder="e.g. Vendor Shipment Receipt"
            value={adjReason}
            onChange={(e) => setAdjReason(e.target.value)}
          />

          <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100 dark:border-slate-800">
            <Button type="button" variant="outline" onClick={() => setStockProduct(null)}>
              Cancel
            </Button>
            <Button type="submit" isLoading={stockMutation.isPending}>
              Update Stock
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
