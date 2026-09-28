import { Router } from 'express';
import { dashboardController } from '../controllers/dashboard.controller';
import { authenticate } from '../middleware/auth';
import { requireRole } from '../middleware/rbac';

const router = Router();

/**
 * @swagger
 * /dashboard/stats:
 *   get:
 *     tags: [Dashboard]
 *     summary: Get dashboard statistics
 *     responses:
 *       200: { description: Dashboard statistics }
 *       403: { description: Admin access required }
 */
router.get('/stats', authenticate, requireRole('admin'), dashboardController.getStats);

export default router;
