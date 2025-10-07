import crypto from 'crypto';
import { prisma } from './database';

export const hashToken = (token: string): string => {
  return crypto.createHash('sha256').update(token).digest('hex');
};

export const generateJti = (): string => {
  return crypto.randomUUID();
};

export const getExpiryDate = (days: number = 7): Date => {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d;
};

export const persistRefreshToken = async (params: {
  userId: string;
  jti: string;
  tokenHash: string;
  userAgent?: string;
  ipAddress?: string;
  expiresAt: Date;
}) => {
  return prisma.refreshToken.create({
    data: {
      userId: params.userId,
      jti: params.jti,
      tokenHash: params.tokenHash,
      userAgent: params.userAgent,
      ipAddress: params.ipAddress,
      expiresAt: params.expiresAt,
    },
  });
};

export const findRefreshTokenByJti = async (jti: string) => {
  return prisma.refreshToken.findUnique({ where: { jti } });
};

export const revokeRefreshToken = async (jti: string) => {
  try {
    await prisma.refreshToken.update({
      where: { jti },
      data: { revokedAt: new Date() },
    });
  } catch {
    // idempotent: ignore if not found
  }
};

export const revokeAllTokensForUser = async (userId: string) => {
  await prisma.refreshToken.updateMany({
    where: { userId, revokedAt: null },
    data: { revokedAt: new Date() },
  });
};

export const replaceRefreshToken = async (oldJti: string, newJti: string) => {
  try {
    await prisma.refreshToken.update({
      where: { jti: oldJti },
      data: {
        revokedAt: new Date(),
        replacedBy: newJti,
      },
    });
  } catch {
    // ignore if not found
  }
};