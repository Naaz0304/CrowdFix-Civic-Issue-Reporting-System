import { hashPassword, comparePassword } from '../src/utils/password';
import { generateAccessToken, verifyAccessToken, generateRefreshToken, verifyRefreshToken } from '../src/utils/jwt';

describe('Auth Utilities', () => {
  describe('Password Hashing', () => {
    it('should hash and verify a password correctly', async () => {
      const password = 'testpassword123';
      const hash = await hashPassword(password);

      expect(hash).toBeDefined();
      expect(hash).not.toBe(password);

      const isValid = await comparePassword(password, hash);
      expect(isValid).toBe(true);
    });

    it('should reject wrong password', async () => {
      const hash = await hashPassword('correctpassword');
      const isValid = await comparePassword('wrongpassword', hash);
      expect(isValid).toBe(false);
    });
  });

  describe('JWT Tokens', () => {
    const payload = {
      userId: '123e4567-e89b-12d3-a456-426614174000',
      email: 'test@example.com',
      role: 'citizen',
    };

    it('should generate and verify access token', () => {
      const token = generateAccessToken(payload);
      expect(token).toBeDefined();
      expect(typeof token).toBe('string');

      const decoded = verifyAccessToken(token);
      expect(decoded.userId).toBe(payload.userId);
      expect(decoded.email).toBe(payload.email);
      expect(decoded.role).toBe(payload.role);
    });

    it('should generate and verify refresh token', () => {
      const token = generateRefreshToken(payload);
      expect(token).toBeDefined();
      expect(typeof token).toBe('string');

      const decoded = verifyRefreshToken(token);
      expect(decoded.userId).toBe(payload.userId);
      expect(decoded.email).toBe(payload.email);
    });

    it('should fail verification with tampered token', () => {
      const token = generateAccessToken(payload);
      const tamperedToken = token + 'x';

      expect(() => verifyAccessToken(tamperedToken)).toThrow();
    });
  });
});

describe('Auth Schema Validation', () => {
  const { registerSchema, loginSchema } = require('../src/schemas/auth.schema');

  describe('Register Schema', () => {
    it('should validate valid registration data', () => {
      const result = registerSchema.safeParse({
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123',
        role: 'citizen',
      });
      expect(result.success).toBe(true);
    });

    it('should reject short password', () => {
      const result = registerSchema.safeParse({
        name: 'John',
        email: 'john@example.com',
        password: '123',
      });
      expect(result.success).toBe(false);
    });

    it('should reject invalid email', () => {
      const result = registerSchema.safeParse({
        name: 'John',
        email: 'not-an-email',
        password: 'password123',
      });
      expect(result.success).toBe(false);
    });

    it('should reject empty name', () => {
      const result = registerSchema.safeParse({
        name: '',
        email: 'john@example.com',
        password: 'password123',
      });
      expect(result.success).toBe(false);
    });
  });

  describe('Login Schema', () => {
    it('should validate valid login data', () => {
      const result = loginSchema.safeParse({
        email: 'john@example.com',
        password: 'password123',
      });
      expect(result.success).toBe(true);
    });

    it('should accept login with role', () => {
      const result = loginSchema.safeParse({
        email: 'john@example.com',
        password: 'password123',
        role: 'admin',
      });
      expect(result.success).toBe(true);
    });
  });
});
