import { Request, Response, NextFunction } from 'express';
import { ProductService } from '../services/product.service';
import { ResponseUtil } from '../utils/apiResponse';

export class ProductController {
  private productService: ProductService;

  constructor() {
    this.productService = new ProductService();
  }

  create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const product = await this.productService.createProduct(
        req.body,
        req.user!.id
      );
      return ResponseUtil.success(res, product, 'Product created successfully', 201);
    } catch (error) {
      next(error);
    }
  };

  getAll = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const paginated = await this.productService.getProducts(req.query);
      return ResponseUtil.success(res, paginated, 'Products retrieved successfully');
    } catch (error) {
      next(error);
    }
  };

  getById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const product = await this.productService.getProductById(req.params.id);
      return ResponseUtil.success(res, product, 'Product details retrieved');
    } catch (error) {
      next(error);
    }
  };

  update = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const product = await this.productService.updateProduct(
        req.params.id,
        req.body
      );
      return ResponseUtil.success(res, product, 'Product updated successfully');
    } catch (error) {
      next(error);
    }
  };

  delete = async (req: Request, res: Response, next: NextFunction) => {
    try {
      await this.productService.deleteProduct(req.params.id);
      return ResponseUtil.success(res, null, 'Product deleted successfully');
    } catch (error) {
      next(error);
    }
  };

  adjustStock = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const movement = await this.productService.adjustStock(
        req.params.id,
        req.body,
        req.user!.id
      );
      return ResponseUtil.success(res, movement, 'Stock adjusted successfully', 201);
    } catch (error) {
      next(error);
    }
  };
}
