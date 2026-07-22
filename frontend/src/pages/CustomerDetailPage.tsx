import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { customerService } from '../services/customerService';
import { PageHeader } from '../components/common/PageHeader';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Skeleton } from '../components/ui/Skeleton';
import { formatDate, formatDateTime, formatCurrency } from '../utils/formatters';
import {
  ArrowLeft,
  Building,
  Mail,
  Phone,
  MapPin,
  Calendar,
  MessageSquare,
  FileSpreadsheet,
  Plus,
} from 'lucide-react';
import { Toast } from '../components/ui/Toast';
import { useAuth } from '../context/AuthContext';

export const CustomerDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { hasRole } = useAuth();

  const [newNote, setNewNote] = useState('');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const { data: customer, isLoading } = useQuery({
    queryKey: ['customer', id],
    queryFn: () => customerService.getCustomerById(id!),
    enabled: !!id,
  });

  const addNoteMutation = useMutation({
    mutationFn: (noteText: string) => customerService.addNote(id!, noteText),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customer', id] });
      setNewNote('');
      setToast({ message: 'Follow-up note added', type: 'success' });
    },
    onError: (err: any) => {
      setToast({ message: err || 'Failed to add note', type: 'error' });
    },
  });

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.trim()) return;
    addNoteMutation.mutate(newNote.trim());
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-1/3" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-64 lg:col-span-2 w-full" />
        </div>
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="text-center py-12">
        <h2 className="text-lg font-bold text-slate-800 dark:text-slate-200">Customer not found</h2>
        <Button onClick={() => navigate('/customers')} className="mt-4">
          Back to Customers
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
        title={customer.customerName}
        description={`Account #${customer.id.slice(0, 8)} • ${customer.businessName}`}
        action={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              leftIcon={<ArrowLeft className="w-4 h-4" />}
              onClick={() => navigate('/customers')}
            >
              Back
            </Button>
            {hasRole('ADMIN', 'SALES') && (
              <Link to={`/challans/create?customerId=${customer.id}`}>
                <Button leftIcon={<Plus className="w-4 h-4" />}>New Sales Challan</Button>
              </Link>
            )}
          </div>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Account Info Profile Sidebar */}
        <Card className="space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">
              Account Overview
            </h3>
            <Badge variant={customer.status === 'ACTIVE' ? 'success' : 'warning'}>
              {customer.status}
            </Badge>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex items-center gap-2.5 text-slate-700 dark:text-slate-300">
              <Building className="w-4 h-4 text-blue-500 shrink-0" />
              <div>
                <p className="text-[10px] text-slate-400 font-semibold">BUSINESS NAME</p>
                <p className="font-bold">{customer.businessName}</p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 text-slate-700 dark:text-slate-300">
              <Mail className="w-4 h-4 text-blue-500 shrink-0" />
              <div>
                <p className="text-[10px] text-slate-400 font-semibold">EMAIL</p>
                <p className="font-bold">{customer.email}</p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 text-slate-700 dark:text-slate-300">
              <Phone className="w-4 h-4 text-blue-500 shrink-0" />
              <div>
                <p className="text-[10px] text-slate-400 font-semibold">MOBILE</p>
                <p className="font-bold">{customer.mobile}</p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 text-slate-700 dark:text-slate-300">
              <MapPin className="w-4 h-4 text-blue-500 shrink-0" />
              <div>
                <p className="text-[10px] text-slate-400 font-semibold">ADDRESS</p>
                <p className="font-medium">{customer.address}</p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 text-slate-700 dark:text-slate-300">
              <Calendar className="w-4 h-4 text-blue-500 shrink-0" />
              <div>
                <p className="text-[10px] text-slate-400 font-semibold">NEXT FOLLOW-UP</p>
                <p className="font-bold text-amber-600">{formatDate(customer.followUpDate)}</p>
              </div>
            </div>
          </div>
        </Card>

        {/* CRM Timeline Notes & Challans History */}
        <div className="lg:col-span-2 space-y-6">
          {/* Notes History */}
          <Card className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-blue-600" />
                <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">
                  CRM Follow-Up Notes ({customer.noteLogs?.length || 0})
                </h3>
              </div>
            </div>

            {hasRole('ADMIN', 'SALES') && (
              <form onSubmit={handleAddNote} className="flex gap-2">
                <Input
                  placeholder="Type follow-up note or meeting summary..."
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                />
                <Button type="submit" isLoading={addNoteMutation.isPending}>
                  Add Note
                </Button>
              </form>
            )}

            <div className="space-y-3 pt-2">
              {!customer.noteLogs || customer.noteLogs.length === 0 ? (
                <p className="text-xs text-slate-400 py-4 text-center">No notes recorded yet.</p>
              ) : (
                customer.noteLogs.map((note) => (
                  <div
                    key={note.id}
                    className="p-3.5 bg-slate-50 dark:bg-slate-800/80 rounded-xl border border-slate-200/60 dark:border-slate-700/60 space-y-1"
                  >
                    <div className="flex items-center justify-between text-[11px] text-slate-400">
                      <span className="font-bold text-slate-700 dark:text-slate-300">
                        {note.createdBy?.name || 'Sales Agent'}
                      </span>
                      <span>{formatDateTime(note.createdAt)}</span>
                    </div>
                    <p className="text-xs text-slate-800 dark:text-slate-200">{note.note}</p>
                  </div>
                ))
              )}
            </div>
          </Card>

          {/* Sales Challans History */}
          <Card className="space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
              <FileSpreadsheet className="w-5 h-5 text-purple-600" />
              <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">
                Sales Orders History
              </h3>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 font-semibold uppercase">
                  <tr>
                    <th className="px-3 py-2">Challan No</th>
                    <th className="px-3 py-2">Total Amount</th>
                    <th className="px-3 py-2">Qty</th>
                    <th className="px-3 py-2">Status</th>
                    <th className="px-3 py-2">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {!customer.challans || customer.challans.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="text-center py-6 text-slate-400">
                        No sales orders for this customer.
                      </td>
                    </tr>
                  ) : (
                    customer.challans.map((ch) => (
                      <tr key={ch.id} className="hover:bg-slate-50/50">
                        <td className="px-3 py-2.5 font-bold text-blue-600">
                          <Link to={`/challans/${ch.id}`}>{ch.challanNumber}</Link>
                        </td>
                        <td className="px-3 py-2.5 font-semibold">
                          {formatCurrency(ch.totalAmount)}
                        </td>
                        <td className="px-3 py-2.5">{ch.totalQuantity} items</td>
                        <td className="px-3 py-2.5">
                          <Badge
                            variant={
                              ch.status === 'CONFIRMED'
                                ? 'success'
                                : ch.status === 'DRAFT'
                                ? 'warning'
                                : 'danger'
                            }
                            size="sm"
                          >
                            {ch.status}
                          </Badge>
                        </td>
                        <td className="px-3 py-2.5 text-slate-400">{formatDate(ch.createdAt)}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
