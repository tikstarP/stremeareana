-- Add video_id column to rooms table
-- Run this in Supabase SQL Editor

ALTER TABLE public.rooms ADD COLUMN IF NOT EXISTS video_id text DEFAULT '';
