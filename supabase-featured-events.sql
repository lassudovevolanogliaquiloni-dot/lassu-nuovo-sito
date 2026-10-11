-- Archivio completamente separato per "Eventi in evidenza"
create table if not exists public.featured_events (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  event_date date,
  place text,
  description text,
  published boolean not null default true,
  poster_url text,
  created_at timestamptz not null default now()
);

alter table public.featured_events enable row level security;

drop policy if exists "featured_events_public_select" on public.featured_events;
create policy "featured_events_public_select"
on public.featured_events
for select
to anon, authenticated
using (published = true);

drop policy if exists "featured_events_authenticated_all" on public.featured_events;
create policy "featured_events_authenticated_all"
on public.featured_events
for all
to authenticated
using (true)
with check (true);
