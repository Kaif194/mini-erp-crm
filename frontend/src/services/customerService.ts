import api from './api';
import { ApiResponse, Customer, CustomerNote, PaginatedResponse } from '../types';

export interface CustomerQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  customerType?: string;
}

export const customerService = {
  getCustomers: async (params: CustomerQueryParams): Promise<PaginatedResponse<Customer>> => {
    const res = await api.get<any, ApiResponse<PaginatedResponse<Customer>>>('/customers', { params });
    return res.data;
  },

  getCustomerById: async (id: string): Promise<Customer> => {
    const res = await api.get<any, ApiResponse<Customer>>(`/customers/${id}`);
    return res.data;
  },

  createCustomer: async (customerData: Partial<Customer>): Promise<Customer> => {
    const res = await api.post<any, ApiResponse<Customer>>('/customers', customerData);
    return res.data;
  },

  updateCustomer: async (id: string, customerData: Partial<Customer>): Promise<Customer> => {
    const res = await api.put<any, ApiResponse<Customer>>(`/customers/${id}`, customerData);
    return res.data;
  },

  deleteCustomer: async (id: string): Promise<void> => {
    await api.delete(`/customers/${id}`);
  },

  addNote: async (customerId: string, note: string): Promise<CustomerNote> => {
    const res = await api.post<any, ApiResponse<CustomerNote>>(`/customers/${customerId}/notes`, { note });
    return res.data;
  },
};
