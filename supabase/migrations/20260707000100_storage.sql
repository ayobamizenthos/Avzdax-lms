insert into storage.buckets (id, name, public)
values
  ('resources', 'resources', true),
  ('submissions', 'submissions', false),
  ('avatars', 'avatars', true)
on conflict (id) do nothing;

create policy resources_public_read on storage.objects
  for select using (bucket_id = 'resources');

create policy resources_staff_write on storage.objects
  for insert with check (bucket_id = 'resources' and is_staff());

create policy resources_staff_update on storage.objects
  for update using (bucket_id = 'resources' and is_staff());

create policy resources_staff_delete on storage.objects
  for delete using (bucket_id = 'resources' and is_staff());

create policy avatars_public_read on storage.objects
  for select using (bucket_id = 'avatars');

create policy avatars_owner_write on storage.objects
  for insert with check (bucket_id = 'avatars' and owner = auth.uid());

create policy submissions_owner_read on storage.objects
  for select using (
    bucket_id = 'submissions' and (owner = auth.uid() or is_staff())
  );

create policy submissions_owner_write on storage.objects
  for insert with check (bucket_id = 'submissions' and owner = auth.uid());
