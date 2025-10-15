import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import { Transaction } from '../models/Transaction';

const router = Router();

router.use(requireAuth);

router.get('/summary', async (req, res) => {
  const groupBy = (req.query.groupBy as string) || 'category';
  const from = req.query.from ? new Date(String(req.query.from)) : undefined;
  const to = req.query.to ? new Date(String(req.query.to)) : undefined;

  const match: any = {};
  if (from || to) {
    match.date = {};
    if (from) match.date.$gte = from;
    if (to) match.date.$lte = to;
  }

  const groupId: any = groupBy === 'month'
    ? { $dateToString: { date: '$date', format: '%Y-%m' } }
    : `$${groupBy}`;

  const agg = await Transaction.aggregate([
    { $match: match },
    { $group: { _id: groupId, count: { $sum: 1 }, total: { $sum: '$amount' } } },
    { $project: { _id: 0, key: '$_id', count: 1, total: 1 } },
    { $sort: { key: 1 } },
  ]);

  res.json({ groupBy, from, to, results: agg });
});

export default router;
