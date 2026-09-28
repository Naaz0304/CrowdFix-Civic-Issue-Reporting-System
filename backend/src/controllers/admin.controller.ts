import { Request, Response, NextFunction } from 'express';
import { adminService } from '../services/admin.service';
import logger from '../utils/logger';

export class AdminController {
  async getAllIssues(req: Request, res: Response, next: NextFunction) {
    try {
      const filters = {
        status: req.query.status as string | undefined,
        category: req.query.category as string | undefined,
        priority: req.query.priority as string | undefined,
        page: parseInt(req.query.page as string) || 1,
        limit: parseInt(req.query.limit as string) || 20,
        search: req.query.search as string | undefined,
        sortBy: (req.query.sortBy as string) || 'created_at',
        sortOrder: (req.query.sortOrder as string) || 'desc',
      };
      const result = await adminService.getAllIssues(filters);
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  async assignIssue(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await adminService.assignIssue(req.params.id, req.body, req.user!.userId);
      logger.info(`Issue ${req.params.id} assigned by admin ${req.user!.userId}`);
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  async updateStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await adminService.updateStatus(req.params.id, req.body, req.user!.userId);
      logger.info(`Issue ${req.params.id} status updated to ${req.body.status} by admin ${req.user!.userId}`);
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  async getAdminList(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await adminService.getAdminList();
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }
}

export const adminController = new AdminController();
