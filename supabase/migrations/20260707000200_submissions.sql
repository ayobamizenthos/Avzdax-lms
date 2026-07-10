alter table submissions
  add constraint submissions_assignment_student_key
  unique (assignment_id, student_id);

create policy submissions_own_update on submissions
  for update
  using (student_id = auth.uid() and status = 'pending')
  with check (student_id = auth.uid());
