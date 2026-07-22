import { Router } from 'express';
import { ChallanController } from '../controllers/challan.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { authorizeRoles } from '../middlewares/role.middleware';
import { validateRequest } from '../middlewares/validate.middleware';
import {
  createChallanSchema,
  updateChallanStatusSchema,
} from '../validators/challan.validator';
import { Role } from '@prisma/client';

const router = Router();
const challanController = new ChallanController();

router.use(authenticate);

router.get('/', challanController.getAll);
router.get('/:id', challanController.getById);
router.get('/:id/pdf', challanController.downloadPDF);

router.post(
  '/',
  authorizeRoles(Role.ADMIN, Role.SALES),
  validateRequest(createChallanSchema),
  challanController.create
);

router.patch(
  '/:id/status',
  authorizeRoles(Role.ADMIN, Role.SALES, Role.WAREHOUSE, Role.ACCOUNTS),
  validateRequest(updateChallanStatusSchema),
  challanController.updateStatus
);

export default router;
