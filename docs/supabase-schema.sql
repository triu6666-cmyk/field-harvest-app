create table if not exists public.field_app_states (
  id text primary key,
  data jsonb not null,
  updated_at timestamptz not null default now()
);

alter table public.field_app_states enable row level security;

create policy "Allow public read field app states"
on public.field_app_states
for select
using (true);

create policy "Allow public upsert field app states"
on public.field_app_states
for insert
with check (true);

create policy "Allow public update field app states"
on public.field_app_states
for update
using (true)
with check (true);
