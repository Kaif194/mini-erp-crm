import { Router } from 'express';
import { CustomerController } from '../controllers/customer.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { authorizeRoles } from '../middlewares/role.middleware';
import { validateRequest } from '../middlewares/validate.middleware';
import {
  createCustomerSchema,
  updateCustomerSchema,
  addNoteSchema,
} from '../validators/customer.validator';
import { Role } from '@prisma/client';

const router = Router();
const customerController = new CustomerController();

router.use(authenticate);

router.get(
  '/',
  authorizeRoles(Role.ADMIN, Role.SALES, Role.ACCOUNTS),
  customerController.getAll
);

router.get(
  '/:id',
  authorizeRoles(Role.ADMIN, Role.SALES, Role.ACCOUNTS),
  customerController.getById
);

router.post(
  '/',
  authorizeRoles(Role.ADMIN, Role.SALES),
  validateRequest(createCustomerSchema),
  customerController.create
);

router.put(
  '/:id',
  authorizeRoles(Role.ADMIN, Role.SALES),
  validateRequest(updateCustomerSchema),
  customerController.update
);

router.delete(
  '/:id',
  authorizeRoles(Role.ADMIN),
  customerController.delete
);

router.post(
  '/:id/notes',
  authorizeRoles(Role.ADMIN, Role.SALES),
  validateRequest(addNoteSchema),
  customerController.addNote
);

export default router;
