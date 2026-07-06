-- Run this in Supabase SQL Editor after migration

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
CREATE POLICY "Anyone can view profiles" ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- ROOMS
CREATE POLICY "Anyone can view rooms" ON rooms FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create rooms" ON rooms FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Host can update own room" ON rooms FOR UPDATE USING (auth.uid() = host_id);

-- CHAT MESSAGES
CREATE POLICY "Anyone can view chat" ON chat_messages FOR SELECT USING (true);
CREATE POLICY "Authenticated users can send chat" ON chat_messages FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- ART SUBMISSIONS
CREATE POLICY "Anyone can view art" ON art_submissions FOR SELECT USING (true);
CREATE POLICY "Authenticated users can submit art" ON art_submissions FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Host can update art in their room" ON art_submissions FOR UPDATE USING (
  EXISTS (SELECT 1 FROM rooms WHERE rooms.id = art_submissions.room_id AND rooms.host_id = auth.uid())
);
CREATE POLICY "Host can delete art in their room" ON art_submissions FOR DELETE USING (
  EXISTS (SELECT 1 FROM rooms WHERE rooms.id = art_submissions.room_id AND rooms.host_id = auth.uid())
);

-- QUEUE ENTRIES
CREATE POLICY "Anyone can view queue" ON queue_entries FOR SELECT USING (true);
CREATE POLICY "Authenticated users can join queue" ON queue_entries FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Users can remove own queue entry" ON queue_entries FOR DELETE USING (auth.uid() = user_id);

-- GAME SCORES
CREATE POLICY "Anyone can view scores" ON game_scores FOR SELECT USING (true);
CREATE POLICY "Authenticated users can submit scores" ON game_scores FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- LEADERBOARD
CREATE POLICY "Anyone can view leaderboard" ON leaderboard_entries FOR SELECT USING (true);
CREATE POLICY "Users can update own leaderboard entry" ON leaderboard_entries FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Users can update own leaderboard entry" ON leaderboard_entries FOR UPDATE USING (auth.uid() = user_id);

-- OVERLAY EVENTS
CREATE POLICY "Anyone can view overlay events" ON overlay_events FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create overlay events" ON overlay_events FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- STORAGE (art-uploads bucket)
CREATE POLICY "Anyone can view art uploads" ON storage.objects FOR SELECT USING (bucket_id = 'art-uploads');
CREATE POLICY "Authenticated users can upload art" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'art-uploads' AND auth.role() = 'authenticated');
