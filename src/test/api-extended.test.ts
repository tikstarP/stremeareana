import { describe, it, expect, vi } from 'vitest';
import supabase from '../lib/supabase';
import { createArtSubmission, uploadFile, likeRoom, unlikeRoom, submitScore } from '../lib/api';

vi.mock('../lib/supabase', () => ({
  default: {
    from: vi.fn(),
    rpc: vi.fn(),
    storage: {
      from: vi.fn(() => ({
        upload: vi.fn(() => ({ error: null })),
        getPublicUrl: vi.fn(() => ({ data: { publicUrl: 'https://example.com/file.png' } })),
      })),
    },
  },
}));

describe('api - createArtSubmission', () => {
  const baseSub = {
    room_id: 1, user_id: 'uid', username: 'test',
  };

  it('rejects message over 500 chars', async () => {
    await expect(createArtSubmission({ ...baseSub, message: 'x'.repeat(501) }))
      .rejects.toThrow('Message too long');
  });

  it('rejects emoji over 20 chars', async () => {
    await expect(createArtSubmission({ ...baseSub, emoji: 'x'.repeat(21) }))
      .rejects.toThrow('Emoji too long');
  });

  it('rejects image URL over 2048 chars', async () => {
    await expect(createArtSubmission({ ...baseSub, image_url: 'x'.repeat(2049) }))
      .rejects.toThrow('Image URL too long');
  });

  it('calls insert with valid data', async () => {
    const mockSelect = vi.fn(() => ({ single: vi.fn(() => ({ data: { id: 1, status: 'pending' }, error: null })) }));
    const mockInsert = vi.fn(() => ({ select: mockSelect }));
    (supabase.from as any).mockReturnValue({ insert: mockInsert });

    const result = await createArtSubmission({ ...baseSub, message: 'hello' });
    expect(result.id).toBe(1);
    expect(mockInsert).toHaveBeenCalledWith(expect.objectContaining({ message: 'hello', status: 'pending' }));
  });
});

describe('api - uploadFile', () => {
  it('rejects files over 5MB', async () => {
    const large = 'A'.repeat(6 * 1024 * 1024);
    await expect(uploadFile('test.png', btoa(large)))
      .rejects.toThrow('File too large');
  });

  it('returns public URL on success', async () => {
    const small = 'hello';
    const result = await uploadFile('test.png', btoa(small));
    expect(result).toBe('https://example.com/file.png');
  });
});

describe('api - likeRoom / unlikeRoom', () => {
  it('likeRoom calls increment_room_likes RPC', async () => {
    (supabase.rpc as any).mockResolvedValue({ data: 5, error: null });
    const result = await likeRoom(1, 'uid');
    expect(result).toBe(5);
    expect(supabase.rpc).toHaveBeenCalledWith('increment_room_likes', { room_id: 1, user_id: 'uid' });
  });

  it('unlikeRoom calls decrement_room_likes RPC', async () => {
    (supabase.rpc as any).mockResolvedValue({ data: 3, error: null });
    const result = await unlikeRoom(1, 'uid');
    expect(result).toBe(3);
    expect(supabase.rpc).toHaveBeenCalledWith('decrement_room_likes', { room_id: 1, user_id: 'uid' });
  });

  it('throws on RPC error', async () => {
    (supabase.rpc as any).mockResolvedValue({ data: null, error: { message: 'RPC failed' } });
    await expect(likeRoom(1, 'uid')).rejects.toThrow('RPC failed');
  });
});

describe('api - submitScore', () => {
  it('calls submit_score RPC with correct params', async () => {
    (supabase.rpc as any).mockResolvedValue({ data: null, error: null });
    await submitScore({ room_id: 1, user_id: 'uid', game_type: 'trivia', score: 100 });
    expect(supabase.rpc).toHaveBeenCalledWith('submit_score', {
      p_room_id: 1, p_user_id: 'uid', p_username: 'Anonymous', p_game_type: 'trivia', p_score: 100,
    });
  });

  it('throws on error', async () => {
    (supabase.rpc as any).mockResolvedValue({ data: null, error: { message: 'Score failed' } });
    await expect(submitScore({ room_id: 1, user_id: 'uid', game_type: 'trivia', score: 0 }))
      .rejects.toThrow('Score failed');
  });
});
