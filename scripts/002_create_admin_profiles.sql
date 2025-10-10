-- Create admin profiles table for city staff
create table if not exists public.admin_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  department text,
  created_at timestamp with time zone default now()
);

-- Enable Row Level Security
alter table public.admin_profiles enable row level security;

-- Only authenticated admins can view admin profiles
create policy "admin_profiles_select_own"
  on public.admin_profiles for select
  using (auth.uid() = id);

-- Only authenticated admins can insert their own profile
create policy "admin_profiles_insert_own"
  on public.admin_profiles for insert
  with check (auth.uid() = id);

-- Only authenticated admins can update their own profile
create policy "admin_profiles_update_own"
  on public.admin_profiles for update
  using (auth.uid() = id);
