-- Auto-create admin profile on signup with metadata

create or replace function public.handle_new_admin()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.admin_profiles (id, full_name, department)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', 'Admin User'),
    coalesce(new.raw_user_meta_data ->> 'department', null)
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_admin_created on auth.users;

create trigger on_auth_admin_created
  after insert on auth.users
  for each row
  execute function public.handle_new_admin();
