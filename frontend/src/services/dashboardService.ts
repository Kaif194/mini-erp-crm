import api from './api';
import { ApiResponse, SalesChallan } from '../types';

export interface DashboardMetrics {
  totalCustomers: number;
  activeCustomers: number;
  lowStockCount: number;
  totalChallans: number;
  draftChallans: number;
  confirmedChallans: number;
  totalRevenue: number;
}

export interface DashboardData {
  metrics: DashboardMetrics;
  recentActivity: SalesChallan[];
}

export const dashboardService = {
  getMetrics: async (): Promise<DashboardData> => {
    const res = await api.get<any, ApiResponse<DashboardData>>('/dashboard/metrics');
    return res.data;
  },
};
