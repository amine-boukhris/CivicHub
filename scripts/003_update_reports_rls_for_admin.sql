-- Add RLS policies for admins to update and delete reports

-- Only authenticated users (admins) can update reports
create policy "reports_update_authenticated"
  on public.reports for update
  using (auth.uid() is not null);

-- Only authenticated users (admins) can delete reports
create policy "reports_delete_authenticated"
  on public.reports for delete
  using (auth.uid() is not null);

-- Create function to automatically update updated_at timestamp
create or replace function public.handle_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- Create trigger to update updated_at on reports
drop trigger if exists reports_updated_at on public.reports;
create trigger reports_updated_at
  before update on public.reports
  for each row
  execute function public.handle_updated_at();
