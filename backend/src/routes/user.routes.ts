import { Router } from 'express';
import { userController } from '../controllers/user.controller';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { updateUserSchema } from '../schemas/user.schema';

const router = Router();

/**
 * @swagger
 * /users/me:
 *   get:
 *     tags: [Users]
 *     summary: Get current user profile
 *     responses:
 *       200: { description: User profile }
 *       401: { description: Not authenticated }
 */
router.get('/me', authenticate, userController.getMe);

/**
 * @swagger
 * /users/update:
 *   put:
 *     tags: [Users]
 *     summary: Update current user profile
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name: { type: string }
 *               phone: { type: string }
 *               email: { type: string }
 *               password: { type: string }
 *               profile_photo: { type: string }
 *               perm_address: { type: string }
 *               temp_address: { type: string }
 *     responses:
 *       200: { description: Profile updated }
 */
router.put('/update', authenticate, validate(updateUserSchema), userController.updateProfile);

export default router;
