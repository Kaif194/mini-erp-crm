import { StockRepository } from '../repositories/stock.repository';
import { formatPaginatedResponse, getPagination } from '../utils/pagination';

export class StockService {
  private stockRepository: StockRepository;

  constructor() {
    this.stockRepository = new StockRepository();
  }

  async getStockMovements(query: any) {
    const { page, limit, skip } = getPagination({ page: query.page, limit: query.limit });
    const { productId, movementType, search } = query;

    const { data, total } = await this.stockRepository.findMany({
      skip,
      limit,
      productId,
      movementType,
      search,
    });

    return formatPaginatedResponse(data, total, page, limit);
  }
}
