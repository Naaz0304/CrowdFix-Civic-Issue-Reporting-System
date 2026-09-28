import { Router } from 'express';
import { issueController } from '../controllers/issue.controller';
import { authenticate } from '../middleware/auth';
import { requireRole } from '../middleware/rbac';
import { validate } from '../middleware/validate';
import { createIssueSchema, updateIssueSchema, rateIssueSchema } from '../schemas/issue.schema';

const router = Router();

/**
 * @swagger
 * /issues:
 *   post:
 *     tags: [Issues]
 *     summary: Report a new issue
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [title, description, category]
 *             properties:
 *               title: { type: string }
 *               description: { type: string }
 *               category: { type: string, enum: [pothole, streetlight, sidewalk, graffiti, debris, other] }
 *               latitude: { type: number }
 *               longitude: { type: number }
 *               address: { type: string }
 *               pincode: { type: string }
 *               priority: { type: string, enum: [low, medium, high] }
 *               image_url: { type: string }
 *     responses:
 *       201: { description: Issue created }
 */
router.post('/', authenticate, requireRole('citizen'), validate(createIssueSchema), issueController.create);

/**
 * @swagger
 * /issues:
 *   get:
 *     tags: [Issues]
 *     summary: List issues with filters and pagination
 *     parameters:
 *       - in: query
 *         name: status
 *         schema: { type: string }
 *       - in: query
 *         name: category
 *         schema: { type: string }
 *       - in: query
 *         name: priority
 *         schema: { type: string }
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 10 }
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *       - in: query
 *         name: sortBy
 *         schema: { type: string, default: created_at }
 *       - in: query
 *         name: sortOrder
 *         schema: { type: string, enum: [asc, desc], default: desc }
 *     responses:
 *       200: { description: List of issues }
 */
router.get('/', authenticate, issueController.getAll);

/**
 * @swagger
 * /issues/heatmap:
 *   get:
 *     tags: [Issues]
 *     summary: Get heatmap data (location-clustered issue counts)
 *     responses:
 *       200: { description: Heatmap data }
 */
router.get('/heatmap', authenticate, requireRole('admin'), issueController.getHeatmap);

/**
 * @swagger
 * /issues/{id}:
 *   get:
 *     tags: [Issues]
 *     summary: Get issue details by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Issue details }
 *       404: { description: Issue not found }
 */
router.get('/:id', authenticate, issueController.getById);

/**
 * @swagger
 * /issues/{id}:
 *   put:
 *     tags: [Issues]
 *     summary: Update an issue
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title: { type: string }
 *               description: { type: string }
 *               category: { type: string }
 *     responses:
 *       200: { description: Issue updated }
 */
router.put('/:id', authenticate, validate(updateIssueSchema), issueController.update);

/**
 * @swagger
 * /issues/{id}:
 *   delete:
 *     tags: [Issues]
 *     summary: Delete an issue
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Issue deleted }
 */
router.delete('/:id', authenticate, issueController.delete);

/**
 * @swagger
 * /issues/{id}/upvote:
 *   post:
 *     tags: [Issues]
 *     summary: Toggle upvote on an issue
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Upvote toggled }
 */
router.post('/:id/upvote', authenticate, requireRole('citizen'), issueController.toggleUpvote);

/**
 * @swagger
 * /issues/{id}/rate:
 *   post:
 *     tags: [Issues]
 *     summary: Rate a resolved issue
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [rating]
 *             properties:
 *               rating: { type: integer, minimum: 1, maximum: 5 }
 *               feedback: { type: string }
 *     responses:
 *       200: { description: Issue rated }
 */
router.post('/:id/rate', authenticate, requireRole('citizen'), validate(rateIssueSchema), issueController.rateIssue);

export default router;
