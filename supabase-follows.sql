-- Run this in Supabase SQL Editor
-- Safe to run multiple times

create table if not exists public.follows (
  follower_id uuid not null references public.profiles(id) on delete cascade,
  following_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (follower_id, following_id)
);

alter table public.follows enable row level security;

drop policy if exists "Anyone can view follows" on follows;
drop policy if exists "Users can follow" on follows;
drop policy if exists "Users can unfollow" on follows;

create policy "Anyone can view follows" on follows for select using (true);
create policy "Users can follow" on follows for insert with check (auth.uid() = follower_id);
create policy "Users can unfollow" on follows for delete using (auth.uid() = follower_id);

alter publication supabase_realtime add table public.follows;
