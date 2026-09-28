import { PrismaClient, UserRole, IssueCategory, IssueStatus, IssuePriority } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Clean existing data
  await prisma.notification.deleteMany();
  await prisma.upvote.deleteMany();
  await prisma.issueUpdate.deleteMany();
  await prisma.communityPost.deleteMany();
  await prisma.refreshToken.deleteMany();
  await prisma.issue.deleteMany();
  await prisma.user.deleteMany();

  // ─── Create Users ─────────────────────────────────────
  const passwordHash = await bcrypt.hash('citizen123', 12);
  const adminPasswordHash = await bcrypt.hash('authority123', 12);

  const citizen1 = await prisma.user.create({
    data: {
      name: 'John Doe',
      email: 'citizen@example.com',
      password_hash: passwordHash,
      phone: '+1-555-0100',
      role: UserRole.citizen,
    },
  });

  const citizen2 = await prisma.user.create({
    data: {
      name: 'Jane Smith',
      email: 'user@example.com',
      password_hash: await bcrypt.hash('password123', 12),
      phone: '+1-555-0101',
      role: UserRole.citizen,
    },
  });

  const admin1 = await prisma.user.create({
    data: {
      name: 'Admin Official',
      email: 'authority@example.com',
      password_hash: adminPasswordHash,
      phone: '+1-555-0200',
      role: UserRole.admin,
    },
  });

  const admin2 = await prisma.user.create({
    data: {
      name: 'City Manager',
      email: 'official@example.com',
      password_hash: await bcrypt.hash('official123', 12),
      phone: '+1-555-0201',
      role: UserRole.admin,
    },
  });

  console.log('✅ Users created');

  // ─── Create Issues ────────────────────────────────────
  const issue1 = await prisma.issue.create({
    data: {
      title: 'Pothole / Road Damage',
      description: 'Large pothole on Main Street near the intersection',
      category: IssueCategory.pothole,
      latitude: 40.7128,
      longitude: -74.0060,
      address: 'Main St & 5th Ave',
      pincode: '10001',
      status: IssueStatus.in_progress,
      priority: IssuePriority.high,
      upvote_count: 5,
      remarks: 'Work in progress',
      expected_date: new Date('2024-11-15'),
      created_by_id: citizen1.id,
      assigned_to_id: admin1.id,
    },
  });

  const issue2 = await prisma.issue.create({
    data: {
      title: 'Street Light Out',
      description: 'Street light not working on Oak Avenue',
      category: IssueCategory.streetlight,
      latitude: 40.7140,
      longitude: -74.0065,
      address: 'Oak Ave & 3rd St',
      pincode: '10002',
      status: IssueStatus.verified,
      priority: IssuePriority.medium,
      upvote_count: 3,
      remarks: 'Completed and verified',
      rating: 4,
      feedback: 'Great work, issue was resolved quickly',
      created_by_id: citizen2.id,
      assigned_to_id: admin1.id,
    },
  });

  const issue3 = await prisma.issue.create({
    data: {
      title: 'Graffiti on Bridge',
      description: 'Large graffiti tags covering the side of Bridge Ave overpass',
      category: IssueCategory.graffiti,
      latitude: 40.7150,
      longitude: -74.0070,
      address: 'Bridge Ave',
      pincode: '10003',
      status: IssueStatus.reported,
      priority: IssuePriority.low,
      upvote_count: 2,
      created_by_id: citizen1.id,
    },
  });

  const issue4 = await prisma.issue.create({
    data: {
      title: 'Sidewalk Damage',
      description: 'Cracked and uneven sidewalk near Park Lane creating trip hazard',
      category: IssueCategory.sidewalk,
      latitude: 40.7160,
      longitude: -74.0080,
      address: 'Park Lane',
      pincode: '10004',
      status: IssueStatus.in_progress,
      priority: IssuePriority.high,
      upvote_count: 8,
      remarks: 'Repair crew scheduled',
      expected_date: new Date('2024-12-01'),
      created_by_id: citizen2.id,
      assigned_to_id: admin2.id,
    },
  });

  const issue5 = await prisma.issue.create({
    data: {
      title: 'Debris / Litter',
      description: 'Pile of construction debris left on Elm Street after building renovation',
      category: IssueCategory.debris,
      latitude: 40.7135,
      longitude: -74.0055,
      address: 'Elm Street',
      pincode: '10001',
      status: IssueStatus.assigned,
      priority: IssuePriority.medium,
      upvote_count: 4,
      created_by_id: citizen1.id,
      assigned_to_id: admin2.id,
    },
  });

  console.log('✅ Issues created');

  // ─── Create Issue Updates (Timeline) ──────────────────
  await prisma.issueUpdate.createMany({
    data: [
      // Issue 1 timeline
      { issue_id: issue1.id, status: IssueStatus.reported, comment: 'Issue reported', updated_by_id: citizen1.id },
      { issue_id: issue1.id, status: IssueStatus.assigned, comment: 'Assigned to Public Works', updated_by_id: admin1.id },
      { issue_id: issue1.id, status: IssueStatus.in_progress, comment: 'Work started', updated_by_id: admin1.id },
      // Issue 2 timeline
      { issue_id: issue2.id, status: IssueStatus.reported, comment: 'Issue reported', updated_by_id: citizen2.id },
      { issue_id: issue2.id, status: IssueStatus.verified, comment: 'Resolved and verified', updated_by_id: admin1.id },
      // Issue 3 timeline
      { issue_id: issue3.id, status: IssueStatus.reported, comment: 'Issue reported', updated_by_id: citizen1.id },
      // Issue 4 timeline
      { issue_id: issue4.id, status: IssueStatus.reported, comment: 'Issue reported', updated_by_id: citizen2.id },
      { issue_id: issue4.id, status: IssueStatus.assigned, comment: 'Assigned to maintenance team', updated_by_id: admin2.id },
      { issue_id: issue4.id, status: IssueStatus.in_progress, comment: 'Repair crew dispatched', updated_by_id: admin2.id },
      // Issue 5 timeline
      { issue_id: issue5.id, status: IssueStatus.reported, comment: 'Issue reported', updated_by_id: citizen1.id },
      { issue_id: issue5.id, status: IssueStatus.assigned, comment: 'Assigned to cleanup crew', updated_by_id: admin2.id },
    ],
  });

  console.log('✅ Issue updates created');

  // ─── Create Upvotes ───────────────────────────────────
  await prisma.upvote.createMany({
    data: [
      { issue_id: issue1.id, user_id: citizen2.id },
      { issue_id: issue4.id, user_id: citizen1.id },
    ],
  });

  console.log('✅ Upvotes created');

  // ─── Create Notifications ─────────────────────────────
  await prisma.notification.createMany({
    data: [
      { user_id: citizen1.id, issue_id: issue1.id, message: 'Your complaint has been accepted', read: true },
      { user_id: citizen1.id, issue_id: issue1.id, message: 'Work is in progress on your reported issue', read: true },
      { user_id: citizen2.id, issue_id: issue2.id, message: 'Your issue has been resolved', read: true },
      { user_id: citizen1.id, issue_id: issue3.id, message: 'Your complaint has been registered', read: false },
      { user_id: citizen2.id, issue_id: issue4.id, message: 'Repair crew has been scheduled for your issue', read: false },
      { user_id: citizen1.id, issue_id: issue5.id, message: 'Your issue has been assigned to cleanup crew', read: false },
    ],
  });

  console.log('✅ Notifications created');

  // ─── Create Community Posts ───────────────────────────
  await prisma.communityPost.createMany({
    data: [
      { user_id: citizen1.id, content: 'The pothole on Main Street is getting worse. Please upvote issue ISS-001!' },
      { user_id: citizen2.id, content: 'Great to see the streetlight on Oak Ave finally fixed. Thanks to the city team!' },
      { user_id: citizen1.id, content: 'Has anyone noticed the graffiti on Bridge Ave? I just reported it.' },
    ],
  });

  console.log('✅ Community posts created');

  console.log('');
  console.log('🎉 Database seeded successfully!');
  console.log('');
  console.log('Demo accounts:');
  console.log('  Citizen: citizen@example.com / citizen123');
  console.log('  Admin:   authority@example.com / authority123');
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
