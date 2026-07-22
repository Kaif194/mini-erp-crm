import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { challanService } from '../services/challanService';
import { ChallanStatus } from '../types';
import { PageHeader } from '../components/common/PageHeader';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Skeleton } from '../components/ui/Skeleton';
import { formatCurrency, formatDate } from '../utils/formatters';
import { ArrowLeft, Download, CheckCircle, XCircle, Building, User, FileSpreadsheet } from 'lucide-react';
import { Toast } from '../components/ui/Toast';

export const ChallanDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const { data: challan, isLoading } = useQuery({
    queryKey: ['challan', id],
    queryFn: () => challanService.getChallanById(id!),
    enabled: !!id,
  });

  const updateStatusMutation = useMutation({
    mutationFn: (status: ChallanStatus) => challanService.updateChallanStatus(id!, status),
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: ['challan', id] });
      setToast({ message: `Challan status updated to ${updated.status}`, type: 'success' });
    },
    onError: (err: any) => {
      setToast({ message: typeof err === 'string' ? err : 'Failed to update status', type: 'error' });
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-1/3" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (!challan) {
    return (
      <div className="text-center py-12">
        <h2 className="text-lg font-bold">Sales Challan not found</h2>
        <Button onClick={() => navigate('/challans')} className="mt-4">
          Back to Challans List
        </Button>
      </div>
    );
  }

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
        title={`Sales Challan #${challan.challanNumber}`}
        description={`Issued on ${formatDate(challan.createdAt)}`}
        action={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              leftIcon={<ArrowLeft className="w-4 h-4" />}
              onClick={() => navigate('/challans')}
            >
              Back
            </Button>

            <Button
              variant="secondary"
              leftIcon={<Download className="w-4 h-4" />}
              onClick={() => challanService.downloadPDF(challan.id)}
            >
              Export PDF Invoice
            </Button>

            {challan.status === 'DRAFT' && (
              <Button
                variant="success"
                leftIcon={<CheckCircle className="w-4 h-4" />}
                isLoading={updateStatusMutation.isPending}
                onClick={() => {
                  if (window.confirm('Confirm this Sales Challan? Stock will be reduced atomically.')) {
                    updateStatusMutation.mutate('CONFIRMED');
                  }
                }}
              >
                Confirm & Dispatch Stock
              </Button>
            )}

            {challan.status === 'CONFIRMED' && (
              <Button
                variant="danger"
                leftIcon={<XCircle className="w-4 h-4" />}
                isLoading={updateStatusMutation.isPending}
                onClick={() => {
                  if (window.confirm('Cancel this confirmed order? Items will be restocked.')) {
                    updateStatusMutation.mutate('CANCELLED');
                  }
                }}
              >
                Cancel & Restock
              </Button>
            )}
          </div>
        }
      />

      {/* Lifecycle Progress Bar */}
      <Card className="flex items-center justify-between p-4 bg-slate-900 text-white">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-blue-600 rounded-xl">
            <FileSpreadsheet className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Order Status</p>
            <p className="text-base font-black text-white">{challan.status}</p>
          </div>
        </div>
        <Badge
          variant={
            challan.status === 'CONFIRMED'
              ? 'success'
              : challan.status === 'DRAFT'
              ? 'warning'
              : 'danger'
          }
          size="md"
        >
          {challan.status}
        </Badge>
      </Card>

      {/* Invoice Document Layout */}
      <Card className="p-8 space-y-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between border-b border-slate-200 dark:border-slate-800 pb-6 gap-4">
          <div>
            <h2 className="text-xl font-black text-blue-600">MINI ERP DISTRIBUTORS</h2>
            <p className="text-xs text-slate-500 mt-1">Official Sales Challan / Delivery Order</p>
          </div>
          <div className="sm:text-right text-xs space-y-1">
            <p className="font-bold text-slate-800 dark:text-slate-200">Challan #: {challan.challanNumber}</p>
            <p className="text-slate-500">Date: {formatDate(challan.createdAt)}</p>
            <p className="text-slate-500">Created By: {challan.createdBy?.name || 'Sales Agent'}</p>
          </div>
        </div>

        {/* Customer Address Box */}
        <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <p className="font-bold text-slate-400 uppercase text-[10px]">BILLED TO CUSTOMER</p>
            <p className="font-extrabold text-slate-800 dark:text-slate-200 text-sm mt-1">
              {challan.customer?.businessName}
            </p>
            <p className="text-slate-600 dark:text-slate-400 mt-0.5">{challan.customer?.customerName}</p>
            <p className="text-slate-500 mt-0.5">{challan.customer?.address}</p>
          </div>
          <div className="sm:text-right">
            <p className="font-bold text-slate-400 uppercase text-[10px]">CONTACT DETAILS</p>
            <p className="text-slate-700 dark:text-slate-300 mt-1">{challan.customer?.email}</p>
            <p className="text-slate-700 dark:text-slate-300">{challan.customer?.mobile}</p>
            <p className="text-slate-500">GST: {challan.customer?.gstNumber || 'N/A'}</p>
          </div>
        </div>

        {/* Items Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 dark:bg-slate-800 text-slate-600 font-bold uppercase">
              <tr>
                <th className="px-4 py-3">Product Description</th>
                <th className="px-4 py-3">SKU</th>
                <th className="px-4 py-3 text-right">Price Snapshot</th>
                <th className="px-4 py-3 text-right">Quantity</th>
                <th className="px-4 py-3 text-right">Line Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {challan.items.map((item) => {
                const snapshot =
                  typeof item.productSnapshot === 'string'
                    ? JSON.parse(item.productSnapshot)
                    : item.productSnapshot;
                const price = Number(item.priceSnapshot);
                const lineTotal = price * item.quantity;

                return (
                  <tr key={item.id} className="hover:bg-slate-50/50">
                    <td className="px-4 py-3 font-bold text-slate-800 dark:text-slate-200">
                      {snapshot?.name || 'Product'}
                    </td>
                    <td className="px-4 py-3 text-slate-500">{snapshot?.sku || '-'}</td>
                    <td className="px-4 py-3 text-right font-semibold">{formatCurrency(price)}</td>
                    <td className="px-4 py-3 text-right font-bold">{item.quantity}</td>
                    <td className="px-4 py-3 text-right font-extrabold">{formatCurrency(lineTotal)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Invoice Total Summary */}
        <div className="flex justify-end pt-4 border-t border-slate-200 dark:border-slate-800">
          <div className="w-full max-w-xs space-y-2 text-xs">
            <div className="flex justify-between text-slate-600 dark:text-slate-400">
              <span>Total Units Dispatched:</span>
              <span className="font-bold">{challan.totalQuantity} units</span>
            </div>
            <div className="flex justify-between text-base font-black text-slate-900 dark:text-slate-100 pt-2 border-t border-slate-200 dark:border-slate-800">
              <span>Total Amount:</span>
              <span className="text-blue-600">{formatCurrency(challan.totalAmount)}</span>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};
