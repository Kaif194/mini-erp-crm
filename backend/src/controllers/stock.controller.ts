import { Request, Response, NextFunction } from 'express';
import { StockService } from '../services/stock.service';
import { ResponseUtil } from '../utils/apiResponse';

export class StockController {
  private stockService: StockService;

  constructor() {
    this.stockService = new StockService();
  }

  getAll = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const paginated = await this.stockService.getStockMovements(req.query);
      return ResponseUtil.success(res, paginated, 'Stock movements log retrieved');
    } catch (error) {
      next(error);
    }
  };
}
