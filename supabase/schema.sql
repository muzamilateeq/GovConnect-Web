-- GovConnect listings data model.
-- Run this in the Supabase SQL Editor, then add the table to Realtime if the
-- publication statement is not allowed by your project permissions.

create extension if not exists pgcrypto;

do $$ begin
  create type public.listing_category as enum (
    'Latest Jobs',
    'New Schemes',
    'Recent Results'
  );
exception
  when duplicate_object then null;
end $$;

create table if not exists public.listings (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  organization text not null,
  organization_logo_url text,
  salary_min integer not null default 0 check (salary_min >= 0),
  salary_max integer not null default 0 check (salary_max >= salary_min),
  bps_min integer not null default 1 check (bps_min between 1 and 22),
  bps_max integer not null default 22 check (bps_max between bps_min and 22),
  city text not null,
  province text not null,
  category public.listing_category not null,
  apply_deadline date not null,
  summary text not null,
  description text not null,
  apply_url text not null default '#',
  official_url text,
  source_key text,
  source_name text,
  source_url text,
  source_image_url text,
  ad_image_url text,
  pdf_url text,
  raw_hash text,
  update_type text,
  last_scraped_at timestamptz,
  click_count integer not null default 0,
  is_published boolean not null default false,
  search_vector tsvector generated always as (
    setweight(to_tsvector('english', coalesce(title, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(organization, '')), 'B') ||
    setweight(to_tsvector('english', coalesce(city, '')), 'C') ||
    setweight(to_tsvector('english', coalesce(province, '')), 'C') ||
    setweight(to_tsvector('english', coalesce(summary, '')), 'D') ||
    setweight(to_tsvector('english', coalesce(description, '')), 'D')
  ) stored,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.listings
  add column if not exists official_url text,
  add column if not exists source_key text,
  add column if not exists source_name text,
  add column if not exists source_url text,
  add column if not exists source_image_url text,
  add column if not exists ad_image_url text,
  add column if not exists pdf_url text,
  add column if not exists raw_hash text,
  add column if not exists update_type text,
  add column if not exists last_scraped_at timestamptz,
  add column if not exists click_count integer not null default 0;

create index if not exists listings_search_idx
  on public.listings using gin (search_vector);

create index if not exists listings_filter_idx
  on public.listings (
    is_published,
    category,
    province,
    apply_deadline,
    salary_min,
    salary_max,
    bps_min,
    bps_max
  );

create unique index if not exists listings_official_url_unique_idx
  on public.listings (official_url)
  where official_url is not null;

create index if not exists listings_source_idx
  on public.listings (source_key, last_scraped_at desc);

create table if not exists public.scraper_logs (
  id uuid primary key default gen_random_uuid(),
  source_key text not null,
  source_name text not null,
  status text not null check (status in ('success', 'error')),
  scanned_at timestamptz not null default now(),
  found_count integer not null default 0,
  inserted_count integer not null default 0,
  updated_count integer not null default 0,
  error_message text,
  message text not null,
  duration_ms integer not null default 0
);

create index if not exists scraper_logs_scanned_at_idx
  on public.scraper_logs (scanned_at desc);

alter table public.scraper_logs enable row level security;

drop policy if exists "Authenticated admins can read scraper logs" on public.scraper_logs;

create policy "Authenticated admins can read scraper logs"
on public.scraper_logs
for select
to authenticated
using (true);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists listings_set_updated_at on public.listings;

create trigger listings_set_updated_at
before update on public.listings
for each row
execute function public.set_updated_at();

alter table public.listings enable row level security;

drop policy if exists "Public can read published listings" on public.listings;

create policy "Public can read published listings"
on public.listings
for select
to anon, authenticated
using (is_published = true);

alter table public.listings replica identity full;

do $$ begin
  alter publication supabase_realtime add table public.listings;
exception
  when duplicate_object then null;
  when undefined_object then null;
  when insufficient_privilege then null;
end $$;

insert into storage.buckets (id, name, public)
values ('listing-ads', 'listing-ads', true)
on conflict (id) do update set public = excluded.public;

insert into public.listings (
  slug,
  title,
  organization,
  organization_logo_url,
  salary_min,
  salary_max,
  bps_min,
  bps_max,
  city,
  province,
  category,
  apply_deadline,
  summary,
  description,
  apply_url,
  official_url,
  source_key,
  source_name,
  click_count,
  is_published
) values
  (
    'ppsc-assistant-director-2026',
    'Assistant Director Recruitment 2026',
    'Punjab Public Service Commission',
    null,
    115000,
    210000,
    17,
    17,
    'Lahore',
    'Punjab',
    'Latest Jobs',
    '2026-05-28',
    'Verified public service roles with written test scheduling.',
    'Applications are open for Assistant Director positions across provincial departments. Candidates can review eligibility, syllabus, and document requirements before applying.',
    'https://www.ppsc.gop.pk/',
    'https://www.ppsc.gop.pk/',
    'ppsc',
    'PPSC',
    0,
    true
  ),
  (
    'laptop-scheme-2026-phase-one',
    'Laptop Scheme 2026 Phase One',
    'Higher Education Department',
    null,
    0,
    0,
    1,
    22,
    'Islamabad',
    'Islamabad',
    'New Schemes',
    '2026-06-10',
    'Student verification and merit review are now live.',
    'Eligible students can submit records for digital verification and track phase-wise distribution status through the portal.',
    'https://www.hec.gov.pk/',
    'https://www.hec.gov.pk/',
    'hec',
    'HEC',
    0,
    true
  ),
  (
    'educator-merit-list-2026',
    'Educator Merit List 2026',
    'School Education Department',
    null,
    75000,
    155000,
    14,
    16,
    'Multan',
    'Punjab',
    'Recent Results',
    '2026-05-07',
    'District merit panels and document scrutiny schedule published.',
    'Final panels for educator recruitment are available with district-level instructions for selected and waiting candidates.',
    'https://schools.punjab.gov.pk/',
    'https://schools.punjab.gov.pk/',
    'punjab-education',
    'School Education Department',
    0,
    true
  )
on conflict (slug) do update set
  title = excluded.title,
  organization = excluded.organization,
  organization_logo_url = excluded.organization_logo_url,
  salary_min = excluded.salary_min,
  salary_max = excluded.salary_max,
  bps_min = excluded.bps_min,
  bps_max = excluded.bps_max,
  city = excluded.city,
  province = excluded.province,
  category = excluded.category,
  apply_deadline = excluded.apply_deadline,
  summary = excluded.summary,
  description = excluded.description,
  apply_url = excluded.apply_url,
  official_url = excluded.official_url,
  source_key = excluded.source_key,
  source_name = excluded.source_name,
  is_published = excluded.is_published;
