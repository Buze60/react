import { Request, Response } from 'express';
import multer from 'multer';
import XLSX from 'xlsx';
import { Transaction } from '../models/Transaction';
import { format as csvFormat } from '@fast-csv/format';

export const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

export async function importTransactions(req: Request, res: Response) {
  const file = (req as any).file as Express.Multer.File | undefined;
  const dryRun = String(req.body?.dryRun ?? 'true') === 'true';
  if (!file) return res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: 'Missing file' } });

  let rows: any[] = [];
  if (file.mimetype.includes('csv')) {
    const content = file.buffer.toString('utf8');
    const lines = content.split(/\r?\n/);
    const headers = lines.shift()?.split(',') || [];
    rows = lines.filter(Boolean).map((line) => {
      const values = line.split(',');
      const obj: any = {};
      headers.forEach((h, i) => { obj[h.trim()] = values[i]; });
      return obj;
    });
  } else {
    const wb = XLSX.read(file.buffer, { type: 'buffer' });
    const ws = wb.Sheets[wb.SheetNames[0]];
    rows = XLSX.utils.sheet_to_json(ws);
  }

  const toInsert = rows.map((r) => ({
    date: new Date(r.date || r.Date),
    category: r.category || r.Category,
    description: r.description || r.Description,
    amount: Number(r.amount || r.Amount),
    type: (r.type || r.Type || '').toString().toLowerCase(),
    createdBy: req.user!.id,
  }));

  if (dryRun) {
    const invalid = toInsert.filter((r) => !r.date || !r.category || !r.amount || !['income', 'expense'].includes(r.type as any));
    return res.json({ previewCount: toInsert.length, invalidCount: invalid.length });
  }

  const result = await Transaction.insertMany(toInsert, { ordered: false });
  return res.json({ inserted: result.length });
}

export async function exportTransactions(req: Request, res: Response) {
  const format = (req.query.format as string) || 'csv';
  const filter: any = {};
  const { from, to, type, category, q } = req.query as any;
  if (from || to) {
    filter.date = {};
    if (from) filter.date.$gte = new Date(from);
    if (to) filter.date.$lte = new Date(to);
  }
  if (type) filter.type = { $in: String(type).split(',') };
  if (category) filter.category = { $in: String(category).split(',') };
  if (q) filter.description = { $regex: String(q), $options: 'i' };
  const cursor = Transaction.find(filter).lean().cursor();

  if (format === 'xlsx') {
    const rows: any[] = [];
    for await (const doc of cursor) {
      rows.push(doc);
    }
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Transactions');
    const buf = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename="transactions.xlsx"');
    return res.send(buf);
  }

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename="transactions.csv"');
  const csv = csvFormat({ headers: true });
  csv.pipe(res);
  for await (const doc of cursor) {
    csv.write(doc);
  }
  csv.end();
}
