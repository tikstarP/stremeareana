export interface Profile {
  id: string;
  username: string;
  avatar_url: string;
  coins: number;
  points: number;
  streak: number;
  created_at: string;
}

export interface RoomData {
  id: number | null;
  code: string;
  name: string;
  description?: string;
  host_id: string;
  host_name: string;
  host_avatar: string;
  is_live: boolean;
  viewer_count: number;
  video_id?: string;
  status?: string;
  host_verified?: boolean;
  subscriber_count?: number;
  stream_started_at?: string;
  stream_title?: string;
  queue_count?: number;
  created_at?: string;
}

export interface ChatMessage {
  id: number;
  room_id?: number;
  user_id?: string;
  username: string;
  message: string;
  amount?: number;
  color: string;
  is_super: boolean;
  type?: string;
  created_at: string;
}

export interface OverlayEvent {
  id: number;
  room_id: number;
  event_type: string;
  event_data: Record<string, unknown>;
  created_at: string;
}

export interface ArtSubmission {
  id: number;
  room_id: number;
  user_id: string;
  username: string;
  avatar_url: string;
  status: string;
  type?: string;
  content_type?: string;
  message?: string;
  image_url?: string;
  emoji?: string;
  likes?: number;
  created_at?: string;
}

export interface LeaderboardEntry {
  id: string;
  rank: number;
  username: string;
  avatar_url: string;
  total_points: number;
  streak: number;
}

export interface QueueEntry {
  id: number;
  room_id: number;
  user_id: string;
  username: string;
  avatar_url: string;
  status: string;
  priority: boolean;
  type?: string;
  joined_at?: string;
  created_at: string;
}
