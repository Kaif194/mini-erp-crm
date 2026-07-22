import { prisma } from '../config/prisma';
import { ChallanStatus, MovementType, Prisma } from '@prisma/client';
import { ApiError } from '../utils/apiError';

export interface ChallanFilterParams {
  skip: number;
  limit: number;
  customerId?: string;
  status?: ChallanStatus;
  search?: string;
}

export class ChallanRepository {
  async generateChallanNumber(): Promise<string> {
    const today = new Date();
    const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '');
    const prefix = `CHN-${dateStr}-`;

    const lastChallan = await prisma.salesChallan.findFirst({
      where: {
        challanNumber: { startsWith: prefix },
      },
      orderBy: { challanNumber: 'desc' },
    });

    let nextSeq = 1;
    if (lastChallan) {
      const parts = lastChallan.challanNumber.split('-');
      const seq = parseInt(parts[2], 10);
      if (!isNaN(seq)) {
        nextSeq = seq + 1;
      }
    }

    return `${prefix}${nextSeq.toString().padStart(4, '0')}`;
  }

  async createWithItems(
    challanData: {
      customerId: string;
      status: ChallanStatus;
      createdById: string;
      items: { productId: string; quantity: number }[];
    }
  ) {
    const { customerId, status, createdById, items } = challanData;

    return prisma.$transaction(async (tx) => {
      // 1. Fetch products & validate stock if status === CONFIRMED
      const productIds = items.map((i) => i.productId);
      const products = await tx.product.findMany({
        where: { id: { in: productIds } },
      });

      if (products.length !== items.length) {
        throw ApiError.badRequest('One or more selected products were not found');
      }

      const productMap = new Map(products.map((p) => [p.id, p]));
      let totalAmount = 0;
      let totalQuantity = 0;

      const challanItemsData = [];

      for (const item of items) {
        const prod = productMap.get(item.productId);
        if (!prod) {
          throw ApiError.badRequest(`Product ID ${item.productId} not found`);
        }

        if (status === ChallanStatus.CONFIRMED && prod.currentStock < item.quantity) {
          throw ApiError.badRequest(
            `Insufficient stock for product "${prod.name}" (SKU: ${prod.sku}). Available: ${prod.currentStock}, Requested: ${item.quantity}`
          );
        }

        const price = Number(prod.price);
        totalAmount += price * item.quantity;
        totalQuantity += item.quantity;

        challanItemsData.push({
          productId: prod.id,
          productSnapshot: {
            id: prod.id,
            name: prod.name,
            sku: prod.sku,
            category: prod.category,
            warehouse: prod.warehouse,
          },
          priceSnapshot: prod.price,
          quantity: item.quantity,
        });
      }

      // 2. Generate Challan Number
      const challanNumber = await this.generateChallanNumber();

      // 3. Create Sales Challan Record
      const challan = await tx.salesChallan.create({
        data: {
          challanNumber,
          customerId,
          status,
          totalAmount,
          totalQuantity,
          createdById,
          items: {
            create: challanItemsData,
          },
        },
        include: {
          customer: { select: { id: true, customerName: true, businessName: true, email: true } },
          createdBy: { select: { id: true, name: true } },
          items: true,
        },
      });

      // 4. Reduce stock & create stock movements if CONFIRMED
      if (status === ChallanStatus.CONFIRMED) {
        for (const item of items) {
          const prod = productMap.get(item.productId)!;

          await tx.product.update({
            where: { id: prod.id },
            data: { currentStock: { decrement: item.quantity } },
          });

          await tx.stockMovement.create({
            data: {
              productId: prod.id,
              quantity: item.quantity,
              movementType: MovementType.OUT,
              reason: `Sales Challan Confirmation (${challanNumber})`,
              createdById,
            },
          });
        }
      }

      return challan;
    });
  }

  async updateStatus(
    challanId: string,
    newStatus: ChallanStatus,
    createdById: string
  ) {
    return prisma.$transaction(async (tx) => {
      const challan = await tx.salesChallan.findUnique({
        where: { id: challanId },
        include: { items: true },
      });

      if (!challan) {
        throw ApiError.notFound('Sales Challan not found');
      }

      if (challan.status === newStatus) {
        return challan;
      }

      if (challan.status === ChallanStatus.CONFIRMED && newStatus === ChallanStatus.CANCELLED) {
        // Restock inventory
        for (const item of challan.items) {
          await tx.product.update({
            where: { id: item.productId },
            data: { currentStock: { increment: item.quantity } },
          });

          await tx.stockMovement.create({
            data: {
              productId: item.productId,
              quantity: item.quantity,
              movementType: MovementType.IN,
              reason: `Sales Challan Cancellation (${challan.challanNumber})`,
              createdById,
            },
          });
        }
      } else if (challan.status === ChallanStatus.DRAFT && newStatus === ChallanStatus.CONFIRMED) {
        // Reduce stock with check
        for (const item of challan.items) {
          const prod = await tx.product.findUnique({ where: { id: item.productId } });
          if (!prod || prod.currentStock < item.quantity) {
            const name = prod?.name || item.productId;
            const avail = prod?.currentStock ?? 0;
            throw ApiError.badRequest(
              `Insufficient stock to confirm challan for product "${name}". Available: ${avail}, Requested: ${item.quantity}`
            );
          }

          await tx.product.update({
            where: { id: item.productId },
            data: { currentStock: { decrement: item.quantity } },
          });

          await tx.stockMovement.create({
            data: {
              productId: item.productId,
              quantity: item.quantity,
              movementType: MovementType.OUT,
              reason: `Sales Challan Confirmation (${challan.challanNumber})`,
              createdById,
            },
          });
        }
      }

      return tx.salesChallan.update({
        where: { id: challanId },
        data: { status: newStatus },
        include: {
          customer: { select: { id: true, customerName: true, businessName: true, email: true } },
          createdBy: { select: { id: true, name: true } },
          items: true,
        },
      });
    });
  }

  async findMany(params: ChallanFilterParams) {
    const { skip, limit, customerId, status, search } = params;

    const where: Prisma.SalesChallanWhereInput = {
      ...(customerId && { customerId }),
      ...(status && { status }),
      ...(search && {
        OR: [
          { challanNumber: { contains: search, mode: 'insensitive' } },
          { customer: { customerName: { contains: search, mode: 'insensitive' } } },
          { customer: { businessName: { contains: search, mode: 'insensitive' } } },
        ],
      }),
    };

    const [data, total] = await Promise.all([
      prisma.salesChallan.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          customer: { select: { id: true, customerName: true, businessName: true } },
          createdBy: { select: { id: true, name: true } },
          _count: { select: { items: true } },
        },
      }),
      prisma.salesChallan.count({ where }),
    ]);

    return { data, total };
  }

  async findById(id: string) {
    return prisma.salesChallan.findUnique({
      where: { id },
      include: {
        customer: true,
        createdBy: { select: { id: true, name: true, email: true } },
        items: true,
      },
    });
  }

  async count(status?: ChallanStatus) {
    return prisma.salesChallan.count({
      where: status ? { status } : undefined,
    });
  }

  async getTotalRevenue() {
    const aggregate = await prisma.salesChallan.aggregate({
      where: { status: ChallanStatus.CONFIRMED },
      _sum: { totalAmount: true },
    });
    return Number(aggregate._sum.totalAmount || 0);
  }
}
