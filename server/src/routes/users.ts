import { Router } from 'express';
import { requireAuth, requireRole } from '../middleware/auth';
import { User } from '../models/User';

const router = Router();

router.use(requireAuth);
router.use(requireRole(['admin']));

router.get('/', async (_req, res) => {
  const users = await User.find().select('email name role isActive createdAt').lean();
  res.json({ data: users });
});

router.post('/', async (req, res) => {
  const { email, name, role } = req.body;
  if (!email || !name) return res.status(422).json({ error: { code: 'VALIDATION_ERROR', message: 'Missing fields' } });
  const exists = await User.findOne({ email });
  if (exists) return res.status(409).json({ error: { code: 'EMAIL_TAKEN', message: 'Email already exists' } });
  const user = await User.create({ email, name, role: role || 'finance_expert', passwordHash: '!' });
  res.status(201).json(user);
});

router.patch('/:id', async (req, res) => {
  const { name, role, isActive } = req.body;
  const updated = await User.findByIdAndUpdate(req.params.id, { $set: { name, role, isActive } }, { new: true });
  if (!updated) return res.status(404).json({ error: { code: 'RESOURCE_NOT_FOUND', message: 'User not found' } });
  res.json(updated);
});

router.delete('/:id', async (req, res) => {
  const del = await User.findByIdAndDelete(req.params.id);
  if (!del) return res.status(404).json({ error: { code: 'RESOURCE_NOT_FOUND', message: 'User not found' } });
  res.status(204).send();
});

export default router;
