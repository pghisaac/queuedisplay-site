-- Run this once in Supabase: Dashboard > SQL Editor > New query > paste > Run.

-- 1. Content table ---------------------------------------------------------
create table if not exists public.media (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  kind        text not null check (kind in ('image', 'video')),
  path        text not null,                 -- file path inside the 'media' bucket
  duration_s  integer not null default 10 check (duration_s between 1 and 3600),
  sort        integer not null default 0,    -- play order, lowest first
  enabled     boolean not null default true,
  -- Schedule (all optional; empty = always). Evaluated in the timezone set in config.js
  start_date  date,                          -- first day to play
  end_date    date,                          -- last day to play (inclusive)
  start_time  time,                          -- earliest time of day
  end_time    time,                          -- latest time of day (may be earlier than start_time to cross midnight)
  days        smallint[],                    -- 0=Sun ... 6=Sat; empty/null = every day
  created_at  timestamptz not null default now()
);

alter table public.media enable row level security;

-- Anyone (the TV) may read; only a signed-in admin may change.
drop policy if exists "media read"   on public.media;
drop policy if exists "media insert" on public.media;
drop policy if exists "media update" on public.media;
drop policy if exists "media delete" on public.media;

create policy "media read"   on public.media for select using (true);
create policy "media insert" on public.media for insert to authenticated with check (true);
create policy "media update" on public.media for update to authenticated using (true) with check (true);
create policy "media delete" on public.media for delete to authenticated using (true);

-- 2. Storage bucket for the files ------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('media', 'media', true, 52428800,
        array['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'video/mp4', 'video/webm'])
on conflict (id) do update
  set public = true,
      file_size_limit = 52428800,
      allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "media files insert" on storage.objects;
drop policy if exists "media files update" on storage.objects;
drop policy if exists "media files delete" on storage.objects;

create policy "media files insert" on storage.objects for insert to authenticated
  with check (bucket_id = 'media');
create policy "media files update" on storage.objects for update to authenticated
  using (bucket_id = 'media');
create policy "media files delete" on storage.objects for delete to authenticated
  using (bucket_id = 'media');
