-- Add status column to rooms table
-- Run this in Supabase SQL Editor

ALTER TABLE public.rooms ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'queue_open';
