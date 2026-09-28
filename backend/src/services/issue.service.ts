import prisma from '../config/database';
import { AppError } from '../middleware/error-handler';
import { CreateIssueInput, UpdateIssueInput, RateIssueInput } from '../schemas/issue.schema';
import { IssueStatus, IssuePriority, IssueCategory, Prisma } from '@prisma/client';

export class IssueService {
  async create(userId: string, data: CreateIssueInput) {
    const issue = await prisma.issue.create({
      data: {
        title: data.title,
        description: data.description,
        category: data.category as IssueCategory,
        latitude: data.latitude,
        longitude: data.longitude,
        address: data.address,
        pincode: data.pincode,
        priority: (data.priority || 'medium') as IssuePriority,
        image_url: data.image_url,
        status: IssueStatus.reported,
        created_by_id: userId,
      },
      include: {
        created_by: { select: { id: true, name: true, email: true } },
        assigned_to: { select: { id: true, name: true, email: true } },
        updates: { orderBy: { created_at: 'asc' } },
        _count: { select: { upvotes: true } },
      },
    });

    // Create initial timeline entry
    await prisma.issueUpdate.create({
      data: {
        issue_id: issue.id,
        status: IssueStatus.reported,
        comment: 'Issue created',
        updated_by_id: userId,
      },
    });

    // Create notification for the reporter
    await prisma.notification.create({
      data: {
        user_id: userId,
        issue_id: issue.id,
        message: 'Your complaint has been registered',
      },
    });

    return this.formatIssue(issue);
  }

