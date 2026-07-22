import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { productService } from '../services/productService';
import { PageHeader } from '../components/common/PageHeader';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Skeleton } from '../components/ui/Skeleton';
import { formatCurrency, formatDateTime } from '../utils/formatters';
import { ArrowLeft, Package, ArrowDownRight, ArrowUpRight, Warehouse, DollarSign } from 'lucide-react';

export const ProductDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: product, isLoading } = useQuery({
    queryKey: ['product', id],
    queryFn: () => productService.getProductById(id!),
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-1/3" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="text-center py-12">
        <h2 className="text-lg font-bold">Product not found</h2>
        <Button onClick={() => navigate('/products')} className="mt-4">
          Back to Products
        </Button>
      </div>
    );
  }

  const isLow = product.currentStock <= product.minimumStock;

  return (
    <div className="space-y-6">
      <PageHeader
        title={product.name}
        description={`SKU: ${product.sku} • Category: ${product.category}`}
        action={
          <Button
            variant="outline"
            leftIcon={<ArrowLeft className="w-4 h-4" />}
            onClick={() => navigate('/products')}
          >
            Back to Catalog
          </Button>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Product Details Card */}
        <Card className="space-y-4">
          <div className="w-full h-48 bg-slate-100 dark:bg-slate-800 rounded-xl overflow-hidden flex items-center justify-center border border-slate-200 dark:border-slate-700">
            {product.imageUrl ? (
              <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
            ) : (
              <Package className="w-16 h-16 text-slate-400" />
            )}
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex justify-between items-center py-1 border-b border-slate-100 dark:border-slate-800">
              <span className="text-slate-400">UNIT PRICE</span>
              <span className="font-bold text-base text-slate-800 dark:text-slate-200">
                {formatCurrency(product.price)}
              </span>
            </div>

            <div className="flex justify-between items-center py-1 border-b border-slate-100 dark:border-slate-800">
              <span className="text-slate-400">CURRENT STOCK</span>
              <span className={`font-extrabold text-sm ${isLow ? 'text-rose-600' : 'text-slate-800 dark:text-slate-200'}`}>
                {product.currentStock} units
              </span>
            </div>

            <div className="flex justify-between items-center py-1 border-b border-slate-100 dark:border-slate-800">
              <span className="text-slate-400">ALERT THRESHOLD</span>
              <span className="font-semibold text-slate-700 dark:text-slate-300">
                {product.minimumStock} units
              </span>
            </div>

            <div className="flex justify-between items-center py-1 border-b border-slate-100 dark:border-slate-800">
              <span className="text-slate-400">WAREHOUSE LOCATION</span>
              <span className="font-semibold text-slate-700 dark:text-slate-300">
                {product.warehouse}
              </span>
            </div>
          </div>
        </Card>

        {/* Stock Movement Log for this Product */}
        <Card className="lg:col-span-2 space-y-4">
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-200 border-b border-slate-100 dark:border-slate-800 pb-3">
            Stock Movement Audit History ({product.movements?.length || 0})
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 font-semibold uppercase">
                <tr>
                  <th className="px-3 py-2.5">Type</th>
                  <th className="px-3 py-2.5">Quantity</th>
                  <th className="px-3 py-2.5">Reason</th>
                  <th className="px-3 py-2.5">User</th>
                  <th className="px-3 py-2.5">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {!product.movements || product.movements.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-6 text-slate-400">
                      No stock movements logged for this item yet.
                    </td>
                  </tr>
                ) : (
                  product.movements.map((mv) => (
                    <tr key={mv.id} className="hover:bg-slate-50/50">
                      <td className="px-3 py-3">
                        <Badge variant={mv.movementType === 'IN' ? 'success' : 'danger'} size="sm">
                          {mv.movementType === 'IN' ? (
                            <span className="flex items-center gap-1">
                              <ArrowDownRight className="w-3 h-3" /> IN
                            </span>
                          ) : (
                            <span className="flex items-center gap-1">
                              <ArrowUpRight className="w-3 h-3" /> OUT
                            </span>
                          )}
                        </Badge>
                      </td>
                      <td className="px-3 py-3 font-bold">{mv.quantity} units</td>
                      <td className="px-3 py-3 text-slate-700 dark:text-slate-300">{mv.reason}</td>
                      <td className="px-3 py-3 text-slate-500">{mv.createdBy?.name || 'System'}</td>
                      <td className="px-3 py-3 text-slate-400">{formatDateTime(mv.timestamp)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
};
