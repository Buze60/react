import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import { createTransaction, deleteTransaction, getTransaction, listTransactions, updateTransaction } from '../controllers/transactions';

const router = Router();

router.use(requireAuth);
router.get('/', listTransactions);
router.get('/:id', getTransaction);
router.post('/', createTransaction);
router.patch('/:id', updateTransaction);
router.delete('/:id', deleteTransaction);

export default router;
