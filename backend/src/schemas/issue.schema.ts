import { z } from 'zod';

export const createIssueSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(500),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  category: z.enum(['pothole', 'streetlight', 'sidewalk', 'graffiti', 'debris', 'other']),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  address: z.string().optional(),
  pincode: z.string().max(10).optional(),
  priority: z.enum(['low', 'medium', 'high']).default('medium'),
  image_url: z.string().optional(),
});

export const updateIssueSchema = z.object({
  title: z.string().min(3).max(500).optional(),
  description: z.string().min(10).optional(),
  category: z.enum(['pothole', 'streetlight', 'sidewalk', 'graffiti', 'debris', 'other']).optional(),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  address: z.string().optional(),
  pincode: z.string().max(10).optional(),
  priority: z.enum(['low', 'medium', 'high']).optional(),
  image_url: z.string().optional(),
});

export const issueFilterSchema = z.object({
  status: z.enum(['reported', 'assigned', 'in_progress', 'resolved', 'verified', 'rejected']).optional(),
  category: z.enum(['pothole', 'streetlight', 'sidewalk', 'graffiti', 'debris', 'other']).optional(),
  priority: z.enum(['low', 'medium', 'high']).optional(),
  pincode: z.string().optional(),
  page: z.string().transform(Number).default('1'),
  limit: z.string().transform(Number).default('10'),
  search: z.string().optional(),
  sortBy: z.enum(['created_at', 'upvote_count', 'priority']).default('created_at'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

export const rateIssueSchema = z.object({
  rating: z.number().min(1).max(5),
  feedback: z.string().optional(),
});

export type CreateIssueInput = z.infer<typeof createIssueSchema>;
export type UpdateIssueInput = z.infer<typeof updateIssueSchema>;
export type IssueFilterInput = z.infer<typeof issueFilterSchema>;
export type RateIssueInput = z.infer<typeof rateIssueSchema>;
