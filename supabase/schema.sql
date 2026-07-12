-- Run this once in Supabase Dashboard → SQL Editor.
-- It stores the entire portfolio as a single editable JSONB document.

create table if not exists public.portfolio_content (
  id text primary key default 'main' check (id = 'main'),
  content jsonb not null,
  owner_id uuid not null references auth.users(id) on delete restrict,
  updated_at timestamptz not null default now()
);

alter table public.portfolio_content enable row level security;

grant usage on schema public to anon, authenticated;
grant select on public.portfolio_content to anon, authenticated;
grant insert, update on public.portfolio_content to authenticated;

drop policy if exists "Anyone can read portfolio content" on public.portfolio_content;
create policy "Anyone can read portfolio content"
on public.portfolio_content for select
to anon, authenticated
using (true);

-- The first signed-in owner can create the one `main` row.
drop policy if exists "Owner can create portfolio content" on public.portfolio_content;
create policy "Owner can create portfolio content"
on public.portfolio_content for insert
to authenticated
with check ((select auth.uid()) = owner_id);

-- Afterwards, only that same owner can edit it.
drop policy if exists "Owner can update portfolio content" on public.portfolio_content;
create policy "Owner can update portfolio content"
on public.portfolio_content for update
to authenticated
using ((select auth.uid()) = owner_id)
with check ((select auth.uid()) = owner_id);

-- Keep the timestamp accurate whenever the editor saves.
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_portfolio_content_updated_at on public.portfolio_content;
create trigger set_portfolio_content_updated_at
before update on public.portfolio_content
for each row execute procedure public.set_updated_at();
