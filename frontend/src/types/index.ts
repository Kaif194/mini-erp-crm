export type Role = 'ADMIN' | 'SALES' | 'WAREHOUSE' | 'ACCOUNTS';
export type CustomerType = 'RETAIL' | 'WHOLESALE' | 'DISTRIBUTOR';
export type CustomerStatus = 'LEAD' | 'ACTIVE' | 'INACTIVE';
export type MovementType = 'IN' | 'OUT';
export type ChallanStatus = 'DRAFT' | 'CONFIRMED' | 'CANCELLED';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  createdAt?: string;
}

export interface CustomerNote {
  id: string;
  note: string;
  createdAt: string;
  createdBy: {
    id: string;
    name: string;
  };
}

export interface Customer {
  id: string;
  customerName: string;
  mobile: string;
  email: string;
  businessName: string;
  gstNumber?: string | null;
  customerType: CustomerType;
  address: string;
  status: CustomerStatus;
  followUpDate?: string | null;
  notes?: string | null;
  createdById: string;
  createdBy?: {
    id: string;
    name: string;
  };
  noteLogs?: CustomerNote[];
  challans?: SalesChallanSummary[];
  _count?: {
    noteLogs: number;
    challans: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface Product {
  id: string;
  name: string;
  sku: string;
  category: string;
  price: number | string;
  currentStock: number;
  minimumStock: number;
  warehouse: string;
  imageUrl?: string | null;
  createdById?: string;
  movements?: StockMovement[];
  createdAt: string;
  updatedAt: string;
}

export interface StockMovement {
  id: string;
  productId: string;
  quantity: number;
  movementType: MovementType;
  reason: string;
  timestamp: string;
  product?: {
    id: string;
    name: string;
    sku: string;
    category?: string;
  };
  createdBy?: {
    id: string;
    name: string;
  };
}

export interface SalesChallanItem {
  id: string;
  challanId: string;
  productId: string;
  productSnapshot: {
    id: string;
    name: string;
    sku: string;
    category: string;
    warehouse?: string;
  };
  priceSnapshot: number | string;
  quantity: number;
}

export interface SalesChallanSummary {
  id: string;
  challanNumber: string;
  status: ChallanStatus;
  totalAmount: number | string;
  totalQuantity: number;
  createdAt: string;
}

export interface SalesChallan {
  id: string;
  challanNumber: string;
  customerId: string;
  status: ChallanStatus;
  totalAmount: number | string;
  totalQuantity: number;
  createdById: string;
  createdAt: string;
  updatedAt: string;
  customer?: Customer;
  createdBy?: {
    id: string;
    name: string;
    email?: string;
  };
  items: SalesChallanItem[];
  _count?: {
    items: number;
  };
}

export interface PaginatedMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginatedMeta;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data: T;
  error?: any;
}
