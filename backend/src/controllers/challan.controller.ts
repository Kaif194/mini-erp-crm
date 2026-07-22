import { Request, Response, NextFunction } from 'express';
import { ChallanService } from '../services/challan.service';
import { ResponseUtil } from '../utils/apiResponse';

export class ChallanController {
  private challanService: ChallanService;

  constructor() {
    this.challanService = new ChallanService();
  }

  create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const challan = await this.challanService.createChallan(
        req.body,
        req.user!.id
      );
      return ResponseUtil.success(res, challan, 'Sales Challan created successfully', 201);
    } catch (error) {
      next(error);
    }
  };

  getAll = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const paginated = await this.challanService.getChallans(req.query);
      return ResponseUtil.success(res, paginated, 'Sales Challans retrieved');
    } catch (error) {
      next(error);
    }
  };

  getById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const challan = await this.challanService.getChallanById(req.params.id);
      return ResponseUtil.success(res, challan, 'Sales Challan details retrieved');
    } catch (error) {
      next(error);
    }
  };

  updateStatus = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const challan = await this.challanService.updateChallanStatus(
        req.params.id,
        req.body.status,
        req.user!.id
      );
      return ResponseUtil.success(res, challan, `Challan status updated to ${req.body.status}`);
    } catch (error) {
      next(error);
    }
  };

  downloadPDF = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const pdfBuffer = await this.challanService.getChallanPDFBuffer(req.params.id);
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="challan-${req.params.id}.pdf"`
      );
      return res.send(pdfBuffer);
    } catch (error) {
      next(error);
    }
  };
}
