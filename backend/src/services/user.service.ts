import prisma from '../config/database';
import { hashPassword } from '../utils/password';
import { AppError } from '../middleware/error-handler';
import { UpdateUserInput } from '../schemas/user.schema';

export class UserService {
  async getProfile(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
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
        updated_at: true,
      },
    });

    if (!user) {
      throw new AppError('User not found', 404);
    }

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
      updatedAt: user.updated_at,
    };
  }

  async updateProfile(userId: string, data: UpdateUserInput) {
    // Check if email is being changed and is unique
    if (data.email) {
      const existingUser = await prisma.user.findUnique({
        where: { email: data.email },
      });
      if (existingUser && existingUser.id !== userId) {
        throw new AppError('Email already in use', 409);
      }
    }

    const updateData: any = {};

    if (data.name) updateData.name = data.name;
    if (data.email) updateData.email = data.email;
    if (data.phone !== undefined) updateData.phone = data.phone;
    if (data.profile_photo !== undefined) updateData.profile_photo = data.profile_photo;
    if (data.perm_address !== undefined) updateData.perm_address = data.perm_address;
    if (data.temp_address !== undefined) updateData.temp_address = data.temp_address;
    if (data.password) {
      updateData.password_hash = await hashPassword(data.password);
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data: updateData,
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
        updated_at: true,
      },
    });

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
      updatedAt: user.updated_at,
    };
  }
}

export const userService = new UserService();
