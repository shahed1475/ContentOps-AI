import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { prisma } from '../utils/database';
import { generateTokenPair, verifyRefreshToken } from '../utils/jwt';
import { 
  hashToken,
  persistRefreshToken,
  getExpiryDate,
  findRefreshTokenByJti,
  replaceRefreshToken,
  revokeRefreshToken,
  revokeAllTokensForUser,
  generateJti
} from '../utils/refreshToken';
import { sendSuccess, sendError, sendUnauthorized, sendConflict, sendBadRequest } from '../utils/response';
import { LoginRequest, RegisterRequest, AuthRequest } from '../types';
import { asyncHandler } from '../middleware/errorHandler';

/**
 * Register a new user
 */
export const register = asyncHandler(async (req: Request, res: Response) => {
  const { name, email, password }: RegisterRequest = req.body;

  // Check if user already exists
  const existingUser = await prisma.account.findUnique({
    where: { email }
  });

  if (existingUser) {
    return sendConflict(res, 'User with this email already exists');
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 12);

  // Create user
  const user = await prisma.account.create({
    data: {
      name,
      email,
      password: hashedPassword
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      subscription: true,
      credits: true,
      createdAt: true
    }
  });

  // Generate tokens with jti and persist refresh token
  const jti = generateJti();
  const tokens = generateTokenPair({ id: user.id, email: user.email, role: user.role }, jti);
  const tokenHash = hashToken(tokens.refreshToken);
  await persistRefreshToken({
    userId: user.id,
    jti,
    tokenHash,
    userAgent: req.headers['user-agent'],
    ipAddress: req.ip,
    expiresAt: getExpiryDate(7)
  });

  return sendSuccess(res, {
    user,
    ...tokens
  }, 'User registered successfully', 201);
});

/**
 * Login user
 */
export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password }: LoginRequest = req.body;

  // Find user
  const user = await prisma.account.findUnique({
    where: { email }
  });

  if (!user) {
    return sendUnauthorized(res, 'Invalid email or password');
  }

  // Verify password
  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    return sendUnauthorized(res, 'Invalid email or password');
  }

  // Generate tokens with jti and persist refresh token
  const jti = generateJti();
  const tokens = generateTokenPair({ id: user.id, email: user.email, role: user.role }, jti);
  const tokenHash = hashToken(tokens.refreshToken);
  await persistRefreshToken({
    userId: user.id,
    jti,
    tokenHash,
    userAgent: req.headers['user-agent'],
    ipAddress: req.ip,
    expiresAt: getExpiryDate(7)
  });

  // Return user data without password
  const { password: _, ...userWithoutPassword } = user;

  return sendSuccess(res, {
    user: userWithoutPassword,
    ...tokens
  }, 'Login successful');
});

/**
 * Refresh access token
 */
export const refreshToken = asyncHandler(async (req: Request, res: Response) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return sendBadRequest(res, 'Refresh token is required');
  }

  try {
    // Verify refresh token signature and type
    const decoded = verifyRefreshToken(refreshToken);
    const jti = decoded.jti;
    if (!jti) {
      return sendUnauthorized(res, 'Invalid token');
    }
    // Find stored token
    const stored = await findRefreshTokenByJti(jti);
    const now = new Date();
    const hash = hashToken(refreshToken);
    if (!stored || stored.tokenHash !== hash) {
      // Reuse attempt or invalid token; revoke all for user if jti found but hash mismatch
      if (stored && stored.userId) {
        await revokeAllTokensForUser(stored.userId);
      }
      return sendUnauthorized(res, 'Invalid or reused refresh token');
    }
    if (stored.revokedAt || stored.expiresAt <= now) {
      return sendUnauthorized(res, 'Refresh token expired or revoked');
    }
    // Check user exists
    const user = await prisma.account.findUnique({
      where: { id: decoded.id },
      select: { id: true, email: true, role: true }
    });
    if (!user) return sendUnauthorized(res, 'User not found');
    // Issue new pair and rotate
    const newJti = generateJti();
    const tokens = generateTokenPair({ id: user.id, email: user.email, role: user.role }, newJti);
    const newHash = hashToken(tokens.refreshToken);
    await persistRefreshToken({
      userId: user.id,
      jti: newJti,
      tokenHash: newHash,
      userAgent: req.headers['user-agent'],
      ipAddress: req.ip,
      expiresAt: getExpiryDate(7)
    });
    await replaceRefreshToken(jti, newJti);
    return sendSuccess(res, tokens, 'Token refreshed successfully');
  } catch (error) {
    return sendUnauthorized(res, 'Invalid refresh token');
  }
});

/**
 * Get current user profile
 */
export const getProfile = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user?.id;

  const user = await prisma.account.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      subscription: true,
      credits: true,
      createdAt: true,
      updatedAt: true
    }
  });

  if (!user) {
    return sendError(res, 'User not found', 404);
  }

  return sendSuccess(res, user, 'Profile retrieved successfully');
});

/**
 * Update user profile
 */
export const updateProfile = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user?.id;
  const { name } = req.body;

  const updatedUser = await prisma.account.update({
    where: { id: userId },
    data: { name },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      subscription: true,
      credits: true,
      updatedAt: true
    }
  });

  return sendSuccess(res, updatedUser, 'Profile updated successfully');
});

/**
 * Change password
 */
export const changePassword = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user?.id;
  const { currentPassword, newPassword } = req.body;

  // Get user with password
  const user = await prisma.account.findUnique({
    where: { id: userId }
  });

  if (!user) {
    return sendError(res, 'User not found', 404);
  }

  // Verify current password
  const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
  if (!isCurrentPasswordValid) {
    return sendBadRequest(res, 'Current password is incorrect');
  }

  // Hash new password
  const hashedNewPassword = await bcrypt.hash(newPassword, 12);

  // Update password
  await prisma.account.update({
    where: { id: userId },
    data: { password: hashedNewPassword }
  });

  return sendSuccess(res, null, 'Password changed successfully');
});

/**
 * Logout (client-side token invalidation)
 */
export const logout = asyncHandler(async (req: Request, res: Response) => {
  const { refreshToken } = req.body;
  if (!refreshToken) return sendBadRequest(res, 'Refresh token is required');
  try {
    const decoded = verifyRefreshToken(refreshToken);
    if (!decoded.jti) return sendBadRequest(res, 'Invalid token');
    await revokeRefreshToken(decoded.jti);
    return sendSuccess(res, null, 'Logged out successfully');
  } catch (e) {
    return sendBadRequest(res, 'Invalid refresh token');
  }
});

export const logoutAll = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user?.id;
  if (!userId) return sendUnauthorized(res, 'Unauthorized');
  await revokeAllTokensForUser(userId);
  return sendSuccess(res, null, 'All sessions revoked');
});

/**
 * Delete account
 */
export const deleteAccount = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user?.id;
  const { password } = req.body;

  // Get user with password
  const user = await prisma.account.findUnique({
    where: { id: userId }
  });

  if (!user) {
    return sendError(res, 'User not found', 404);
  }

  // Verify password
  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    return sendBadRequest(res, 'Password is incorrect');
  }

  // Delete user (cascade will handle related records)
  await prisma.account.delete({
    where: { id: userId }
  });

  return sendSuccess(res, null, 'Account deleted successfully');
});