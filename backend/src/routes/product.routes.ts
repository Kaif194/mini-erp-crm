import { Router } from 'express';
import { ProductController } from '../controllers/product.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { authorizeRoles } from '../middlewares/role.middleware';
import { validateRequest } from '../middlewares/validate.middleware';
import {
  createProductSchema,
  updateProductSchema,
} from '../validators/product.validator';
import { stockMovementSchema } from '../validators/stock.validator';
import { Role } from '@prisma/client';

const router = Router();
const productController = new ProductController();

router.use(authenticate);

router.get('/', productController.getAll);
router.get('/:id', productController.getById);

router.post(
  '/',
  authorizeRoles(Role.ADMIN, Role.WAREHOUSE),
  validateRequest(createProductSchema),
  productController.create
);

router.put(
  '/:id',
  authorizeRoles(Role.ADMIN, Role.WAREHOUSE),
  validateRequest(updateProductSchema),
  productController.update
);

router.delete(
  '/:id',
  authorizeRoles(Role.ADMIN),
  productController.delete
);

router.post(
  '/:id/stock',
  authorizeRoles(Role.ADMIN, Role.WAREHOUSE),
  validateRequest(stockMovementSchema),
  productController.adjustStock
);

export default router;
