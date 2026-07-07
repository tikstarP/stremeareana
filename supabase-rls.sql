-- Run this in Supabase SQL Editor after migration
-- Safe to run multiple times (drops existing policies first)

-- Enable Row Level Security on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE art_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE queue_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE leaderboard_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE overlay_events ENABLE ROW LEVEL SECURITY;

-- PROFILES
DROP POLICY IF EXISTS "Anyone can view profiles" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
CREATE POLICY "Anyone can view profiles" ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- ROOMS
DROP POLICY IF EXISTS "Anyone can view rooms" ON rooms;
DROP POLICY IF EXISTS "Authenticated users can create rooms" ON rooms;
DROP POLICY IF EXISTS "Host can update own room" ON rooms;
CREATE POLICY "Anyone can view rooms" ON rooms FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create rooms" ON rooms FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Host can update own room" ON rooms FOR UPDATE USING (auth.uid() = host_id);

-- CHAT MESSAGES
DROP POLICY IF EXISTS "Anyone can view chat" ON chat_messages;
DROP POLICY IF EXISTS "Authenticated users can send chat" ON chat_messages;
CREATE POLICY "Anyone can view chat" ON chat_messages FOR SELECT USING (true);
CREATE POLICY "Authenticated users can send chat" ON chat_messages FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- ART SUBMISSIONS
DROP POLICY IF EXISTS "Anyone can view art" ON art_submissions;
DROP POLICY IF EXISTS "Authenticated users can submit art" ON art_submissions;
DROP POLICY IF EXISTS "Host can update art in their room" ON art_submissions;
DROP POLICY IF EXISTS "Host can delete art in their room" ON art_submissions;
CREATE POLICY "Anyone can view art" ON art_submissions FOR SELECT USING (true);
CREATE POLICY "Authenticated users can submit art" ON art_submissions FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Host can update art in their room" ON art_submissions FOR UPDATE USING (
  EXISTS (SELECT 1 FROM rooms WHERE rooms.id = art_submissions.room_id AND rooms.host_id = auth.uid())
);
CREATE POLICY "Host can delete art in their room" ON art_submissions FOR DELETE USING (
  EXISTS (SELECT 1 FROM rooms WHERE rooms.id = art_submissions.room_id AND rooms.host_id = auth.uid())
);

-- QUEUE ENTRIES
DROP POLICY IF EXISTS "Anyone can view queue" ON queue_entries;
DROP POLICY IF EXISTS "Authenticated users can join queue" ON queue_entries;
DROP POLICY IF EXISTS "Users can remove own queue entry" ON queue_entries;
CREATE POLICY "Anyone can view queue" ON queue_entries FOR SELECT USING (true);
CREATE POLICY "Authenticated users can join queue" ON queue_entries FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Users can remove own queue entry" ON queue_entries FOR DELETE USING (auth.uid() = user_id);

-- GAME SCORES
DROP POLICY IF EXISTS "Anyone can view scores" ON game_scores;
DROP POLICY IF EXISTS "Authenticated users can submit scores" ON game_scores;
CREATE POLICY "Anyone can view scores" ON game_scores FOR SELECT USING (true);
CREATE POLICY "Authenticated users can submit scores" ON game_scores FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- LEADERBOARD
DROP POLICY IF EXISTS "Anyone can view leaderboard" ON leaderboard_entries;
DROP POLICY IF EXISTS "Users can insert leaderboard entry" ON leaderboard_entries;
DROP POLICY IF EXISTS "Users can update own leaderboard entry" ON leaderboard_entries;
CREATE POLICY "Anyone can view leaderboard" ON leaderboard_entries FOR SELECT USING (true);
CREATE POLICY "Users can insert leaderboard entry" ON leaderboard_entries FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Users can update own leaderboard entry" ON leaderboard_entries FOR UPDATE USING (auth.uid() = user_id);

-- OVERLAY EVENTS
DROP POLICY IF EXISTS "Anyone can view overlay events" ON overlay_events;
DROP POLICY IF EXISTS "Authenticated users can create overlay events" ON overlay_events;
CREATE POLICY "Anyone can view overlay events" ON overlay_events FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create overlay events" ON overlay_events FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- STORAGE (art-uploads bucket)
DROP POLICY IF EXISTS "Anyone can view art uploads" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload art" ON storage.objects;
CREATE POLICY "Anyone can view art uploads" ON storage.objects FOR SELECT USING (bucket_id = 'art-uploads');
CREATE POLICY "Authenticated users can upload art" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'art-uploads' AND auth.role() = 'authenticated');
