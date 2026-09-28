import { UserRole } from '@prisma/client';

declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string;
        email: string;
        role: string;
      };
    }
  }
}

export interface AuthenticatedRequest extends Express.Request {
  user: {
    userId: string;
    email: string;
    role: string;
  };
}

export {};
