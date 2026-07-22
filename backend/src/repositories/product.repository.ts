import { prisma } from '../config/prisma';
import { Prisma } from '@prisma/client';

export interface ProductFilterParams {
  skip: number;
  limit: number;
  search?: string;
  category?: string;
  lowStockOnly?: boolean;
}

export class ProductRepository {
  async create(data: Prisma.ProductCreateInput) {
    return prisma.product.create({
      data,
    });
  }

  async findMany(params: ProductFilterParams) {
    const { skip, limit, search, category, lowStockOnly } = params;

    const where: Prisma.ProductWhereInput = {
      ...(category && { category }),
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { sku: { contains: search, mode: 'insensitive' } },
          { category: { contains: search, mode: 'insensitive' } },
          { warehouse: { contains: search, mode: 'insensitive' } },
        ],
      }),
    };

    if (lowStockOnly) {
      where.currentStock = { lte: prisma.product.fields.minimumStock };
    }

    const [data, total] = await Promise.all([
      prisma.product.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.product.count({ where }),
    ]);

    return { data, total };
  }

  async findById(id: string) {
    return prisma.product.findUnique({
      where: { id },
      include: {
        createdBy: { select: { id: true, name: true } },
        movements: {
          orderBy: { timestamp: 'desc' },
          take: 20,
          include: {
            createdBy: { select: { id: true, name: true } },
          },
        },
      },
    });
  }

  async findBySku(sku: string) {
    return prisma.product.findUnique({
      where: { sku },
    });
  }

  async update(id: string, data: Prisma.ProductUpdateInput) {
    return prisma.product.update({
      where: { id },
      data,
    });
  }

  async delete(id: string) {
    return prisma.product.delete({
      where: { id },
    });
  }

  async countLowStock() {
    // Custom query for comparing currentStock <= minimumStock
    const lowStockProducts = await prisma.$queryRaw<{ count: bigint }[]>`
      SELECT COUNT(*)::bigint FROM "products" WHERE "currentStock" <= "minimumStock"
    `;
    return Number(lowStockProducts[0]?.count || 0);
  }
}
