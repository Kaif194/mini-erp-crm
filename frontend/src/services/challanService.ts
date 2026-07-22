import api from './api';
import { ApiResponse, ChallanStatus, PaginatedResponse, SalesChallan } from '../types';

export interface ChallanQueryParams {
  page?: number;
  limit?: number;
  customerId?: string;
  status?: string;
  search?: string;
}

export interface CreateChallanItemPayload {
  productId: string;
  quantity: number;
}

export interface CreateChallanPayload {
  customerId: string;
  status: ChallanStatus;
  items: CreateChallanItemPayload[];
}

export const challanService = {
  getChallans: async (params: ChallanQueryParams): Promise<PaginatedResponse<SalesChallan>> => {
    const res = await api.get<any, ApiResponse<PaginatedResponse<SalesChallan>>>('/challans', { params });
    return res.data;
  },

  getChallanById: async (id: string): Promise<SalesChallan> => {
    const res = await api.get<any, ApiResponse<SalesChallan>>(`/challans/${id}`);
    return res.data;
  },

  createChallan: async (payload: CreateChallanPayload): Promise<SalesChallan> => {
    const res = await api.post<any, ApiResponse<SalesChallan>>('/challans', payload);
    return res.data;
  },

  updateChallanStatus: async (id: string, status: ChallanStatus): Promise<SalesChallan> => {
    const res = await api.patch<any, ApiResponse<SalesChallan>>(`/challans/${id}/status`, { status });
    return res.data;
  },

  downloadPDF: async (id: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await api.get(`/challans/${id}/pdf`, {
        responseType: 'blob',
      });
      
      const blob = new Blob([response as any], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `sales-challan-${id.slice(0, 8)}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      // Fallback query param URL
      const token = localStorage.getItem('token');
      window.open(`/api/v1/challans/${id}/pdf?token=${token}`, '_blank');
    }
  },
};
