import { PrismaClient } from '@prisma/client';
import { logger } from './logger';

declare global {
  var __prisma: PrismaClient | undefined;
}

// Prevent multiple instances of Prisma Client in development
const prisma = globalThis.__prisma || new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
});

if (process.env.NODE_ENV === 'development') {
  globalThis.__prisma = prisma;
}

// Graceful shutdown
process.on('beforeExit', async () => {
  await prisma.$disconnect();
});

export { prisma };

// Database connection test
export const testDatabaseConnection = async (): Promise<boolean> => {
  const url = process.env.DATABASE_URL;
  if (!url || !url.trim()) {
    logger.warn('⚠️ DATABASE_URL not set; skipping database connection');
    return false;
  }
  try {
    await prisma.$connect();
    logger.info('✅ Connected to PostgreSQL');
    return true;
  } catch (error: any) {
    const code = error?.errorCode || error?.code;
    if (code === 'P1012') {
      logger.warn('⚠️ Prisma configuration invalid (P1012); continuing without database');
      return false;
    }
    logger.error('❌ Database connection failed', { error });
    return false;
  }
};

// Initialize database connection (used by app bootstrap)
export const connectDatabase = async (): Promise<void> => {
  try {
    await prisma.$connect();
    if (process.env.NODE_ENV !== 'test') {
      logger.info('📦 Prisma connected');
    }
  } catch (error) {
    logger.error('Failed to initialize database connection', { error });
    throw error;
  }
};

// Database health check
export const getDatabaseHealth = async () => {
  const url = process.env.DATABASE_URL;
  if (!url || !url.trim()) {
    return {
      status: 'unconfigured',
      error: 'DATABASE_URL not set',
      timestamp: new Date().toISOString()
    };
  }
  try {
    const start = Date.now();
    await prisma.$queryRaw`SELECT 1`;
    const end = Date.now();
    return {
      status: 'healthy',
      responseTime: `${end - start}ms`,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    return {
      status: 'unhealthy',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    };
  }
};