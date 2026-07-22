import { CustomerRepository, CustomerFilterParams } from '../repositories/customer.repository';
import { CreateCustomerInput, UpdateCustomerInput } from '../validators/customer.validator';
import { formatPaginatedResponse, getPagination } from '../utils/pagination';
import { ApiError } from '../utils/apiError';

export class CustomerService {
  private customerRepository: CustomerRepository;

  constructor() {
    this.customerRepository = new CustomerRepository();
  }

  async createCustomer(input: CreateCustomerInput, createdById: string) {
    return this.customerRepository.create({
      customerName: input.customerName,
      mobile: input.mobile,
      email: input.email,
      businessName: input.businessName,
      gstNumber: input.gstNumber,
      customerType: input.customerType,
      address: input.address,
      status: input.status,
      followUpDate: input.followUpDate ? new Date(input.followUpDate) : null,
      notes: input.notes,
      createdBy: { connect: { id: createdById } },
    });
  }

  async getCustomers(query: any) {
    const { page, limit, skip } = getPagination({ page: query.page, limit: query.limit });
    const { search, status, customerType } = query;

    const { data, total } = await this.customerRepository.findMany({
      skip,
      limit,
      search,
      status,
      customerType,
    });

    return formatPaginatedResponse(data, total, page, limit);
  }

  async getCustomerById(id: string) {
    const customer = await this.customerRepository.findById(id);
    if (!customer) {
      throw ApiError.notFound('Customer not found');
    }
    return customer;
  }

  async updateCustomer(id: string, input: UpdateCustomerInput) {
    await this.getCustomerById(id);

    const updateData: any = { ...input };
    if (input.followUpDate !== undefined) {
      updateData.followUpDate = input.followUpDate ? new Date(input.followUpDate) : null;
    }

    return this.customerRepository.update(id, updateData);
  }

  async deleteCustomer(id: string) {
    await this.getCustomerById(id);
    return this.customerRepository.delete(id);
  }

  async addCustomerNote(customerId: string, note: string, createdById: string) {
    await this.getCustomerById(customerId);
    return this.customerRepository.addNote(customerId, note, createdById);
  }
}
