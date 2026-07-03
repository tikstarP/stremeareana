-- Enable Realtime for tables used by the viewer and streamer features
-- Run this in Supabase SQL Editor (Dashboard > SQL Editor)

ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.queue_entries;
ALTER PUBLICATION supabase_realtime ADD TABLE public.art_submissions;
