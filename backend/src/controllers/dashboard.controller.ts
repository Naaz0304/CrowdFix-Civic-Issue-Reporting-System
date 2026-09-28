import { Request, Response, NextFunction } from 'express';
import { dashboardService } from '../services/dashboard.service';

export class DashboardController {
  async getStats(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await dashboardService.getStats();
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }
}

export const dashboardController = new DashboardController();
