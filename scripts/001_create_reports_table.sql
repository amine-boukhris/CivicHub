-- Create reports table for storing civic infrastructure issues
create table if not exists public.reports (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text not null,
  category text not null check (category in ('pothole', 'streetlight', 'trash', 'graffiti', 'other')),
  status text not null default 'pending' check (status in ('pending', 'in-progress', 'resolved')),
  latitude numeric(10, 7) not null,
  longitude numeric(10, 7) not null,
  address text,
  image_url text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Enable Row Level Security
alter table public.reports enable row level security;

-- Allow anyone to view reports (public data)
create policy "reports_select_all"
  on public.reports for select
  using (true);

-- Allow anyone to insert reports (anonymous reporting)
create policy "reports_insert_all"
  on public.reports for insert
  with check (true);

-- Create index for geospatial queries
create index if not exists reports_location_idx on public.reports (latitude, longitude);

-- Create index for status filtering
create index if not exists reports_status_idx on public.reports (status);

-- Create index for category filtering
create index if not exists reports_category_idx on public.reports (category);
