import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthUser {
  id: string;
  role: 'admin' | 'finance_expert';
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith('Bearer ')) {
    return res.status(401).json({ error: { code: 'AUTH_REQUIRED', message: 'Missing token' } });
  }
  const token = auth.substring('Bearer '.length);
  try {
    const payload = jwt.verify(token, process.env.JWT_ACCESS_SECRET || 'dev-secret') as any;
    req.user = { id: payload.sub, role: payload.role };
    next();
  } catch (e) {
    return res.status(401).json({ error: { code: 'AUTH_INVALID', message: 'Invalid token' } });
  }
}

export function requireRole(roles: Array<'admin' | 'finance_expert'>) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) return res.status(401).json({ error: { code: 'AUTH_REQUIRED', message: 'Not authenticated' } });
    if (!roles.includes(req.user.role)) return res.status(403).json({ error: { code: 'AUTH_FORBIDDEN', message: 'Forbidden' } });
    next();
  };
}
