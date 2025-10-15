import jwt from 'jsonwebtoken';

export interface Tokens {
  accessToken: string;
  refreshToken: string;
}

export function issueTokens(userId: string, role: 'admin' | 'finance_expert'): Tokens {
  const jwtAny = jwt as any;
  const accessToken = jwtAny.sign(
    { role },
    process.env.JWT_ACCESS_SECRET || 'dev-secret',
    { subject: userId, expiresIn: process.env.JWT_ACCESS_TTL || '15m', algorithm: 'HS256' }
  );
  const refreshToken = jwtAny.sign(
    { tokenType: 'refresh' },
    process.env.JWT_REFRESH_SECRET || 'dev-refresh',
    { subject: userId, expiresIn: process.env.JWT_REFRESH_TTL || '7d', algorithm: 'HS256' }
  );
  return { accessToken, refreshToken };
}

export function verifyRefreshToken(token: string): { sub: string } {
  const jwtAny = jwt as any;
  const payload = jwtAny.verify(token, process.env.JWT_REFRESH_SECRET || 'dev-refresh');
  return { sub: payload.sub };
}
