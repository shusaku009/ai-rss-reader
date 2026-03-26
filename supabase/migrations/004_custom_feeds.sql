-- Add submitted_by to distinguish user-submitted feeds from curated ones
alter table feeds
  add column if not exists submitted_by uuid references auth.users(id) on delete set null;

-- Allow authenticated users to insert feeds (for custom feed registration)
create policy "feeds_insert" on feeds
  for insert to authenticated
  with check (true);

-- Allow users to update feeds they submitted
create policy "feeds_update_own" on feeds
  for update to authenticated
  using (submitted_by = auth.uid());
