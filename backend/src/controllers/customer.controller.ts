import { Request, Response, NextFunction } from 'express';
import { CustomerService } from '../services/customer.service';
import { ResponseUtil } from '../utils/apiResponse';

export class CustomerController {
  private customerService: CustomerService;

  constructor() {
    this.customerService = new CustomerService();
  }

  create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const customer = await this.customerService.createCustomer(
        req.body,
        req.user!.id
      );
      return ResponseUtil.success(res, customer, 'Customer created successfully', 201);
    } catch (error) {
      next(error);
    }
  };

  getAll = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const paginated = await this.customerService.getCustomers(req.query);
      return ResponseUtil.success(res, paginated, 'Customers retrieved successfully');
    } catch (error) {
      next(error);
    }
  };

  getById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const customer = await this.customerService.getCustomerById(req.params.id);
      return ResponseUtil.success(res, customer, 'Customer details retrieved');
    } catch (error) {
      next(error);
    }
  };

  update = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const customer = await this.customerService.updateCustomer(
        req.params.id,
        req.body
      );
      return ResponseUtil.success(res, customer, 'Customer updated successfully');
    } catch (error) {
      next(error);
    }
  };

  delete = async (req: Request, res: Response, next: NextFunction) => {
    try {
      await this.customerService.deleteCustomer(req.params.id);
      return ResponseUtil.success(res, null, 'Customer deleted successfully');
    } catch (error) {
      next(error);
    }
  };

  addNote = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const note = await this.customerService.addCustomerNote(
        req.params.id,
        req.body.note,
        req.user!.id
      );
      return ResponseUtil.success(res, note, 'Follow-up note added', 201);
    } catch (error) {
      next(error);
    }
  };
}
