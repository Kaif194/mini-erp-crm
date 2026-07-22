import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { dashboardService } from '../services/dashboardService';
import { PageHeader } from '../components/common/PageHeader';
import { StatCard } from '../components/common/StatCard';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Skeleton } from '../components/ui/Skeleton';
import { formatCurrency, formatDate } from '../utils/formatters';
import { Users, AlertTriangle, FileSpreadsheet, DollarSign, Plus, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/Button';

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();

  const { data, isLoading, isError } = useQuery({
    queryKey: ['dashboard-metrics'],
    queryFn: dashboardService.getMetrics,
    refetchInterval: 30000,
  });

  const metrics = data?.metrics;
  const recentActivity = data?.recentActivity || [];

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Welcome back, ${user?.name || 'User'}!`}
        description="Here is your Wholesale & Distribution Operations Overview."
        action={
          (user?.role === 'ADMIN' || user?.role === 'SALES') && (
            <Link to="/challans/create">
              <Button leftIcon={<Plus className="w-4 h-4" />}>Create Sales Challan</Button>
            </Link>
          )
        }
      />

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-28 w-full rounded-xl" />)
        ) : (
          <>
            <StatCard
              title="Total Confirmed Revenue"
              value={formatCurrency(metrics?.totalRevenue || 0)}
              icon={<DollarSign className="w-6 h-6" />}
              color="blue"
              description="Lifetime confirmed sales"
            />
            <StatCard
              title="Active Customers"
              value={metrics?.activeCustomers || 0}
              icon={<Users className="w-6 h-6" />}
              color="emerald"
              description={`Out of ${metrics?.totalCustomers || 0} total accounts`}
            />
            <StatCard
              title="Low Stock Alerts"
              value={metrics?.lowStockCount || 0}
              icon={<AlertTriangle className="w-6 h-6" />}
              color="amber"
              description="Products below alert threshold"
            />
            <StatCard
              title="Sales Challans"
              value={metrics?.totalChallans || 0}
              icon={<FileSpreadsheet className="w-6 h-6" />}
              color="purple"
              description={`${metrics?.draftChallans || 0} Draft, ${metrics?.confirmedChallans || 0} Confirmed`}
            />
          </>
        )}
      </div>

      {/* Main Grid: Recent Challans & Low Stock Widget */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Challans Activity Table */}
        <Card className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">
                Recent Sales Challans
              </h3>
              <p className="text-xs text-slate-400">Latest orders and dispatch logs</p>
            </div>
            <Link
              to="/challans"
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400 flex items-center gap-1"
            >
              View All <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 font-semibold uppercase">
                <tr>
                  <th className="px-3 py-2.5">Challan No</th>
                  <th className="px-3 py-2.5">Customer</th>
                  <th className="px-3 py-2.5">Total Amount</th>
                  <th className="px-3 py-2.5">Status</th>
                  <th className="px-3 py-2.5">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {recentActivity.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-6 text-slate-400">
                      No recent challan activity found
                    </td>
                  </tr>
                ) : (
                  recentActivity.map((ch) => (
                    <tr key={ch.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                      <td className="px-3 py-3 font-bold text-blue-600 dark:text-blue-400">
                        <Link to={`/challans/${ch.id}`}>{ch.challanNumber}</Link>
                      </td>
                      <td className="px-3 py-3 text-slate-700 dark:text-slate-300 font-medium">
                        {ch.customer?.businessName || ch.customer?.customerName || 'N/A'}
                      </td>
                      <td className="px-3 py-3 font-semibold">{formatCurrency(ch.totalAmount)}</td>
                      <td className="px-3 py-3">
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
                      <td className="px-3 py-3 text-slate-400">{formatDate(ch.createdAt)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Quick Navigation / Quick Actions Card */}
        <Card className="space-y-4 flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">
              Operations Shortcuts
            </h3>
            <p className="text-xs text-slate-400 mb-4">Direct access to core system modules</p>

            <div className="space-y-2.5">
              <Link
                to="/customers"
                className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700/80 transition"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 rounded-lg">
                    <Users className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      Manage Customers
                    </p>
                    <p className="text-[10px] text-slate-400">View leads & active CRM list</p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400" />
              </Link>

              <Link
                to="/products"
                className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700/80 transition"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 rounded-lg">
                    <AlertTriangle className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      Inventory Catalog
                    </p>
                    <p className="text-[10px] text-slate-400">Check products & low stock</p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400" />
              </Link>

              <Link
                to="/challans"
                className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700/80 transition"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 rounded-lg">
                    <FileSpreadsheet className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      Sales Orders
                    </p>
                    <p className="text-[10px] text-slate-400">Draft or confirm challans</p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400" />
              </Link>
            </div>
          </div>

          <div className="p-3 bg-blue-50 dark:bg-blue-950/40 rounded-xl border border-blue-100 dark:border-blue-900 mt-4 text-xs text-blue-700 dark:text-blue-300">
            <span className="font-bold">System Status:</span> Production environment connected to PostgreSQL with active RBAC controls.
          </div>
        </Card>
      </div>
    </div>
  );
};
