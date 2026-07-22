import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { stockService } from '../services/stockService';
import { StockMovement } from '../types';
import { PageHeader } from '../components/common/PageHeader';
import { Table, Column } from '../components/ui/Table';
import { Pagination } from '../components/ui/Pagination';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Badge } from '../components/ui/Badge';
import { formatDateTime } from '../utils/formatters';
import { Search, ArrowDownRight, ArrowUpRight } from 'lucide-react';

export const InventoryPage: React.FC = () => {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [movementFilter, setMovementFilter] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['stock-movements', page, search, movementFilter],
    queryFn: () =>
      stockService.getStockMovements({
        page,
        limit: 10,
        search,
        movementType: movementFilter as any,
      }),
  });

  const columns: Column<StockMovement>[] = [
    {
      header: 'Product Details',
      cell: (mv) => (
        <div>
          <p className="font-bold text-slate-800 dark:text-slate-200">
            {mv.product?.name || 'Deleted Product'}
          </p>
          <p className="text-[11px] text-slate-400">SKU: {mv.product?.sku || 'N/A'}</p>
        </div>
      ),
    },
    {
      header: 'Movement Type',
      cell: (mv) => (
        <Badge variant={mv.movementType === 'IN' ? 'success' : 'danger'}>
          {mv.movementType === 'IN' ? (
            <span className="flex items-center gap-1">
              <ArrowDownRight className="w-3.5 h-3.5" /> STOCK IN
            </span>
          ) : (
            <span className="flex items-center gap-1">
              <ArrowUpRight className="w-3.5 h-3.5" /> STOCK OUT
            </span>
          )}
        </Badge>
      ),
    },
    {
      header: 'Quantity',
      cell: (mv) => <span className="font-extrabold text-sm">{mv.quantity} units</span>,
    },
    {
      header: 'Reason / Reference',
      cell: (mv) => (
        <span className="text-xs text-slate-700 dark:text-slate-300 font-medium">
          {mv.reason}
        </span>
      ),
    },
    {
      header: 'Created By',
      cell: (mv) => (
        <span className="text-xs text-slate-500">{mv.createdBy?.name || 'System'}</span>
      ),
    },
    {
      header: 'Timestamp',
      cell: (mv) => <span className="text-xs text-slate-400">{formatDateTime(mv.timestamp)}</span>,
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Inventory Movements Log"
        description="Comprehensive audit trail of stock receipts (IN) and sales dispatches (OUT)."
      />

      {/* Filter Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
        <div className="sm:col-span-2">
          <Input
            placeholder="Search by product name, SKU, or movement reason..."
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
            { label: 'All Movement Types', value: '' },
            { label: 'Stock IN Only', value: 'IN' },
            { label: 'Stock OUT Only', value: 'OUT' },
          ]}
          value={movementFilter}
          onChange={(e) => {
            setMovementFilter(e.target.value);
            setPage(1);
          }}
        />
      </div>

      {/* Audit Log Table */}
      <Table
        columns={columns}
        data={data?.data || []}
        keyExtractor={(item) => item.id}
        isLoading={isLoading}
        emptyMessage="No stock movements recorded matching search."
      />

      <Pagination meta={data?.meta} onPageChange={(p) => setPage(p)} />
    </div>
  );
};
