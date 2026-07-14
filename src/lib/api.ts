import supabase from './supabase';
import type { Profile, RoomData, ChatMessage, ArtSubmission, LeaderboardEntry, QueueEntry, OverlayEvent } from '../types';

export async function getProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).maybeSingle();
  if (error) throw error;
  return data;
}

export async function getProfiles(): Promise<Profile[]> {
  const { data, error } = await supabase.from('profiles').select('*').order('created_at', { ascending: false }).limit(50);
  if (error) throw error;
  return data || [];
}

export async function upsertProfile(userId: string, email?: string): Promise<Profile> {
  const existing = await getProfile(userId);
  if (existing) return existing;
  const username = email ? email.split('@')[0] : 'User_' + userId.substring(0, 6);
  const avatar_url = `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(username)}`;
  const { data, error } = await supabase.from('profiles').insert({
    id: userId, username, avatar_url, coins: 50, points: 0, streak: 0,
  }).select().single();
  if (error) throw error;
  return data;
}

export async function updateProfile(userId: string, updates: { username?: string; avatar_url?: string }): Promise<Profile> {
  const { data, error } = await supabase.from('profiles').update(updates).eq('id', userId).select().single();
  if (error) throw error;
  return data;
}

export async function getRoomByCode(code: string): Promise<RoomData | null> {
  const { data, error } = await supabase.from('rooms').select('*').eq('code', code.toUpperCase()).maybeSingle();
  if (error) throw error;
  return data;
}

export async function getLiveRooms(): Promise<RoomData[]> {
  const { data, error } = await supabase.from('rooms').select('*').eq('is_live', true).order('created_at', { ascending: false }).limit(20);
  if (error) throw error;
  return data || [];
}

