import { z } from 'zod';

export const updateUserSchema = z.object({
  name: z.string().min(2).max(255).optional(),
  phone: z.string().max(20).optional(),
  profile_photo: z.string().optional(),
  perm_address: z.string().optional(),
  temp_address: z.string().optional(),
  email: z.string().email().optional(),
  password: z.string().min(6).max(128).optional(),
});

export type UpdateUserInput = z.infer<typeof updateUserSchema>;
