import { describe, it, expect, vi } from 'vitest';
import supabase from '../lib/supabase';
import { followUser, likeSubmission, unlikeSubmission } from '../lib/api';

vi.mock('../lib/supabase', () => ({
  default: {
    from: vi.fn(() => ({
      insert: vi.fn(() => ({
        maybeSingle: vi.fn(),
      })),
      delete: vi.fn(() => ({
        eq: vi.fn(() => ({
          eq: vi.fn(),
        })),
      })),
    })),
  },
}));

describe('api - followUser', () => {
  it('throws on non-duplicate error', async () => {
    const mockInsert = vi.fn(() => ({ error: { message: 'Some error' } }));
    (supabase.from as any).mockReturnValue({ insert: mockInsert });

    await expect(followUser('uid1', 'uid2')).rejects.toThrow('Some error');
  });

  it('ignores duplicate key errors', async () => {
    const mockInsert = vi.fn(() => ({ error: { code: '23505', message: 'duplicate key' } }));
    (supabase.from as any).mockReturnValue({ insert: mockInsert });

    await expect(followUser('uid1', 'uid2')).resolves.toBeUndefined();
  });

  it('succeeds with no error', async () => {
    const mockInsert = vi.fn(() => ({ error: null }));
    (supabase.from as any).mockReturnValue({ insert: mockInsert });

    await expect(followUser('uid1', 'uid2')).resolves.toBeUndefined();
  });
});

describe('api - likeSubmission', () => {
  it('ignores duplicate key errors', async () => {
    const mockInsert = vi.fn(() => ({ error: { code: '23505', message: 'duplicate' } }));
    (supabase.from as any).mockReturnValue({ insert: mockInsert });

    await expect(likeSubmission(1, 'uid')).resolves.toBeUndefined();
  });
});

describe('api - unlikeSubmission', () => {
  it('throws on error', async () => {
    const mockDelete = vi.fn(() => ({
      eq: vi.fn(() => ({
        eq: vi.fn(() => ({ error: { message: 'Delete failed' } })),
      })),
    }));
    (supabase.from as any).mockReturnValue({ delete: mockDelete });

    await expect(unlikeSubmission(1, 'uid')).rejects.toThrow('Delete failed');
  });
});
