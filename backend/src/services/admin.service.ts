import prisma from '../config/database';
import { AppError } from '../middleware/error-handler';
import { AssignIssueInput, UpdateStatusInput } from '../schemas/admin.schema';
import { IssueStatus } from '@prisma/client';

export class AdminService {
  async getAllIssues(filters: {
    status?: string;
    category?: string;
    priority?: string;
    page: number;
    limit: number;
    search?: string;
    sortBy: string;
    sortOrder: string;
  }) {
    const where: any = {};

    if (filters.status) where.status = filters.status;
    if (filters.category) where.category = filters.category;
    if (filters.priority) where.priority = filters.priority;

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

  async assignIssue(issueId: string, data: AssignIssueInput, adminId: string) {
    const issue = await prisma.issue.findUnique({ where: { id: issueId } });
    if (!issue) {
      throw new AppError('Issue not found', 404);
    }

    // Verify the assignee exists and is admin
    const assignee = await prisma.user.findUnique({ where: { id: data.assigned_to_id } });
    if (!assignee) {
      throw new AppError('Assignee not found', 404);
    }

    const updated = await prisma.issue.update({
      where: { id: issueId },
      data: {
        assigned_to_id: data.assigned_to_id,
        status: IssueStatus.assigned,
      },
      include: {
        created_by: { select: { id: true, name: true, email: true } },
        assigned_to: { select: { id: true, name: true, email: true } },
      },
    });

    // Add timeline entry
    await prisma.issueUpdate.create({
      data: {
        issue_id: issueId,
        status: IssueStatus.assigned,
        comment: `Assigned to ${assignee.name}`,
        updated_by_id: adminId,
      },
    });

    // Notify the issue creator
    await prisma.notification.create({
      data: {
        user_id: issue.created_by_id,
        issue_id: issueId,
        message: `Your issue has been assigned to ${assignee.name}`,
      },
    });

    return this.formatIssue(updated);
  }

  async updateStatus(issueId: string, data: UpdateStatusInput, adminId: string) {
    const issue = await prisma.issue.findUnique({ where: { id: issueId } });
    if (!issue) {
      throw new AppError('Issue not found', 404);
    }

    const updateData: any = {
      status: data.status as IssueStatus,
    };

    if (data.remarks) updateData.remarks = data.remarks;
    if (data.expected_date) updateData.expected_date = new Date(data.expected_date);

    const updated = await prisma.issue.update({
      where: { id: issueId },
      data: updateData,
      include: {
        created_by: { select: { id: true, name: true, email: true } },
        assigned_to: { select: { id: true, name: true, email: true } },
      },
    });

    // Add timeline entry
    await prisma.issueUpdate.create({
      data: {
        issue_id: issueId,
        status: data.status as IssueStatus,
        comment: data.comment || `Status updated to ${data.status}`,
        updated_by_id: adminId,
      },
    });

    // Notify the issue creator
    const statusLabels: Record<string, string> = {
      reported: 'reported',
      assigned: 'assigned',
      in_progress: 'in progress',
      resolved: 'resolved',
      verified: 'verified',
      rejected: 'rejected',
    };

    await prisma.notification.create({
      data: {
        user_id: issue.created_by_id,
        issue_id: issueId,
        message: `Your issue status has been updated to: ${statusLabels[data.status] || data.status}`,
      },
    });

    return this.formatIssue(updated);
  }

  async getAdminList() {
    const admins = await prisma.user.findMany({
      where: { role: 'admin' },
      select: { id: true, name: true, email: true },
    });
    return admins;
  }

  private formatIssue(issue: any) {
    return {
      id: issue.id,
      title: issue.title,
      type: issue.title,
      description: issue.description,
      category: issue.category,
      image_url: issue.image_url,
      photo: issue.image_url,
      location: {
        lat: issue.latitude?.toString() || '',
        lng: issue.longitude?.toString() || '',
        address: issue.address || '',
      },
      pincode: issue.pincode || '',
      status: issue.status === 'reported' ? 'pending' : issue.status,
      priority: issue.priority,
      upvotes: issue.upvote_count ?? issue._count?.upvotes ?? 0,
      upvoters: issue.upvotes?.map((u: any) => u.user_id) || [],
      remarks: issue.remarks || '',
      expectedDate: issue.expected_date?.toISOString().split('T')[0] || '',
      rating: issue.rating,
      feedback: issue.feedback || '',
      isResolved: ['resolved', 'verified'].includes(issue.status),
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
      })) || [],
      notifications: issue.notifications?.map((n: any) => ({
        message: n.message,
        date: n.created_at?.toISOString().split('T')[0] || '',
        read: n.read,
      })) || [],
    };
  }
}

export const adminService = new AdminService();
