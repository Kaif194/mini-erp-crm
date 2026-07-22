import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { validateRequest } from '../middlewares/validate.middleware';
import { loginSchema } from '../validators/auth.validator';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();
const authController = new AuthController();

router.post('/login', validateRequest(loginSchema), authController.login);
router.get('/me', authenticate, authController.getProfile);

export default router;
