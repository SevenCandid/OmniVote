import { describe, it, expect } from 'vitest';
import { OrganizationCreateSchema } from './organizationSchema';

describe('OrganizationCreateSchema', () => {
  it('validates a correct payload', () => {
    const payload = {
      name: 'Test Org',
      slug: 'test-org',
      country: 'US',
    };
    
    const result = OrganizationCreateSchema.safeParse(payload);
    expect(result.success).toBe(true);
  });

  it('fails if name is too short', () => {
    const payload = {
      name: 'A',
      slug: 'test-org',
    };
    
    const result = OrganizationCreateSchema.safeParse(payload);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.errors[0].message).toMatch(/at least 2 characters/i);
    }
  });

  it('fails if slug format is invalid', () => {
    const payload = {
      name: 'Test Org',
      slug: 'Test_Org_!@#',
    };
    
    const result = OrganizationCreateSchema.safeParse(payload);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.errors[0].message).toMatch(/lowercase letters, numbers, and hyphens/i);
    }
  });
});
