import api from './api';
import { ApiResponse, PaginatedResponse, Product, StockMovement } from '../types';

export interface ProductQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  lowStockOnly?: boolean | string;
}

export interface AdjustStockPayload {
  quantity: number;
  movementType: 'IN' | 'OUT';
  reason: string;
}

export const productService = {
  getProducts: async (params: ProductQueryParams): Promise<PaginatedResponse<Product>> => {
    const res = await api.get<any, ApiResponse<PaginatedResponse<Product>>>('/products', { params });
    return res.data;
  },

  getProductById: async (id: string): Promise<Product> => {
    const res = await api.get<any, ApiResponse<Product>>(`/products/${id}`);
    return res.data;
  },

  createProduct: async (productData: Partial<Product>): Promise<Product> => {
    const res = await api.post<any, ApiResponse<Product>>('/products', productData);
    return res.data;
  },

  updateProduct: async (id: string, productData: Partial<Product>): Promise<Product> => {
    const res = await api.put<any, ApiResponse<Product>>(`/products/${id}`, productData);
    return res.data;
  },

  deleteProduct: async (id: string): Promise<void> => {
    await api.delete(`/products/${id}`);
  },

  adjustStock: async (productId: string, payload: AdjustStockPayload): Promise<StockMovement> => {
    const res = await api.post<any, ApiResponse<StockMovement>>(`/products/${productId}/stock`, payload);
    return res.data;
  },
};
