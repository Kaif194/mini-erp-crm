import { CustomerRepository } from '../repositories/customer.repository';
import { ProductRepository } from '../repositories/product.repository';
import { ChallanRepository } from '../repositories/challan.repository';
import { ChallanStatus, CustomerStatus } from '@prisma/client';

export class DashboardService {
  private customerRepository: CustomerRepository;
  private productRepository: ProductRepository;
  private challanRepository: ChallanRepository;

  constructor() {
    this.customerRepository = new CustomerRepository();
    this.productRepository = new ProductRepository();
    this.challanRepository = new ChallanRepository();
  }

  async getDashboardMetrics() {
    const [
      totalCustomers,
      activeCustomers,
      lowStockCount,
      totalChallans,
      draftChallans,
      confirmedChallans,
      totalRevenue,
      recentChallans,
    ] = await Promise.all([
      this.customerRepository.count(),
      this.customerRepository.count(CustomerStatus.ACTIVE),
      this.productRepository.countLowStock(),
      this.challanRepository.count(),
      this.challanRepository.count(ChallanStatus.DRAFT),
      this.challanRepository.count(ChallanStatus.CONFIRMED),
      this.challanRepository.getTotalRevenue(),
      this.challanRepository.findMany({ skip: 0, limit: 5 }),
    ]);

    return {
      metrics: {
        totalCustomers,
        activeCustomers,
        lowStockCount,
        totalChallans,
        draftChallans,
        confirmedChallans,
        totalRevenue,
      },
      recentActivity: recentChallans.data,
    };
  }
}
