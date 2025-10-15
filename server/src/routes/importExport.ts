import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import { exportTransactions, importTransactions, upload } from '../controllers/importExport';

const router = Router();

router.use(requireAuth);
router.post('/transactions/import', upload.single('file'), importTransactions);
router.get('/transactions/export', exportTransactions);

export default router;
