-- Run this in Supabase SQL Editor. Create an Auth user for the admin and set ADMIN_EMAILS in .env.
create extension if not exists pgcrypto;

create table if not exists public.site_settings (
  id integer primary key default 1 check (id = 1),
  artist_name text not null default 'RED HOOD',
  bio text not null default 'Independent artist. South Tehran DNA.',
  profile_image text,
  logo_image text,
  spotify_url text,
  soundcloud_url text,
  instagram_url text,
  youtube_url text,
  featured_release_id uuid,
  updated_at timestamptz not null default now()
);

-- Optional background image saved from the admin panel. It remains a draft until
-- a later frontend rollout explicitly applies it to the public website.
alter table public.site_settings
  add column if not exists background_image_url text;

insert into public.site_settings (id) values (1) on conflict (id) do nothing;

create table if not exists public.releases (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  release_type text not null default 'Single' check (release_type in ('Single','EP','Album')),
  release_date timestamptz not null,
  timezone text not null default 'UTC',
  description text,
  cover_url text,
  spotify_url text,
  soundcloud_url text,
  youtube_url text,
  status text not null default 'upcoming' check (status in ('upcoming','released')),
  countdown_enabled boolean not null default true,
  coming_soon_label text default 'COMING SOON',
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.pages (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  content text not null default '',
  hero_image text,
  layout text not null default 'standard' check (layout in ('standard','wide','centered')),
  published boolean not null default false,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.app_admins (email text primary key);
-- Add your exact Supabase Auth email after creating the admin user:
-- insert into public.app_admins(email) values ('you@example.com') on conflict do nothing;
alter table public.app_admins enable row level security;
revoke all on table public.app_admins from anon, authenticated;
create or replace function public.is_site_admin() returns boolean language sql stable security definer set search_path=public as $$
  select exists (select 1 from public.app_admins where lower(email)=lower(auth.jwt()->>'email'))
$$;

alter table public.site_settings enable row level security;
alter table public.releases enable row level security;
alter table public.pages enable row level security;

drop policy if exists "Public can read settings" on public.site_settings;
create policy "Public can read settings" on public.site_settings for select using (true);
drop policy if exists "Admins manage settings" on public.site_settings;
create policy "Admins manage settings" on public.site_settings for all to authenticated using (public.is_site_admin()) with check (public.is_site_admin());
-- Public content reads
drop policy if exists "Public can read released or upcoming music" on public.releases;
create policy "Public can read released or upcoming music" on public.releases for select using (true);
drop policy if exists "Public can read published pages" on public.pages;
create policy "Public can read published pages" on public.pages for select using (published = true);
drop policy if exists "Admins manage releases" on public.releases;
create policy "Admins manage releases" on public.releases for all to authenticated using (public.is_site_admin()) with check (public.is_site_admin());
drop policy if exists "Admins manage pages" on public.pages;
create policy "Admins manage pages" on public.pages for all to authenticated using (public.is_site_admin()) with check (public.is_site_admin());

-- Media bucket (public reads, authenticated uploads; application upload route enforces admin allowlist)
insert into storage.buckets (id,name,public,file_size_limit,allowed_mime_types)
values ('artist-media','artist-media',true,8388608,array['image/jpeg','image/png','image/webp','image/avif'])
on conflict (id) do update set public=true, file_size_limit=8388608;
drop policy if exists "Public can view artist media" on storage.objects;
create policy "Public can view artist media" on storage.objects for select using (bucket_id='artist-media');
drop policy if exists "Authenticated can upload artist media" on storage.objects;
create policy "Authenticated can upload artist media" on storage.objects for insert to authenticated with check (bucket_id='artist-media' and public.is_site_admin());
drop policy if exists "Authenticated can update artist media" on storage.objects;
create policy "Authenticated can update artist media" on storage.objects for update to authenticated using (bucket_id='artist-media' and public.is_site_admin()) with check (bucket_id='artist-media' and public.is_site_admin());
drop policy if exists "Authenticated can delete artist media" on storage.objects;
create policy "Authenticated can delete artist media" on storage.objects for delete to authenticated using (bucket_id='artist-media' and public.is_site_admin());

-- Persist due releases whenever the public site fetches the catalog.
-- SECURITY DEFINER is intentionally narrow: it can only flip due upcoming releases to released.
create or replace function public.publish_due_releases() returns void
language sql security definer set search_path=public as $$
  update public.releases set status='released', updated_at=now()
  where status='upcoming' and release_date <= now();
$$;
grant execute on function public.publish_due_releases() to anon, authenticated;

-- Automatic release transition. Enable pg_cron in Supabase Database > Extensions first.
-- Safe to run once; if the job already exists, unschedule it before rerunning.
-- select cron.schedule('red-hood-release-publish','* * * * *', $$update public.releases set status='released', updated_at=now() where status='upcoming' and release_date <= now();$$);
