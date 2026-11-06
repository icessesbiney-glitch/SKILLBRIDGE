-- Create driver tracking table definitions
create table public.driver_locations (
    driver_id text primary key,
    latitude double precision not null,
    longitude double precision not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable structural Row Level Security profiles
alter table public.driver_locations enable row level security;

-- Establish baseline public policies for mobile syncs
create policy "Allow public location discovery" on public.driver_locations
    for select using (true);

create policy "Allow service upserts" on public.driver_locations
    for all using (true) with check (true);
