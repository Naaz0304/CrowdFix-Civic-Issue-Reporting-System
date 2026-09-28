import { Request, Response, NextFunction } from 'express';
import { issueService } from '../services/issue.service';
import logger from '../utils/logger';

export class IssueController {
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await issueService.create(req.user!.userId, req.body);
      logger.info(`Issue created by user ${req.user!.userId}`);
      res.status(201).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const filters = {
        status: req.query.status as string | undefined,
        category: req.query.category as string | undefined,
        priority: req.query.priority as string | undefined,
        pincode: req.query.pincode as string | undefined,
        page: parseInt(req.query.page as string) || 1,
        limit: parseInt(req.query.limit as string) || 10,
        search: req.query.search as string | undefined,
        sortBy: (req.query.sortBy as string) || 'created_at',
        sortOrder: (req.query.sortOrder as string) || 'desc',
        userId: req.query.userId as string | undefined,
      };
      const result = await issueService.getAll(filters);
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await issueService.getById(req.params.id);
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await issueService.update(
        req.params.id,
        req.user!.userId,
        req.user!.role,
        req.body
      );
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await issueService.delete(
        req.params.id,
        req.user!.userId,
        req.user!.role
      );
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  async toggleUpvote(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await issueService.toggleUpvote(req.params.id, req.user!.userId);
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  async rateIssue(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await issueService.rateIssue(req.params.id, req.user!.userId, req.body);
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  async getHeatmap(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await issueService.getHeatmapData();
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }
}

export const issueController = new IssueController();
