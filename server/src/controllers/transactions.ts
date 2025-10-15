import { Request, Response } from 'express';
import { Transaction } from '../models/Transaction';
import dayjs from 'dayjs';

export async function listTransactions(req: Request, res: Response) {
  const page = Math.max(parseInt(String(req.query.page || '1')), 1);
  const limit = Math.min(Math.max(parseInt(String(req.query.limit || '50')), 1), 500);
  const sortBy = (req.query.sortBy as string) || 'date';
  const sortDir = (req.query.sortDir as string) === 'asc' ? 1 : -1;

  const filter: any = {};
  const { from, to, type, category, q } = req.query as any;
  if (from || to) {
    filter.date = {};
    if (from) filter.date.$gte = dayjs(from).toDate();
    if (to) filter.date.$lte = dayjs(to).toDate();
  }
  if (type) {
    const arr = Array.isArray(type) ? type : String(type).split(',');
    filter.type = { $in: arr };
  }
  if (category) {
    const arr = Array.isArray(category) ? category : String(category).split(',');
    filter.category = { $in: arr };
  }
  if (q) {
    filter.description = { $regex: String(q), $options: 'i' };
  }

  const cursor = Transaction.find(filter)
    .sort({ [sortBy]: sortDir })
    .skip((page - 1) * limit)
    .limit(limit)
    .lean();

  const [items, total] = await Promise.all([
    cursor,
    Transaction.countDocuments(filter),
  ]);

  res.json({ data: items, page, limit, total });
}

export async function getTransaction(req: Request, res: Response) {
  const item = await Transaction.findById(req.params.id).lean();
  if (!item) return res.status(404).json({ error: { code: 'RESOURCE_NOT_FOUND', message: 'Not found' } });
  res.json(item);
}

export async function createTransaction(req: Request, res: Response) {
  const body = req.body;
  const item = await Transaction.create({ ...body, createdBy: req.user!.id });
  res.status(201).json(item);
}

export async function updateTransaction(req: Request, res: Response) {
  const body = req.body;
  const item = await Transaction.findByIdAndUpdate(
    req.params.id,
    { $set: { ...body, updatedBy: req.user!.id } },
    { new: true }
  );
  if (!item) return res.status(404).json({ error: { code: 'RESOURCE_NOT_FOUND', message: 'Not found' } });
  res.json(item);
}

export async function deleteTransaction(req: Request, res: Response) {
  const item = await Transaction.findByIdAndDelete(req.params.id);
  if (!item) return res.status(404).json({ error: { code: 'RESOURCE_NOT_FOUND', message: 'Not found' } });
  res.status(204).send();
}
