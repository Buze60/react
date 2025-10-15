import { Router } from 'express';
import { registerSchema, loginSchema } from '../validators/auth';
import { User } from '../models/User';
import bcrypt from 'bcryptjs';
import { issueTokens, verifyRefreshToken } from '../services/tokenService';
import { requireAuth } from '../middleware/auth';

const router = Router();

router.post('/register', async (req, res) => {
  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(422).json({ error: { code: 'VALIDATION_ERROR', message: 'Invalid input', details: parsed.error.flatten() } });
  }
  const { email, name, password, role } = parsed.data;
  const existing = await User.findOne({ email });
  if (existing) return res.status(409).json({ error: { code: 'EMAIL_TAKEN', message: 'Email already in use' } });
  const passwordHash = await bcrypt.hash(password, 12);
  const user = await User.create({ email, name, passwordHash, role: role || 'finance_expert' });
  const tokens = issueTokens(user.id, user.role);
  return res.status(201).json({ user: { id: user.id, email: user.email, name: user.name, role: user.role }, ...tokens });
});

router.post('/login', async (req, res) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(422).json({ error: { code: 'VALIDATION_ERROR', message: 'Invalid input', details: parsed.error.flatten() } });
  }
  const { email, password } = parsed.data;
  const user = await User.findOne({ email });
  if (!user || !user.isActive) return res.status(401).json({ error: { code: 'AUTH_INVALID_CREDENTIALS', message: 'Invalid credentials' } });
  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) return res.status(401).json({ error: { code: 'AUTH_INVALID_CREDENTIALS', message: 'Invalid credentials' } });
  user.lastLoginAt = new Date();
  await user.save();
  const tokens = issueTokens(user.id, user.role);
  return res.json({ user: { id: user.id, email: user.email, name: user.name, role: user.role }, ...tokens });
});

router.post('/refresh', async (req, res) => {
  const { refreshToken } = req.body || {};
  if (!refreshToken) return res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: 'Missing refresh token' } });
  try {
    const { sub } = verifyRefreshToken(refreshToken);
    const user = await User.findById(sub);
    if (!user || !user.isActive) return res.status(401).json({ error: { code: 'AUTH_INVALID', message: 'Invalid token' } });
    const tokens = issueTokens(user.id, user.role);
    return res.json(tokens);
  } catch (e) {
    return res.status(401).json({ error: { code: 'AUTH_INVALID', message: 'Invalid token' } });
  }
});

router.get('/me', requireAuth, async (req, res) => {
  const user = await User.findById(req.user!.id).lean();
  if (!user) return res.status(404).json({ error: { code: 'RESOURCE_NOT_FOUND', message: 'User not found' } });
  return res.json({ id: user._id, email: user.email, name: user.name, role: user.role });
});

export default router;
