import { z } from 'zod';
import { MovementType } from '@prisma/client';

export const stockMovementSchema = z.object({
  quantity: z.number().int().positive('Quantity must be a positive integer'),
  movementType: z.nativeEnum(MovementType),
  reason: z.string().min(2, 'Reason is required'),
});

export type StockMovementInput = z.infer<typeof stockMovementSchema>;
