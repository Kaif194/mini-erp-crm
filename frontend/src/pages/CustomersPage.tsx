import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { customerService } from '../services/customerService';
import { Customer, CustomerStatus, CustomerType } from '../types';
import { PageHeader } from '../components/common/PageHeader';
import { Table, Column } from '../components/ui/Table';
import { Pagination } from '../components/ui/Pagination';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Modal } from '../components/ui/Modal';
import { Badge } from '../components/ui/Badge';
import { Toast } from '../components/ui/Toast';
import { formatDate } from '../utils/formatters';
import { Plus, Search, Eye, Edit, Trash2, Phone, Mail, Building } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const customerFormSchema = z.object({
  customerName: z.string().min(2, 'Customer name is required'),
  mobile: z.string().min(7, 'Valid mobile number is required'),
  email: z.string().email('Valid email is required'),
  businessName: z.string().min(2, 'Business name is required'),
  gstNumber: z.string().optional(),
  customerType: z.enum(['RETAIL', 'WHOLESALE', 'DISTRIBUTOR']),
  address: z.string().min(5, 'Address is required'),
  status: z.enum(['LEAD', 'ACTIVE', 'INACTIVE']),
  followUpDate: z.string().optional(),
  notes: z.string().optional(),
});

type CustomerFormData = z.infer<typeof customerFormSchema>;

