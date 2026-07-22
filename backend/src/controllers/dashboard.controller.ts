import { Request, Response, NextFunction } from 'express';
import { DashboardService } from '../services/dashboard.service';
import { ResponseUtil } from '../utils/apiResponse';

export class DashboardController {
  private dashboardService: DashboardService;

  constructor() {
    this.dashboardService = new DashboardService();
  }

  getMetrics = async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const metrics = await this.dashboardService.getDashboardMetrics();
      return ResponseUtil.success(res, metrics, 'Dashboard metrics retrieved');
    } catch (error) {
      next(error);
    }
  };
}
