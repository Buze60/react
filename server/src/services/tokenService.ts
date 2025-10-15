import jwt from 'jsonwebtoken';

export interface Tokens {
  accessToken: string;
  refreshToken: string;
}

export function issueTokens(userId: string, role: 'admin' | 'finance_expert'): Tokens {
  const accessToken = jwt.sign({ role }, process.env.JWT_ACCESS_SECRET || 'dev-secret', {
    subject: userId,
    expiresIn: process.env.JWT_ACCESS_TTL || '15m',
    algorithm: 'HS256',
  });
  const refreshToken = jwt.sign({ tokenType: 'refresh' }, process.env.JWT_REFRESH_SECRET || 'dev-refresh', {
    subject: userId,
    expiresIn: process.env.JWT_REFRESH_TTL || '7d',
    algorithm: 'HS256',
  });
  return { accessToken, refreshToken };
}

export function verifyRefreshToken(token: string): { sub: string } {
  const payload = jwt.verify(token, process.env.JWT_REFRESH_SECRET || 'dev-refresh') as any;
  return { sub: payload.sub };
}
