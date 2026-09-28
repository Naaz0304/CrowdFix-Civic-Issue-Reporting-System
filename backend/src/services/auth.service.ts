import prisma from '../config/database';
import { hashPassword, comparePassword } from '../utils/password';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken, getRefreshTokenExpiryDate } from '../utils/jwt';
import { AppError } from '../middleware/error-handler';
import { RegisterInput, LoginInput } from '../schemas/auth.schema';
import { UserRole } from '@prisma/client';

export class AuthService {
  async register(data: RegisterInput) {
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      throw new AppError('Email already registered', 409);
    }

    // Hash password
    const password_hash = await hashPassword(data.password);

    // Map role
    const role = data.role === 'admin' ? UserRole.admin : UserRole.citizen;

    // Create user
    const user = await prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        password_hash,
        role,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        phone: true,
        profile_photo: true,
        perm_address: true,
        temp_address: true,
        created_at: true,
      },
    });

    // Generate tokens
    const tokenPayload = { userId: user.id, email: user.email, role: user.role };
    const accessToken = generateAccessToken(tokenPayload);
    const refreshToken = generateRefreshToken(tokenPayload);

    // Store refresh token
    await prisma.refreshToken.create({
      data: {
        user_id: user.id,
        token: refreshToken,
        expires_at: getRefreshTokenExpiryDate(),
      },
    });

    return {
      user: this.formatUser(user),
      accessToken,
      refreshToken,
    };
  }

  async login(data: LoginInput) {
    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (!user) {
      throw new AppError('Invalid email or password', 401);
    }

    // Check role if specified
    if (data.role) {
      const expectedRole = data.role === 'admin' ? UserRole.admin : UserRole.citizen;
      if (user.role !== expectedRole) {
        throw new AppError('Invalid email or password', 401);
      }
    }

    // Verify password
    const isPasswordValid = await comparePassword(data.password, user.password_hash);
    if (!isPasswordValid) {
      throw new AppError('Invalid email or password', 401);
    }

    // Generate tokens
    const tokenPayload = { userId: user.id, email: user.email, role: user.role };
    const accessToken = generateAccessToken(tokenPayload);
    const refreshToken = generateRefreshToken(tokenPayload);

    // Store refresh token
    await prisma.refreshToken.create({
      data: {
        user_id: user.id,
        token: refreshToken,
        expires_at: getRefreshTokenExpiryDate(),
      },
    });

    return {
      user: this.formatUser(user),
      accessToken,
      refreshToken,
    };
  }

  async refresh(refreshTokenStr: string) {
    // Verify token
    let decoded;
    try {
      decoded = verifyRefreshToken(refreshTokenStr);
    } catch {
      throw new AppError('Invalid or expired refresh token', 401);
    }

    // Check if token exists in DB
    const storedToken = await prisma.refreshToken.findUnique({
      where: { token: refreshTokenStr },
    });

    if (!storedToken) {
      throw new AppError('Refresh token not found. Please login again.', 401);
    }

    if (storedToken.expires_at < new Date()) {
      await prisma.refreshToken.delete({ where: { id: storedToken.id } });
      throw new AppError('Refresh token expired. Please login again.', 401);
    }

    // Get user
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
    });

    if (!user) {
      throw new AppError('User not found', 404);
    }

    // Rotate tokens
    await prisma.refreshToken.delete({ where: { id: storedToken.id } });

    const tokenPayload = { userId: user.id, email: user.email, role: user.role };
    const newAccessToken = generateAccessToken(tokenPayload);
    const newRefreshToken = generateRefreshToken(tokenPayload);

    await prisma.refreshToken.create({
      data: {
        user_id: user.id,
        token: newRefreshToken,
        expires_at: getRefreshTokenExpiryDate(),
      },
    });

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    };
  }

  async logout(refreshTokenStr: string) {
    const token = await prisma.refreshToken.findUnique({
      where: { token: refreshTokenStr },
    });

    if (token) {
      await prisma.refreshToken.delete({ where: { id: token.id } });
    }

    return { message: 'Logged out successfully' };
  }

  private formatUser(user: any) {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role === 'admin' ? 'authority' : user.role,
      phone: user.phone || '',
      profilePhoto: user.profile_photo || '',
      permanentAddress: user.perm_address || '',
      temporaryAddress: user.temp_address || '',
      createdAt: user.created_at,
    };
  }
}

export const authService = new AuthService();
