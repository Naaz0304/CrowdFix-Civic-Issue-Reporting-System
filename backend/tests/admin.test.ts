describe('Admin Schema Validation', () => {
  const { assignIssueSchema, updateStatusSchema } = require('../src/schemas/admin.schema');

  describe('Assign Issue Schema', () => {
    it('should accept valid UUID', () => {
      const result = assignIssueSchema.safeParse({
        assigned_to_id: '123e4567-e89b-12d3-a456-426614174000',
      });
      expect(result.success).toBe(true);
    });

    it('should reject invalid UUID', () => {
      const result = assignIssueSchema.safeParse({
        assigned_to_id: 'not-a-uuid',
      });
      expect(result.success).toBe(false);
    });

    it('should reject missing assigned_to_id', () => {
      const result = assignIssueSchema.safeParse({});
      expect(result.success).toBe(false);
    });
  });

  describe('Update Status Schema', () => {
    it('should accept valid status', () => {
      const result = updateStatusSchema.safeParse({
        status: 'in_progress',
        comment: 'Work has started',
      });
      expect(result.success).toBe(true);
    });

    it('should accept all valid statuses', () => {
      const statuses = ['reported', 'assigned', 'in_progress', 'resolved', 'verified', 'rejected'];
      statuses.forEach((status) => {
        const result = updateStatusSchema.safeParse({ status });
        expect(result.success).toBe(true);
      });
    });

    it('should reject invalid status', () => {
      const result = updateStatusSchema.safeParse({
        status: 'invalid_status',
      });
      expect(result.success).toBe(false);
    });

    it('should reject missing status', () => {
      const result = updateStatusSchema.safeParse({
        comment: 'Just a comment',
      });
      expect(result.success).toBe(false);
    });

    it('should accept status with optional fields', () => {
      const result = updateStatusSchema.safeParse({
        status: 'resolved',
        comment: 'Issue has been fixed',
        remarks: 'Crew completed work on site',
      });
      expect(result.success).toBe(true);
    });
  });
});

describe('RBAC Middleware', () => {
  const { requireRole } = require('../src/middleware/rbac');

  it('should export requireRole function', () => {
    expect(typeof requireRole).toBe('function');
  });

  it('should return a middleware function', () => {
    const middleware = requireRole('admin');
    expect(typeof middleware).toBe('function');
  });

  it('should reject unauthenticated request', () => {
    const middleware = requireRole('admin');
    const req: any = {};
    const res: any = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    const next = jest.fn();

    middleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  it('should reject unauthorized role', () => {
    const middleware = requireRole('admin');
    const req: any = { user: { userId: '1', email: 'test@test.com', role: 'citizen' } };
    const res: any = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    const next = jest.fn();

    middleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(next).not.toHaveBeenCalled();
  });

  it('should allow authorized role', () => {
    const middleware = requireRole('admin');
    const req: any = { user: { userId: '1', email: 'test@test.com', role: 'admin' } };
    const res: any = {};
    const next = jest.fn();

    middleware(req, res, next);

    expect(next).toHaveBeenCalled();
  });

  it('should allow multiple roles', () => {
    const middleware = requireRole('admin', 'citizen');
    const req: any = { user: { userId: '1', email: 'test@test.com', role: 'citizen' } };
    const res: any = {};
    const next = jest.fn();

    middleware(req, res, next);

    expect(next).toHaveBeenCalled();
  });
});
