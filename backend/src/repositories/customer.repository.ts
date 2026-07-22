import { prisma } from '../config/prisma';
import { CustomerStatus, CustomerType, Prisma } from '@prisma/client';

export interface CustomerFilterParams {
  skip: number;
  limit: number;
  search?: string;
  status?: CustomerStatus;
  customerType?: CustomerType;
}

export class CustomerRepository {
  async create(data: Prisma.CustomerCreateInput) {
    return prisma.customer.create({
      data,
      include: {
        createdBy: {
          select: { id: true, name: true, email: true },
        },
      },
    });
  }

  async findMany(params: CustomerFilterParams) {
    const { skip, limit, search, status, customerType } = params;

    const where: Prisma.CustomerWhereInput = {
      ...(status && { status }),
      ...(customerType && { customerType }),
      ...(search && {
        OR: [
          { customerName: { contains: search, mode: 'insensitive' } },
          { businessName: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } },
          { mobile: { contains: search, mode: 'insensitive' } },
        ],
      }),
    };

    const [data, total] = await Promise.all([
      prisma.customer.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          createdBy: { select: { id: true, name: true } },
          _count: { select: { noteLogs: true, challans: true } },
        },
      }),
      prisma.customer.count({ where }),
    ]);

    return { data, total };
  }

  async findById(id: string) {
    return prisma.customer.findUnique({
      where: { id },
      include: {
        createdBy: { select: { id: true, name: true, email: true } },
        noteLogs: {
          orderBy: { createdAt: 'desc' },
          include: {
            createdBy: { select: { id: true, name: true } },
          },
        },
        challans: {
          orderBy: { createdAt: 'desc' },
          take: 10,
          select: {
            id: true,
            challanNumber: true,
            status: true,
            totalAmount: true,
            totalQuantity: true,
            createdAt: true,
          },
        },
      },
    });
  }

  async update(id: string, data: Prisma.CustomerUpdateInput) {
    return prisma.customer.update({
      where: { id },
      data,
    });
  }

  async delete(id: string) {
    return prisma.customer.delete({
      where: { id },
    });
  }

  async addNote(customerId: string, note: string, createdById: string) {
    return prisma.customerNote.create({
      data: {
        customerId,
        note,
        createdById,
      },
      include: {
        createdBy: { select: { id: true, name: true } },
      },
    });
  }

  async count(status?: CustomerStatus) {
    return prisma.customer.count({
      where: status ? { status } : undefined,
    });
  }
}
