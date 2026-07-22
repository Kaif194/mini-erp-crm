import { Router } from 'express';
import { StockController } from '../controllers/stock.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();
const stockController = new StockController();

router.use(authenticate);
router.get('/', stockController.getAll);

export default router;
