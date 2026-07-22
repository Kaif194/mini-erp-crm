import { prisma } from '../config/prisma';
import { MovementType, Prisma } from '@prisma/client';

export interface StockFilterParams {
  skip: number;
  limit: number;
  productId?: string;
  movementType?: MovementType;
  search?: string;
}

export class StockRepository {
  async create(data: Prisma.StockMovementCreateInput) {
    return prisma.stockMovement.create({
      data,
      include: {
        product: { select: { id: true, name: true, sku: true } },
        createdBy: { select: { id: true, name: true } },
      },
    });
  }

  async findMany(params: StockFilterParams) {
    const { skip, limit, productId, movementType, search } = params;

    const where: Prisma.StockMovementWhereInput = {
      ...(productId && { productId }),
      ...(movementType && { movementType }),
      ...(search && {
        OR: [
          { reason: { contains: search, mode: 'insensitive' } },
          { product: { name: { contains: search, mode: 'insensitive' } } },
          { product: { sku: { contains: search, mode: 'insensitive' } } },
        ],
      }),
    };

    const [data, total] = await Promise.all([
      prisma.stockMovement.findMany({
        where,
        skip,
        take: limit,
        orderBy: { timestamp: 'desc' },
        include: {
          product: { select: { id: true, name: true, sku: true, category: true } },
          createdBy: { select: { id: true, name: true } },
        },
      }),
      prisma.stockMovement.count({ where }),
    ]);

    return { data, total };
  }
}
