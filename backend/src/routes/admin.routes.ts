import { Router } from 'express';
import { adminController } from '../controllers/admin.controller';
import { authenticate } from '../middleware/auth';
import { requireRole } from '../middleware/rbac';
import { validate } from '../middleware/validate';
import { assignIssueSchema, updateStatusSchema } from '../schemas/admin.schema';

const router = Router();

/**
 * @swagger
 * /admin/issues:
 *   get:
 *     tags: [Admin]
 *     summary: Get all issues (admin view)
 *     parameters:
 *       - in: query
 *         name: status
 *         schema: { type: string }
 *       - in: query
 *         name: category
 *         schema: { type: string }
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 20 }
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *     responses:
 *       200: { description: List of all issues }
 *       403: { description: Admin access required }
 */
router.get('/issues', authenticate, requireRole('admin'), adminController.getAllIssues);

/**
 * @swagger
 * /admin/issues/{id}/assign:
 *   put:
 *     tags: [Admin]
 *     summary: Assign issue to an admin
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [assigned_to_id]
 *             properties:
 *               assigned_to_id: { type: string, format: uuid }
 *     responses:
 *       200: { description: Issue assigned }
 */
router.put('/issues/:id/assign', authenticate, requireRole('admin'), validate(assignIssueSchema), adminController.assignIssue);

/**
 * @swagger
 * /admin/issues/{id}/status:
 *   put:
 *     tags: [Admin]
 *     summary: Update issue status
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [status]
 *             properties:
 *               status: { type: string, enum: [reported, assigned, in_progress, resolved, verified, rejected] }
 *               comment: { type: string }
 *               remarks: { type: string }
 *     responses:
 *       200: { description: Status updated }
 */
router.put('/issues/:id/status', authenticate, requireRole('admin'), validate(updateStatusSchema), adminController.updateStatus);

/**
 * @swagger
 * /admin/list:
 *   get:
 *     tags: [Admin]
 *     summary: Get list of admin users
 *     responses:
 *       200: { description: Admin list }
 */
router.get('/list', authenticate, requireRole('admin'), adminController.getAdminList);

export default router;
