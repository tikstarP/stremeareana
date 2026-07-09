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
  room_id: number; user_id: string; username?: string; message: string;
  amount?: number; color?: string; is_super?: boolean;
}): Promise<ChatMessage> {
  const { data, error } = await supabase.from('chat_messages').insert({
    room_id: msg.room_id, user_id: msg.user_id, username: msg.username || 'Anonymous',
    message: msg.message, amount: msg.amount || 0,
    color: msg.color || '#FF5A1F', is_super: msg.is_super || false,
  }).select().single();
  if (error) throw error;

  if (msg.is_super && msg.amount && msg.user_id) {
    const { data: profile } = await supabase.from('profiles').select('*').eq('id', msg.user_id).maybeSingle();
    if (profile && profile.coins >= msg.amount) {
      await supabase.from('profiles').update({ coins: profile.coins - msg.amount }).eq('id', msg.user_id);
    }
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
  room_id: number; user_id: string; username: string; avatar_url: string; image_url: string;
}): Promise<ArtSubmission> {
  const { data, error } = await supabase.from('art_submissions').insert({
    ...sub, status: 'pending',
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
  const username = score.username || 'Anonymous';
  const { error } = await supabase.from('game_scores').insert({
    room_id: score.room_id, user_id: score.user_id, username,
    game_type: score.game_type, score: score.score || 0,
  }).select().single();
  if (error) throw error;

  const { data: existing } = await supabase.from('leaderboard_entries')
    .select('*').eq('user_id', score.user_id).eq('period', 'all').maybeSingle();
  const won = score.score >= 100 ? 1 : 0;
  if (existing) {
    await supabase.from('leaderboard_entries').update({
      total_points: existing.total_points + score.score,
      games_won: existing.games_won + won,
      streak: won ? existing.streak + 1 : 0,
      username,
    }).eq('id', existing.id);
  } else {
    await supabase.from('leaderboard_entries').insert({
      user_id: score.user_id, username, total_points: score.score,
      games_won: won, streak: won ? 1 : 0, period: 'all',
      avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(username)}`,
    });
  }

  const { data: profile } = await supabase.from('profiles').select('*').eq('id', score.user_id).maybeSingle();
  if (profile) {
    await supabase.from('profiles').update({ points: profile.points + score.score }).eq('id', score.user_id);
  }
}

export async function getLeaderboard(period = 'all'): Promise<LeaderboardEntry[]> {
  const { data, error } = await supabase
    .from('leaderboard_entries').select('*').eq('period', period)
    .order('total_points', { ascending: false }).limit(50);
  if (error) throw error;
  return (data || []).map((entry, i) => ({ ...entry, rank: i + 1 }));
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
  const buffer = Uint8Array.from(atob(fileBase64), c => c.charCodeAt(0));
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
