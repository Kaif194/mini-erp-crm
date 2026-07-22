import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { customerService } from '../services/customerService';
import { productService } from '../services/productService';
import { challanService, CreateChallanPayload } from '../services/challanService';
import { Customer, Product, ChallanStatus } from '../types';
import { PageHeader } from '../components/common/PageHeader';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Select } from '../components/ui/Select';
import { Input } from '../components/ui/Input';
import { Toast } from '../components/ui/Toast';
import { formatCurrency } from '../utils/formatters';
import { ArrowLeft, Plus, Trash2, CheckCircle2, FileText, AlertTriangle } from 'lucide-react';

interface LineItem {
  productId: string;
  quantity: number;
}

export const CreateChallanPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialCustomerId = searchParams.get('customerId') || '';

  const [selectedCustomerId, setSelectedCustomerId] = useState<string>(initialCustomerId);
  const [lineItems, setLineItems] = useState<LineItem[]>([
    { productId: '', quantity: 1 },
  ]);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Fetch Customers List
  const { data: customersData } = useQuery({
    queryKey: ['all-customers'],
    queryFn: () => customerService.getCustomers({ limit: 100 }),
  });

  // Fetch Products Catalog List
  const { data: productsData } = useQuery({
    queryKey: ['all-products'],
    queryFn: () => productService.getProducts({ limit: 100 }),
  });

  const customers = customersData?.data || [];
  const products = productsData?.data || [];
  const productMap = new Map<string, Product>(products.map((p) => [p.id, p]));

  const handleAddRow = () => {
    setLineItems((prev) => [...prev, { productId: '', quantity: 1 }]);
  };

  const handleRemoveRow = (index: number) => {
    if (lineItems.length === 1) return;
    setLineItems((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleItemChange = (index: number, field: keyof LineItem, value: any) => {
    setLineItems((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  // Calculate live total amount and total quantity
  let grandTotal = 0;
  let grandQuantity = 0;
  let hasStockError = false;

  lineItems.forEach((item) => {
    if (item.productId) {
      const prod = productMap.get(item.productId);
      if (prod) {
        const lineVal = Number(prod.price) * item.quantity;
        grandTotal += lineVal;
        grandQuantity += item.quantity;

        if (prod.currentStock < item.quantity) {
          hasStockError = true;
        }
      }
    }
  });

  const createMutation = useMutation({
    mutationFn: (payload: CreateChallanPayload) => challanService.createChallan(payload),
    onSuccess: (data) => {
      setToast({ message: `Challan ${data.challanNumber} created successfully!`, type: 'success' });
      setTimeout(() => navigate(`/challans/${data.id}`), 1000);
    },
    onError: (err: any) => {
      setToast({ message: typeof err === 'string' ? err : 'Failed to create challan', type: 'error' });
    },
  });

  const handleSubmit = (status: ChallanStatus) => {
    if (!selectedCustomerId) {
      setToast({ message: 'Please select a customer account', type: 'error' });
      return;
    }

    const validItems = lineItems.filter((i) => i.productId && i.quantity > 0);
    if (validItems.length === 0) {
      setToast({ message: 'Please add at least one valid product line item', type: 'error' });
      return;
    }

    if (status === 'CONFIRMED' && hasStockError) {
      setToast({
        message: 'Cannot confirm challan: One or more products exceed current warehouse stock!',
        type: 'error',
      });
      return;
    }

    createMutation.mutate({
      customerId: selectedCustomerId,
      status,
      items: validItems,
    });
  };

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
        title="Create Sales Challan"
        description="Select customer, add products, verify live stock, and save as Draft or Confirm."
        action={
          <Button
            variant="outline"
            leftIcon={<ArrowLeft className="w-4 h-4" />}
            onClick={() => navigate('/challans')}
          >
            Cancel
          </Button>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Line Items Form */}
        <Card className="lg:col-span-2 space-y-6">
          {/* Customer Selection */}
          <div className="p-4 bg-slate-50 dark:bg-slate-800/80 rounded-xl border border-slate-200/80 dark:border-slate-700">
            <Select
              label="Select Wholesale Customer"
              options={customers.map((c) => ({
                label: `${c.businessName} (${c.customerName} - ${c.customerType})`,
                value: c.id,
              }))}
              placeholder="-- Search & Choose Customer --"
              value={selectedCustomerId}
              onChange={(e) => setSelectedCustomerId(e.target.value)}
            />
          </div>

          {/* Line Items Table */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                Products Line Items
              </h3>
              <Button size="sm" variant="outline" leftIcon={<Plus className="w-3.5 h-3.5" />} onClick={handleAddRow}>
                Add Item Row
              </Button>
            </div>

            <div className="space-y-3">
              {lineItems.map((item, index) => {
                const selectedProd = item.productId ? productMap.get(item.productId) : null;
                const isOverStock = selectedProd ? selectedProd.currentStock < item.quantity : false;
                const lineTotal = selectedProd ? Number(selectedProd.price) * item.quantity : 0;

                return (
                  <div
                    key={index}
                    className={`p-4 rounded-xl border transition-all ${
                      isOverStock
                        ? 'border-rose-300 bg-rose-50/50 dark:bg-rose-950/20'
                        : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900'
                    }`}
                  >
                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
                      <div className="sm:col-span-6">
                        <Select
                          label={`Item #${index + 1}`}
                          options={products.map((p) => ({
                            label: `${p.name} (SKU: ${p.sku}) - $${Number(p.price).toFixed(2)} [Stock: ${p.currentStock}]`,
                            value: p.id,
                          }))}
                          placeholder="-- Select Product --"
                          value={item.productId}
                          onChange={(e) => handleItemChange(index, 'productId', e.target.value)}
                        />
                      </div>

                      <div className="sm:col-span-3">
                        <Input
                          label="Quantity"
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) =>
                            handleItemChange(index, 'quantity', parseInt(e.target.value, 10) || 1)
                          }
                        />
                      </div>

                      <div className="sm:col-span-2 text-right">
                        <p className="text-[10px] text-slate-400 font-semibold uppercase">Line Total</p>
                        <p className="text-sm font-bold text-slate-800 dark:text-slate-200 mt-1">
                          {formatCurrency(lineTotal)}
                        </p>
                      </div>

                      <div className="sm:col-span-1 flex justify-end">
                        <button
                          type="button"
                          disabled={lineItems.length === 1}
                          onClick={() => handleRemoveRow(index)}
                          className="p-2 text-slate-400 hover:text-red-500 disabled:opacity-30 transition"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {isOverStock && (
                      <div className="flex items-center gap-1.5 mt-2 text-xs font-semibold text-rose-600">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        Insufficient Warehouse Stock! Available: {selectedProd?.currentStock} units
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </Card>

        {/* Order Summary & Dispatch Action Box */}
        <Card className="space-y-6 flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-200 border-b border-slate-100 dark:border-slate-800 pb-3">
              Challan Summary
            </h3>

            <div className="space-y-3 py-4 text-xs">
              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span>Total Items</span>
                <span className="font-bold">{lineItems.filter((i) => i.productId).length} lines</span>
              </div>
              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span>Total Quantity Units</span>
                <span className="font-bold">{grandQuantity} units</span>
              </div>
              <div className="flex justify-between text-base font-black text-slate-900 dark:text-slate-100 pt-3 border-t border-slate-100 dark:border-slate-800">
                <span>Grand Total Amount</span>
                <span className="text-blue-600 dark:text-blue-400">{formatCurrency(grandTotal)}</span>
              </div>
            </div>

            {hasStockError && (
              <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 rounded-xl text-xs text-rose-700 dark:text-rose-300 flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                <span>
                  One or more items exceed current stock. You can save as <b>Draft</b>, but stock dispatch cannot be <b>Confirmed</b> until inventory is replenished.
                </span>
              </div>
            )}
          </div>

          <div className="space-y-2 pt-4 border-t border-slate-100 dark:border-slate-800">
            <Button
              variant="outline"
              className="w-full justify-center"
              leftIcon={<FileText className="w-4 h-4" />}
              isLoading={createMutation.isPending}
              onClick={() => handleSubmit('DRAFT')}
            >
              Save as Draft (No Stock Reduction)
            </Button>

            <Button
              variant="success"
              className="w-full justify-center py-2.5"
              leftIcon={<CheckCircle2 className="w-4 h-4" />}
              isLoading={createMutation.isPending}
              disabled={hasStockError}
              onClick={() => handleSubmit('CONFIRMED')}
            >
              Confirm & Dispatch (Deduct Stock)
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};
