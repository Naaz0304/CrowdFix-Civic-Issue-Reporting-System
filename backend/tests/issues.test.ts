describe('Issue Schema Validation', () => {
  const { createIssueSchema, updateIssueSchema, rateIssueSchema } = require('../src/schemas/issue.schema');

  describe('Create Issue Schema', () => {
    it('should validate valid issue data', () => {
      const result = createIssueSchema.safeParse({
        title: 'Pothole on Main Street',
        description: 'Large pothole near the intersection causing traffic issues',
        category: 'pothole',
        latitude: 40.7128,
        longitude: -74.006,
        address: 'Main St & 5th Ave',
        pincode: '10001',
        priority: 'high',
      });
      expect(result.success).toBe(true);
    });

    it('should reject missing required fields', () => {
      const result = createIssueSchema.safeParse({
        title: 'Test',
      });
      expect(result.success).toBe(false);
    });

    it('should reject short title', () => {
      const result = createIssueSchema.safeParse({
        title: 'AB',
        description: 'A valid description that is long enough',
        category: 'pothole',
      });
      expect(result.success).toBe(false);
    });

    it('should reject short description', () => {
      const result = createIssueSchema.safeParse({
        title: 'Valid Title',
        description: 'Short',
        category: 'pothole',
      });
      expect(result.success).toBe(false);
    });

    it('should reject invalid category', () => {
      const result = createIssueSchema.safeParse({
        title: 'Valid Title',
        description: 'A valid description that is long enough',
        category: 'invalid_category',
      });
      expect(result.success).toBe(false);
    });

    it('should reject invalid latitude', () => {
      const result = createIssueSchema.safeParse({
        title: 'Valid Title',
        description: 'A valid description that is long enough',
        category: 'pothole',
        latitude: 200,
      });
      expect(result.success).toBe(false);
    });

    it('should accept minimal valid data', () => {
      const result = createIssueSchema.safeParse({
        title: 'Valid Title',
        description: 'A valid description that is long enough',
        category: 'graffiti',
      });
      expect(result.success).toBe(true);
    });

    it('should default priority to medium', () => {
      const result = createIssueSchema.parse({
        title: 'Valid Title',
        description: 'A valid description that is long enough',
        category: 'pothole',
      });
      expect(result.priority).toBe('medium');
    });
  });

  describe('Update Issue Schema', () => {
    it('should accept partial updates', () => {
      const result = updateIssueSchema.safeParse({
        title: 'Updated Title',
      });
      expect(result.success).toBe(true);
    });

    it('should accept empty update', () => {
      const result = updateIssueSchema.safeParse({});
      expect(result.success).toBe(true);
    });

    it('should reject invalid priority', () => {
      const result = updateIssueSchema.safeParse({
        priority: 'critical',
      });
      expect(result.success).toBe(false);
    });
  });

  describe('Rate Issue Schema', () => {
    it('should accept valid rating', () => {
      const result = rateIssueSchema.safeParse({
        rating: 4,
        feedback: 'Good work!',
      });
      expect(result.success).toBe(true);
    });

    it('should reject rating out of range', () => {
      const result = rateIssueSchema.safeParse({ rating: 6 });
      expect(result.success).toBe(false);
    });

    it('should reject rating below minimum', () => {
      const result = rateIssueSchema.safeParse({ rating: 0 });
      expect(result.success).toBe(false);
    });
  });
});
