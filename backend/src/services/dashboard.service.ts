import prisma from '../config/database';

export class DashboardService {
  async getStats() {
    const [
      totalIssues,
      reportedCount,
      assignedCount,
      inProgressCount,
      resolvedCount,
      verifiedCount,
      rejectedCount,
      totalUsers,
      citizenCount,
      adminCount,
    ] = await Promise.all([
      prisma.issue.count(),
      prisma.issue.count({ where: { status: 'reported' } }),
      prisma.issue.count({ where: { status: 'assigned' } }),
      prisma.issue.count({ where: { status: 'in_progress' } }),
      prisma.issue.count({ where: { status: 'resolved' } }),
      prisma.issue.count({ where: { status: 'verified' } }),
      prisma.issue.count({ where: { status: 'rejected' } }),
      prisma.user.count(),
      prisma.user.count({ where: { role: 'citizen' } }),
      prisma.user.count({ where: { role: 'admin' } }),
    ]);

    // Category breakdown
    const categoryBreakdown = await prisma.issue.groupBy({
      by: ['category'],
      _count: { id: true },
    });

    // Priority breakdown
    const priorityBreakdown = await prisma.issue.groupBy({
      by: ['priority'],
      _count: { id: true },
    });

    // Recent issues (last 7 days) per day
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const recentIssues = await prisma.issue.findMany({
      where: { created_at: { gte: sevenDaysAgo } },
      select: { created_at: true, status: true },
    });

    // Group by day
    const dailyData: Record<string, { reported: number; resolved: number; inProgress: number }> = {};
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dayName = days[date.getDay()];
      dailyData[dayName] = { reported: 0, resolved: 0, inProgress: 0 };
    }

    recentIssues.forEach((issue) => {
      const dayName = days[issue.created_at.getDay()];
      if (dailyData[dayName]) {
        dailyData[dayName].reported += 1;
        if (issue.status === 'resolved' || issue.status === 'verified') {
          dailyData[dayName].resolved += 1;
        }
        if (issue.status === 'in_progress') {
          dailyData[dayName].inProgress += 1;
        }
      }
    });

    const chartData = Object.entries(dailyData).map(([date, data]) => ({
      date,
      ...data,
    }));

    // Average resolution time
    const resolvedIssues = await prisma.issue.findMany({
      where: { status: { in: ['resolved', 'verified'] } },
      select: { created_at: true, updated_at: true },
    });

    let avgResolutionDays = 0;
    if (resolvedIssues.length > 0) {
      const totalDays = resolvedIssues.reduce((sum, issue) => {
        return sum + (issue.updated_at.getTime() - issue.created_at.getTime()) / (1000 * 60 * 60 * 24);
      }, 0);
      avgResolutionDays = Math.round((totalDays / resolvedIssues.length) * 10) / 10;
    }

    const categoryColors: Record<string, string> = {
      pothole: '#3b3d5c',
      streetlight: '#7c6fa1',
      graffiti: '#d97e3a',
      sidewalk: '#a0a0a0',
      debris: '#505050',
      other: '#888888',
    };

    return {
      overview: {
        totalIssues,
        pending: reportedCount + assignedCount,
        inProgress: inProgressCount,
        resolved: resolvedCount + verifiedCount,
        rejected: rejectedCount,
        totalUsers,
        citizenCount,
        adminCount,
        avgResolutionDays,
      },
      categoryBreakdown: categoryBreakdown.map((c) => ({
        name: c.category.charAt(0).toUpperCase() + c.category.slice(1),
        value: c._count.id,
        color: categoryColors[c.category] || '#888888',
      })),
      priorityBreakdown: priorityBreakdown.map((p) => ({
        name: p.priority.charAt(0).toUpperCase() + p.priority.slice(1),
        value: p._count.id,
      })),
      chartData,
    };
  }
}

export const dashboardService = new DashboardService();
