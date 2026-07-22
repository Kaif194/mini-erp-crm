import { z } from 'zod';
import { ChallanStatus } from '@prisma/client';

export const challanItemSchema = z.object({
  productId: z.string().uuid('Invalid product ID'),
  quantity: z.number().int().positive('Quantity must be at least 1'),
});

export const createChallanSchema = z.object({
  customerId: z.string().uuid('Invalid customer ID'),
  status: z.nativeEnum(ChallanStatus).default(ChallanStatus.DRAFT),
  items: z.array(challanItemSchema).min(1, 'At least one item is required in a challan'),
});

export const updateChallanStatusSchema = z.object({
  status: z.nativeEnum(ChallanStatus),
});

export type CreateChallanInput = z.infer<typeof createChallanSchema>;
export type UpdateChallanStatusInput = z.infer<typeof updateChallanStatusSchema>;
