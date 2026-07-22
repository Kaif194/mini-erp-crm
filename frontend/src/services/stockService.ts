import api from './api';
import { ApiResponse, PaginatedResponse, StockMovement } from '../types';

export interface StockQueryParams {
  page?: number;
  limit?: number;
  productId?: string;
  movementType?: 'IN' | 'OUT';
  search?: string;
}

export const stockService = {
  getStockMovements: async (params: StockQueryParams): Promise<PaginatedResponse<StockMovement>> => {
    const res = await api.get<any, ApiResponse<PaginatedResponse<StockMovement>>>('/stock-movements', { params });
    return res.data;
  },
};