export const CustomersPage: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { hasRole } = useAuth();

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const canEdit = hasRole('ADMIN', 'SALES');
  const canDelete = hasRole('ADMIN');

  const { data, isLoading } = useQuery({
    queryKey: ['customers', page, search, statusFilter, typeFilter],
    queryFn: () =>
      customerService.getCustomers({
        page,
        limit: 10,
        search,
        status: statusFilter,
        customerType: typeFilter,
      }),
  });

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<CustomerFormData>({
    resolver: zodResolver(customerFormSchema),
    defaultValues: {
      customerType: 'RETAIL',
      status: 'LEAD',
    },
  });

  const createMutation = useMutation({
    mutationFn: customerService.createCustomer,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      setIsAddModalOpen(false);
      reset();
      setToast({ message: 'Customer account created successfully', type: 'success' });
    },
    onError: (err: any) => {
      setToast({ message: err || 'Failed to create customer', type: 'error' });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Customer> }) =>
      customerService.updateCustomer(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      setEditingCustomer(null);
      reset();
      setToast({ message: 'Customer details updated', type: 'success' });
    },
    onError: (err: any) => {
      setToast({ message: err || 'Failed to update customer', type: 'error' });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: customerService.deleteCustomer,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      setToast({ message: 'Customer deleted', type: 'success' });
    },
    onError: (err: any) => {
      setToast({ message: err || 'Failed to delete customer', type: 'error' });
    },
  });

  const handleOpenAdd = () => {
    reset({
      customerName: '',
      mobile: '',
      email: '',
      businessName: '',
      gstNumber: '',
      customerType: 'RETAIL',
      address: '',
      status: 'LEAD',
      followUpDate: '',
      notes: '',
    });
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (cust: Customer) => {
    setEditingCustomer(cust);
    setValue('customerName', cust.customerName);
    setValue('mobile', cust.mobile);
    setValue('email', cust.email);
    setValue('businessName', cust.businessName);
    setValue('gstNumber', cust.gstNumber || '');
    setValue('customerType', cust.customerType);
    setValue('address', cust.address);
    setValue('status', cust.status);
    setValue(
      'followUpDate',
      cust.followUpDate ? new Date(cust.followUpDate).toISOString().slice(0, 10) : ''
    );
    setValue('notes', cust.notes || '');
  };

  const onSubmit = (formData: CustomerFormData) => {
    if (editingCustomer) {
      updateMutation.mutate({ id: editingCustomer.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const columns: Column<Customer>[] = [
    {
      header: 'Customer & Business',
      cell: (cust) => (
        <div>
          <p className="font-bold text-slate-800 dark:text-slate-200">{cust.customerName}</p>
          <div className="flex items-center gap-1 text-[11px] text-slate-400 mt-0.5">
            <Building className="w-3 h-3" />
            <span>{cust.businessName}</span>
          </div>
        </div>
      ),
    },
    {
      header: 'Contact Info',
      cell: (cust) => (
        <div className="text-xs space-y-0.5">
          <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
            <Mail className="w-3.5 h-3.5 text-slate-400" />
            <span>{cust.email}</span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-500">
            <Phone className="w-3.5 h-3.5 text-slate-400" />
            <span>{cust.mobile}</span>
          </div>
        </div>
      ),
    },
    {
      header: 'Type',
      cell: (cust) => (
        <Badge variant={cust.customerType === 'DISTRIBUTOR' ? 'purple' : cust.customerType === 'WHOLESALE' ? 'info' : 'default'}>
          {cust.customerType}
        </Badge>
      ),
    },
    {
      header: 'Status',
      cell: (cust) => (
        <Badge variant={cust.status === 'ACTIVE' ? 'success' : cust.status === 'LEAD' ? 'warning' : 'danger'}>
          {cust.status}
        </Badge>
      ),
    },
    {
      header: 'Next Follow-up',
      cell: (cust) => (
        <span className="text-xs text-slate-600 dark:text-slate-400">
          {formatDate(cust.followUpDate)}
        </span>
      ),
    },
    {
      header: 'Actions',
      cell: (cust) => (
        <div className="flex items-center gap-1">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => navigate(`/customers/${cust.id}`)}
            title="View Details & Notes"
          >
            <Eye className="w-4 h-4 text-blue-600" />
          </Button>
          {canEdit && (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => handleOpenEdit(cust)}
              title="Edit Account"
            >
              <Edit className="w-4 h-4 text-amber-600" />
            </Button>
          )}
          {canDelete && (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                if (window.confirm(`Delete customer ${cust.customerName}?`)) {
                  deleteMutation.mutate(cust.id);
                }
              }}
              title="Delete Account"
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
        title="Customers CRM"
        description="Manage wholesale, retail, and distributor accounts and follow-up notes."
        action={
          canEdit && (
            <Button leftIcon={<Plus className="w-4 h-4" />} onClick={handleOpenAdd}>
              Add Customer
            </Button>
          )
        }
      />

      {/* Filter Controls Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
        <div className="sm:col-span-2">
          <Input
            placeholder="Search by customer name, business, email, phone..."
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
            { label: 'Lead', value: 'LEAD' },
            { label: 'Active', value: 'ACTIVE' },
            { label: 'Inactive', value: 'INACTIVE' },
          ]}
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setPage(1);
          }}
        />
        <Select
          options={[
            { label: 'All Types', value: '' },
            { label: 'Retail', value: 'RETAIL' },
            { label: 'Wholesale', value: 'WHOLESALE' },
            { label: 'Distributor', value: 'DISTRIBUTOR' },
          ]}
          value={typeFilter}
          onChange={(e) => {
            setTypeFilter(e.target.value);
            setPage(1);
          }}
        />
      </div>

      {/* Customer List Table */}
      <Table
        columns={columns}
        data={data?.data || []}
        keyExtractor={(item) => item.id}
        isLoading={isLoading}
        emptyMessage="No customers match the current search filters."
      />

      <Pagination meta={data?.meta} onPageChange={(p) => setPage(p)} />

      {/* Add / Edit Customer Modal */}
      <Modal
        isOpen={isAddModalOpen || !!editingCustomer}
        onClose={() => {
          setIsAddModalOpen(false);
          setEditingCustomer(null);
        }}
        title={editingCustomer ? 'Edit Customer Account' : 'Register New Customer'}
        maxWidth="lg"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Customer Name"
              placeholder="e.g. John Doe"
              error={errors.customerName?.message}
              {...register('customerName')}
            />
            <Input
              label="Business Name"
              placeholder="e.g. Apex Wholesalers"
              error={errors.businessName?.message}
              {...register('businessName')}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Email Address"
              type="email"
              placeholder="john@apex.com"
              error={errors.email?.message}
              {...register('email')}
            />
            <Input
              label="Mobile Number"
              placeholder="+1 (555) 019-2834"
              error={errors.mobile?.message}
              {...register('mobile')}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Select
              label="Customer Type"
              options={[
                { label: 'Retail', value: 'RETAIL' },
                { label: 'Wholesale', value: 'WHOLESALE' },
                { label: 'Distributor', value: 'DISTRIBUTOR' },
              ]}
              error={errors.customerType?.message}
              {...register('customerType')}
            />
            <Select
              label="Status"
              options={[
                { label: 'Lead', value: 'LEAD' },
                { label: 'Active', value: 'ACTIVE' },
                { label: 'Inactive', value: 'INACTIVE' },
              ]}
              error={errors.status?.message}
              {...register('status')}
            />
            <Input
              label="GST Number (Optional)"
              placeholder="27AAAAA1234A1Z5"
              error={errors.gstNumber?.message}
              {...register('gstNumber')}
            />
          </div>

          <Input
            label="Full Address"
            placeholder="123 Industrial Logistics Park, City"
            error={errors.address?.message}
            {...register('address')}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Next Follow-up Date"
              type="date"
              error={errors.followUpDate?.message}
              {...register('followUpDate')}
            />
            <Input
              label="Initial Notes / CRM Info"
              placeholder="Key account details..."
              error={errors.notes?.message}
              {...register('notes')}
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100 dark:border-slate-800">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setIsAddModalOpen(false);
                setEditingCustomer(null);
              }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              isLoading={createMutation.isPending || updateMutation.isPending}
            >
              {editingCustomer ? 'Save Changes' : 'Create Account'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
