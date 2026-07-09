-- Run in Supabase SQL Editor
alter table public.rooms add column if not exists likes integer not null default 0;

-- Track who liked (prevent double-likes)
create table if not exists public.room_likes (
  room_id bigint not null references public.rooms(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (room_id, user_id)
);

alter table public.room_likes enable row level security;

drop policy if exists "Anyone can view room_likes" on room_likes;
drop policy if exists "Users can like rooms" on room_likes;
drop policy if exists "Users can unlike rooms" on room_likes;

create policy "Anyone can view room_likes" on room_likes for select using (true);
create policy "Users can like rooms" on room_likes for insert with check (auth.uid() = user_id);
create policy "Users can unlike rooms" on room_likes for delete using (auth.uid() = user_id);
