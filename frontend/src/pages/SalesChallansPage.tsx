import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { challanService } from '../services/challanService';
import { ChallanStatus, SalesChallan } from '../types';
import { PageHeader } from '../components/common/PageHeader';
import { Table, Column } from '../components/ui/Table';
import { Pagination } from '../components/ui/Pagination';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Badge } from '../components/ui/Badge';
import { Toast } from '../components/ui/Toast';
import { formatCurrency, formatDate } from '../utils/formatters';
import { Plus, Search, Eye, Download, CheckCircle, XCircle } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const SalesChallansPage: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { hasRole } = useAuth();

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const canCreate = hasRole('ADMIN', 'SALES');

  const { data, isLoading } = useQuery({
    queryKey: ['challans', page, search, statusFilter],
    queryFn: () =>
      challanService.getChallans({
        page,
        limit: 10,
        search,
        status: statusFilter,
      }),
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: ChallanStatus }) =>
      challanService.updateChallanStatus(id, status),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['challans'] });
      setToast({
        message: `Sales Challan status updated to ${variables.status}`,
        type: 'success',
      });
    },
    onError: (err: any) => {
      setToast({ message: err || 'Failed to update status', type: 'error' });
    },
  });

  const columns: Column<SalesChallan>[] = [
    {
      header: 'Challan Number',
      cell: (ch) => (
        <div>
          <Link
            to={`/challans/${ch.id}`}
            className="font-black text-blue-600 dark:text-blue-400 hover:underline"
          >
            {ch.challanNumber}
          </Link>
          <p className="text-[10px] text-slate-400">Created: {formatDate(ch.createdAt)}</p>
        </div>
      ),
    },
    {
      header: 'Customer Account',
      cell: (ch) => (
        <div>
          <p className="font-bold text-slate-800 dark:text-slate-200">
            {ch.customer?.businessName || ch.customer?.customerName || 'N/A'}
          </p>
          <p className="text-[11px] text-slate-400">{ch.customer?.customerName}</p>
        </div>
      ),
    },
    {
      header: 'Line Items & Qty',
      cell: (ch) => (
        <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
          {ch._count?.items || ch.items?.length || 0} items ({ch.totalQuantity} total units)
        </span>
      ),
    },
    {
      header: 'Total Value',
      cell: (ch) => <span className="font-extrabold text-sm text-slate-800 dark:text-slate-200">{formatCurrency(ch.totalAmount)}</span>,
    },
    {
      header: 'Status',
      cell: (ch) => (
        <Badge
          variant={
            ch.status === 'CONFIRMED'
              ? 'success'
              : ch.status === 'DRAFT'
              ? 'warning'
              : 'danger'
          }
        >
          {ch.status}
        </Badge>
      ),
    },
    {
      header: 'Actions',
      cell: (ch) => (
        <div className="flex items-center gap-1">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => navigate(`/challans/${ch.id}`)}
            title="View Details"
          >
            <Eye className="w-4 h-4 text-blue-600" />
          </Button>

          <Button
            size="sm"
            variant="ghost"
            onClick={() => challanService.downloadPDF(ch.id)}
            title="Download PDF Invoice"
          >
            <Download className="w-4 h-4 text-purple-600" />
          </Button>

          {ch.status === 'DRAFT' && (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                if (window.confirm('Confirm this Sales Challan? Stock will be reduced atomically.')) {
                  updateStatusMutation.mutate({ id: ch.id, status: 'CONFIRMED' });
                }
              }}
              title="Confirm & Dispatch Stock"
            >
              <CheckCircle className="w-4 h-4 text-emerald-600" />
            </Button>
          )}

          {ch.status === 'CONFIRMED' && (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                if (window.confirm('Cancel this confirmed challan? Items will be restocked.')) {
                  updateStatusMutation.mutate({ id: ch.id, status: 'CANCELLED' });
                }
              }}
              title="Cancel Order & Restock"
            >
              <XCircle className="w-4 h-4 text-red-500" />
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
        title="Sales Challans & Invoices"
        description="Generate sales delivery orders, manage drafts, and trigger stock deductions."
        action={
          canCreate && (
            <Link to="/challans/create">
              <Button leftIcon={<Plus className="w-4 h-4" />}>Create Sales Challan</Button>
            </Link>
          )
        }
      />

      {/* Filters Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
        <div className="sm:col-span-2">
          <Input
            placeholder="Search by challan number or customer business name..."
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
            { label: 'All Statuses', value: '' },
            { label: 'Draft', value: 'DRAFT' },
            { label: 'Confirmed', value: 'CONFIRMED' },
            { label: 'Cancelled', value: 'CANCELLED' },
          ]}
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setPage(1);
          }}
        />
      </div>

      {/* Challans Table */}
      <Table
        columns={columns}
        data={data?.data || []}
        keyExtractor={(item) => item.id}
        isLoading={isLoading}
        emptyMessage="No sales challans recorded."
      />

      <Pagination meta={data?.meta} onPageChange={(p) => setPage(p)} />
    </div>
  );
};
