import { ChallanRepository } from '../repositories/challan.repository';
import { CustomerRepository } from '../repositories/customer.repository';
import { CreateChallanInput } from '../validators/challan.validator';
import { formatPaginatedResponse, getPagination } from '../utils/pagination';
import { ApiError } from '../utils/apiError';
import { ChallanStatus } from '@prisma/client';
import { generateChallanPDF } from '../utils/pdfGenerator';

export class ChallanService {
  private challanRepository: ChallanRepository;
  private customerRepository: CustomerRepository;

  constructor() {
    this.challanRepository = new ChallanRepository();
    this.customerRepository = new CustomerRepository();
  }

  async createChallan(input: CreateChallanInput, createdById: string) {
    const customer = await this.customerRepository.findById(input.customerId);
    if (!customer) {
      throw ApiError.notFound('Selected customer not found');
    }

    return this.challanRepository.createWithItems({
      customerId: input.customerId,
      status: input.status,
      createdById,
      items: input.items,
    });
  }

  async getChallans(query: any) {
    const { page, limit, skip } = getPagination({ page: query.page, limit: query.limit });
    const { customerId, status, search } = query;

    const { data, total } = await this.challanRepository.findMany({
      skip,
      limit,
      customerId,
      status,
      search,
    });

    return formatPaginatedResponse(data, total, page, limit);
  }

  async getChallanById(id: string) {
    const challan = await this.challanRepository.findById(id);
    if (!challan) {
      throw ApiError.notFound('Sales Challan not found');
    }
    return challan;
  }

  async updateChallanStatus(id: string, status: ChallanStatus, createdById: string) {
    return this.challanRepository.updateStatus(id, status, createdById);
  }

  async getChallanPDFBuffer(id: string): Promise<Buffer> {
    const challan = await this.getChallanById(id);
    return generateChallanPDF(challan);
  }
}
