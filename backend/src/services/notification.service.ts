import prisma from '../config/database';
import { AppError } from '../middleware/error-handler';

export class NotificationService {
  async getUserNotifications(userId: string, page = 1, limit = 50) {
    const skip = (page - 1) * limit;

    const [notifications, total] = await Promise.all([
      prisma.notification.findMany({
        where: { user_id: userId },
        orderBy: { created_at: 'desc' },
        skip,
        take: limit,
        include: {
          issue: { select: { id: true, title: true, status: true } },
        },
      }),
      prisma.notification.count({ where: { user_id: userId } }),
    ]);

    const unreadCount = await prisma.notification.count({
      where: { user_id: userId, read: false },
    });

    return {
      notifications: notifications.map((n) => ({
        id: n.id,
        issueId: n.issue_id,
        issueTitle: n.issue?.title || '',
        message: n.message,
        read: n.read,
        date: n.created_at.toISOString().split('T')[0],
        createdAt: n.created_at,
      })),
      unreadCount,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async markAsRead(notificationId: string, userId: string) {
    const notification = await prisma.notification.findUnique({
      where: { id: notificationId },
    });

    if (!notification) {
      throw new AppError('Notification not found', 404);
    }

    if (notification.user_id !== userId) {
      throw new AppError('Access denied', 403);
    }

    const updated = await prisma.notification.update({
      where: { id: notificationId },
      data: { read: true },
    });

    return {
      id: updated.id,
      read: updated.read,
      message: 'Notification marked as read',
    };
  }

  async markAllAsRead(userId: string) {
    await prisma.notification.updateMany({
      where: { user_id: userId, read: false },
      data: { read: true },
    });

    return { message: 'All notifications marked as read' };
  }
}

export const notificationService = new NotificationService();
