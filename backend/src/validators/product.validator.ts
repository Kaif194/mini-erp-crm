import { z } from 'zod';

export const createProductSchema = z.object({
  name: z.string().min(2, 'Product name is required'),
  sku: z.string().min(2, 'SKU code is required'),
  category: z.string().min(2, 'Category is required'),
  price: z.number().positive('Price must be greater than zero'),
  currentStock: z.number().int().min(0, 'Current stock cannot be negative').default(0),
  minimumStock: z.number().int().min(0, 'Minimum stock threshold must be >= 0').default(10),
  warehouse: z.string().min(2, 'Warehouse location is required'),
  imageUrl: z.string().url().optional().nullable().or(z.literal('')),
});

export const updateProductSchema = createProductSchema.partial();

export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
