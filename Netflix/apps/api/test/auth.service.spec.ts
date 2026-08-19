import { describe, it, expect } from 'bun:test';
import * as bcrypt from 'bcryptjs';

describe('Auth & Security Unit Tests', () => {
  it('should hash passwords securely with bcrypt', async () => {
    const password = 'SecretPassword123!';
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);

    expect(hash).toBeDefined();
    expect(hash).not.toBe(password);

    const isMatch = await bcrypt.compare(password, hash);
    expect(isMatch).toBe(true);
  });
});
