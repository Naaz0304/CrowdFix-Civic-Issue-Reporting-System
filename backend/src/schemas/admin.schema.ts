import { z } from 'zod';

export const assignIssueSchema = z.object({
  assigned_to_id: z.string().uuid('Invalid user ID'),
});

export const updateStatusSchema = z.object({
  status: z.enum(['reported', 'assigned', 'in_progress', 'resolved', 'verified', 'rejected']),
  comment: z.string().optional(),
  remarks: z.string().optional(),
  expected_date: z.string().datetime().optional().or(z.string().optional()),
});

export type AssignIssueInput = z.infer<typeof assignIssueSchema>;
export type UpdateStatusInput = z.infer<typeof updateStatusSchema>;