  async getAll(filters: {
    status?: string;
    category?: string;
    priority?: string;
    pincode?: string;
    page: number;
    limit: number;
    search?: string;
    sortBy: string;
    sortOrder: string;
    userId?: string;
  }) {
    const where: Prisma.IssueWhereInput = {};

    if (filters.status) where.status = filters.status as IssueStatus;
    if (filters.category) where.category = filters.category as IssueCategory;
    if (filters.priority) where.priority = filters.priority as IssuePriority;
    if (filters.pincode) where.pincode = filters.pincode;
    if (filters.userId) where.created_by_id = filters.userId;

    if (filters.search) {
      where.OR = [
        { title: { contains: filters.search, mode: 'insensitive' } },
        { description: { contains: filters.search, mode: 'insensitive' } },
        { address: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    const orderBy: any = {};
    orderBy[filters.sortBy] = filters.sortOrder;

    const skip = (filters.page - 1) * filters.limit;

    const [issues, total] = await Promise.all([
      prisma.issue.findMany({
        where,
        orderBy,
        skip,
        take: filters.limit,
        include: {
          created_by: { select: { id: true, name: true, email: true } },
          assigned_to: { select: { id: true, name: true, email: true } },
          updates: { orderBy: { created_at: 'asc' }, include: { updated_by: { select: { id: true, name: true } } } },
          _count: { select: { upvotes: true } },
          upvotes: { select: { user_id: true } },
        },
      }),
      prisma.issue.count({ where }),
    ]);

    return {
      issues: issues.map((issue) => this.formatIssue(issue)),
      pagination: {
        page: filters.page,
        limit: filters.limit,
        total,
        totalPages: Math.ceil(total / filters.limit),
      },
    };
  }

  async getById(issueId: string) {
    const issue = await prisma.issue.findUnique({
      where: { id: issueId },
      include: {
        created_by: { select: { id: true, name: true, email: true } },
        assigned_to: { select: { id: true, name: true, email: true } },
        updates: {
          orderBy: { created_at: 'asc' },
          include: { updated_by: { select: { id: true, name: true } } },
        },
        _count: { select: { upvotes: true } },
        upvotes: { select: { user_id: true } },
        notifications: { orderBy: { created_at: 'desc' } },
      },
    });

    if (!issue) {
      throw new AppError('Issue not found', 404);
    }

    return this.formatIssue(issue);
  }

  async update(issueId: string, userId: string, userRole: string, data: UpdateIssueInput) {
    const issue = await prisma.issue.findUnique({ where: { id: issueId } });

    if (!issue) {
      throw new AppError('Issue not found', 404);
    }

    // Only owner or admin can update
    if (issue.created_by_id !== userId && userRole !== 'admin') {
      throw new AppError('Access denied. You can only update your own issues.', 403);
    }

    const updateData: any = {};
    if (data.title) updateData.title = data.title;
    if (data.description) updateData.description = data.description;
    if (data.category) updateData.category = data.category;
    if (data.latitude !== undefined) updateData.latitude = data.latitude;
    if (data.longitude !== undefined) updateData.longitude = data.longitude;
    if (data.address) updateData.address = data.address;
    if (data.pincode) updateData.pincode = data.pincode;
    if (data.priority) updateData.priority = data.priority;
    if (data.image_url) updateData.image_url = data.image_url;

    const updated = await prisma.issue.update({
      where: { id: issueId },
      data: updateData,
      include: {
        created_by: { select: { id: true, name: true, email: true } },
        assigned_to: { select: { id: true, name: true, email: true } },
        updates: { orderBy: { created_at: 'asc' } },
        _count: { select: { upvotes: true } },
        upvotes: { select: { user_id: true } },
      },
    });

    return this.formatIssue(updated);
  }

  async delete(issueId: string, userId: string, userRole: string) {
    const issue = await prisma.issue.findUnique({ where: { id: issueId } });

    if (!issue) {
      throw new AppError('Issue not found', 404);
    }

    if (issue.created_by_id !== userId && userRole !== 'admin') {
      throw new AppError('Access denied. You can only delete your own issues.', 403);
    }

    await prisma.issue.delete({ where: { id: issueId } });

    return { message: 'Issue deleted successfully' };
  }

  async toggleUpvote(issueId: string, userId: string) {
    const issue = await prisma.issue.findUnique({ where: { id: issueId } });
    if (!issue) {
      throw new AppError('Issue not found', 404);
    }

    const existingUpvote = await prisma.upvote.findUnique({
      where: { issue_id_user_id: { issue_id: issueId, user_id: userId } },
    });

    if (existingUpvote) {
      // Remove upvote
      await prisma.upvote.delete({ where: { id: existingUpvote.id } });
      const newCount = Math.max(0, issue.upvote_count - 1);
      await prisma.issue.update({
        where: { id: issueId },
        data: {
          upvote_count: newCount,
          priority: this.calculatePriority(newCount),
        },
      });
      return { upvoted: false, upvote_count: newCount };
    } else {
      // Add upvote
      await prisma.upvote.create({
        data: { issue_id: issueId, user_id: userId },
      });
      const newCount = issue.upvote_count + 1;
      await prisma.issue.update({
        where: { id: issueId },
        data: {
          upvote_count: newCount,
          priority: this.calculatePriority(newCount),
        },
      });
      return { upvoted: true, upvote_count: newCount };
    }
  }

  async rateIssue(issueId: string, userId: string, data: RateIssueInput) {
    const issue = await prisma.issue.findUnique({ where: { id: issueId } });
    if (!issue) {
      throw new AppError('Issue not found', 404);
    }

    if (issue.created_by_id !== userId) {
      throw new AppError('Only the issue reporter can rate it', 403);
    }

    if (!['resolved', 'verified'].includes(issue.status)) {
      throw new AppError('Can only rate resolved or verified issues', 400);
    }

    const updated = await prisma.issue.update({
      where: { id: issueId },
      data: {
        rating: data.rating,
        feedback: data.feedback,
      },
    });

    return {
      id: updated.id,
      rating: updated.rating,
      feedback: updated.feedback,
    };
  }

  async getHeatmapData() {
    const issues = await prisma.issue.findMany({
      where: {
        latitude: { not: null },
        longitude: { not: null },
      },
      select: {
        latitude: true,
        longitude: true,
        address: true,
        status: true,
        category: true,
        priority: true,
      },
    });

    // Group by address/location
    const densityMap = new Map<string, {
      lat: number;
      lng: number;
      count: number;
      categories: string[];
    }>();

    issues.forEach((issue) => {
      const key = issue.address || `${issue.latitude},${issue.longitude}`;
      if (densityMap.has(key)) {
        const existing = densityMap.get(key)!;
        existing.count += 1;
        if (!existing.categories.includes(issue.category)) {
          existing.categories.push(issue.category);
        }
      } else {
        densityMap.set(key, {
          lat: issue.latitude!,
          lng: issue.longitude!,
          count: 1,
          categories: [issue.category],
        });
      }
    });

    return Array.from(densityMap.entries())
      .map(([address, data]) => ({
        address,
        lat: data.lat,
        lng: data.lng,
        count: data.count,
        categories: data.categories,
        severity: data.count >= 10 ? 'critical' : data.count >= 6 ? 'high' : data.count >= 3 ? 'medium' : 'low',
      }))
      .sort((a, b) => b.count - a.count);
  }

  private calculatePriority(upvoteCount: number): IssuePriority {
    if (upvoteCount >= 10) return IssuePriority.high;
    if (upvoteCount >= 5) return IssuePriority.medium;
    return IssuePriority.low;
  }

  private formatIssue(issue: any) {
    return {
      id: issue.id,
      title: issue.title,
      type: issue.title, // Frontend uses 'type' field
      description: issue.description,
      category: issue.category,
      image_url: issue.image_url,
      photo: issue.image_url, // Frontend uses 'photo' field
      location: {
        lat: issue.latitude?.toString() || '',
        lng: issue.longitude?.toString() || '',
        address: issue.address || '',
      },
      pincode: issue.pincode || '',
      status: issue.status === 'reported' ? 'pending' : issue.status, // Map for frontend
      priority: issue.priority,
      upvotes: issue.upvote_count ?? issue._count?.upvotes ?? 0,
      upvoters: issue.upvotes?.map((u: any) => u.user_id) || [],
      remarks: issue.remarks || '',
      expectedDate: issue.expected_date?.toISOString().split('T')[0] || '',
      rating: issue.rating,
      feedback: issue.feedback || '',
      isResolved: ['resolved', 'verified'].includes(issue.status),
      canReopen: issue.status === 'resolved',
      email: issue.created_by?.email || '',
      assignedTo: issue.assigned_to?.name || 'Pending Assignment',
      assignedToId: issue.assigned_to_id,
      createdBy: issue.created_by,
      createdAt: issue.created_at?.toISOString().split('T')[0] || '',
      updatedAt: issue.updated_at?.toISOString().split('T')[0] || '',
      statusHistory: issue.updates?.map((u: any) => ({
        status: u.status === 'reported' ? 'pending' : u.status,
        date: u.created_at?.toISOString().split('T')[0] || '',
        remarks: u.comment || '',
        updatedBy: u.updated_by?.name || '',
      })) || [],
      notifications: issue.notifications?.map((n: any) => ({
        message: n.message,
        date: n.created_at?.toISOString().split('T')[0] || '',
        read: n.read,
      })) || [],
    };
  }
}

export const issueService = new IssueService();