export async function createRoom(name: string, description: string, userId: string, code?: string): Promise<RoomData> {
  if (!code) code = generateRoomCode();
  const { data: profile } = await supabase.from('profiles').select('username, avatar_url').eq('id', userId).maybeSingle();
  const { data, error } = await supabase.from('rooms').insert({
    code, name: name || 'Untitled Room', description: description || '',
    host_id: userId,
    host_name: profile?.username || 'Streamer',
    host_avatar: profile?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${userId}`,
    is_live: true, viewer_count: 0,
  }).select().single();
  if (error) throw error;
  return data;
}

export async function updateRoom(id: number, updates: Partial<RoomData>): Promise<RoomData> {
  const { data, error } = await supabase.from('rooms').update(updates).eq('id', id).select().single();
  if (error) throw error;
  return data;
}

export async function getChatMessages(roomId: number, limit = 100): Promise<ChatMessage[]> {
  const { data, error } = await supabase
    .from('chat_messages').select('*').eq('room_id', roomId)
    .order('created_at', { ascending: true }).limit(limit);
  if (error) throw error;
  return data || [];
}

export async function sendChatMessage(msg: {
  room_id: number; user_id: string | null; username?: string; message: string;
  amount?: number; color?: string; is_super?: boolean;
}): Promise<ChatMessage> {
  const uid = msg.user_id && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(msg.user_id) ? msg.user_id : null;
  const { data, error } = await supabase.from('chat_messages').insert({
    room_id: msg.room_id, user_id: uid, username: msg.username || 'Anonymous',
    message: msg.message, amount: msg.amount || 0,
    color: msg.color || '#FF5A1F', is_super: msg.is_super || false,
  }).select().single();
  if (error) throw error;

  if (msg.is_super && msg.amount && uid) {
    const { error: coinError } = await supabase.rpc('deduct_coins', { user_id: uid, amount: msg.amount });
    if (coinError) throw coinError;
  }

  return data;
}

export async function getArtSubmissions(roomId: number): Promise<ArtSubmission[]> {
  const { data, error } = await supabase
    .from('art_submissions').select('*').eq('room_id', roomId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function createArtSubmission(sub: {
  room_id: number; user_id: string; username: string; avatar_url?: string;
  content_type?: string; message?: string; image_url?: string; emoji?: string;
}): Promise<ArtSubmission> {
  if (sub.message && sub.message.length > 500) throw new Error('Message too long (max 500 chars)');
  if (sub.emoji && sub.emoji.length > 20) throw new Error('Emoji too long');
  if (sub.image_url && sub.image_url.length > 2048) throw new Error('Image URL too long');
  const { data, error } = await supabase.from('art_submissions').insert({
    room_id: sub.room_id, user_id: sub.user_id, username: sub.username,
    avatar_url: sub.avatar_url || null, content_type: sub.content_type || 'text',
    message: sub.message || null, image_url: sub.image_url || null,
    emoji: sub.emoji || null, status: 'pending',
  }).select().single();
  if (error) throw error;
  return data;
}

export async function updateArtSubmission(id: number, updates: { status?: string; rating?: number }): Promise<ArtSubmission> {
  const { data, error } = await supabase.from('art_submissions').update(updates).eq('id', id).select().single();
  if (error) throw error;
  return data;
}

export async function deleteArtSubmission(id: number): Promise<void> {
  const { error } = await supabase.from('art_submissions').delete().eq('id', id);
  if (error) throw error;
}

export async function likeSubmission(submissionId: number, userId: string): Promise<void> {
  const { error } = await supabase.from('submission_likes').insert({ submission_id: submissionId, user_id: userId });
  if (error && !error.message?.includes('duplicate')) throw error;
}

export async function unlikeSubmission(submissionId: number, userId: string): Promise<void> {
  const { error } = await supabase.from('submission_likes').delete().eq('submission_id', submissionId).eq('user_id', userId);
  if (error) throw error;
}

export async function getLikeCount(submissionId: number): Promise<number> {
  const { count } = await supabase.from('submission_likes').select('*', { count: 'exact', head: true }).eq('submission_id', submissionId);
  return count || 0;
}

export async function getUserLikedSubmissions(userId: string, submissionIds: number[]): Promise<number[]> {
  if (submissionIds.length === 0) return [];
  const { data } = await supabase.from('submission_likes').select('submission_id').eq('user_id', userId).in('submission_id', submissionIds);
  return (data || []).map(d => d.submission_id);
}

export async function getQueueEntries(roomId: number): Promise<QueueEntry[]> {
  const { data, error } = await supabase
    .from('queue_entries').select('*').eq('room_id', roomId)
    .order('position', { ascending: true });
  if (error) throw error;
  return data || [];
}

export async function joinQueue(entry: {
  room_id: number; user_id: string; username?: string; avatar_url: string; type?: string;
}): Promise<QueueEntry> {
  const { count } = await supabase
    .from('queue_entries').select('*', { count: 'exact', head: true }).eq('room_id', entry.room_id);
  const position = (count || 0) + 1;
  const { data, error } = await supabase.from('queue_entries').insert({
    room_id: entry.room_id, user_id: entry.user_id, username: entry.username || 'Anonymous',
    avatar_url: entry.avatar_url, type: entry.type || 'free', position,
  }).select().single();
  if (error) throw error;
  return data;
}

export async function leaveQueue(id: number): Promise<void> {
  const { error } = await supabase.from('queue_entries').delete().eq('id', id);
  if (error) throw error;
}

export async function submitScore(score: {
  room_id: number; user_id: string; username?: string; game_type: string; score: number;
}): Promise<void> {
  const { error } = await supabase.rpc('submit_score', {
    p_room_id: score.room_id, p_user_id: score.user_id,
    p_username: score.username || 'Anonymous',
    p_game_type: score.game_type, p_score: score.score || 0,
  });
  if (error) throw error;
}

export async function getLeaderboard(period = 'all'): Promise<LeaderboardEntry[]> {
  const { data, error } = await supabase
    .from('leaderboard_entries').select('*').eq('period', period)
    .order('total_points', { ascending: false }).limit(50);
  if (error) throw error;
  return (data || []).map((entry, i) => ({ ...entry, rank: i + 1 }));
}

export async function followUser(followerId: string, followingId: string): Promise<void> {
  const { error } = await supabase.from('follows').insert({ follower_id: followerId, following_id: followingId });
  if (error && !error.message?.includes('duplicate')) throw error;
}

export async function unfollowUser(followerId: string, followingId: string): Promise<void> {
  await supabase.from('follows').delete().eq('follower_id', followerId).eq('following_id', followingId);
}

export async function checkFollowStatus(followerId: string, followingId: string): Promise<boolean> {
  const { data } = await supabase.from('follows').select('follower_id').eq('follower_id', followerId).eq('following_id', followingId).maybeSingle();
  return !!data;
}

export async function likeRoom(roomId: number, userId: string): Promise<number> {
  const { data, error } = await supabase.rpc('increment_room_likes', { room_id: roomId, user_id: userId });
  if (error) throw error;
  return data as number;
}

export async function unlikeRoom(roomId: number, userId: string): Promise<number> {
  const { data, error } = await supabase.rpc('decrement_room_likes', { room_id: roomId, user_id: userId });
  if (error) throw error;
  return data as number;
}

export async function checkRoomLiked(roomId: number, userId: string): Promise<boolean> {
  const { data } = await supabase.from('room_likes').select('user_id').eq('room_id', roomId).eq('user_id', userId).maybeSingle();
  return !!data;
}

export async function getOverlayEvents(roomId: number, since?: string): Promise<OverlayEvent[]> {
  let query = supabase.from('overlay_events').select('*').order('created_at', { ascending: false }).limit(50);
  query = query.eq('room_id', roomId);
  if (since) query = query.gt('created_at', since);
  const { data, error } = await query;
  if (error) throw error;
  return (data || []).reverse();
}

export async function createOverlayEvent(event: {
  room_id: number; event_type: string; event_data?: Record<string, unknown>;
}): Promise<OverlayEvent> {
  const { data, error } = await supabase.from('overlay_events').insert({
    room_id: event.room_id, event_type: event.event_type, event_data: event.event_data || {},
  }).select().single();
  if (error) throw error;
  return data;
}

export async function uploadFile(fileName: string, fileBase64: string, contentType?: string): Promise<string> {
  const decoded = atob(fileBase64);
  if (decoded.length > 5 * 1024 * 1024) throw new Error('File too large (max 5MB)');
  const buffer = Uint8Array.from(decoded, c => c.charCodeAt(0));
  const { error } = await supabase.storage.from('art-uploads').upload(fileName, buffer, { contentType, upsert: true });
  if (error) throw error;
  const { data: urlData } = supabase.storage.from('art-uploads').getPublicUrl(fileName);
  return urlData.publicUrl;
}

function generateRoomCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return code;
}
