create table course_tutors (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references courses(id) on delete cascade,
  tutor_id uuid not null references profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (course_id, tutor_id)
);

create index course_tutors_course_id_idx on course_tutors (course_id);
create index course_tutors_tutor_id_idx on course_tutors (tutor_id);

insert into course_tutors (course_id, tutor_id)
select id, tutor_id from courses where tutor_id is not null
on conflict do nothing;

alter table course_tutors enable row level security;

create policy course_tutors_read on course_tutors
  for select using (is_admin() or tutor_id = auth.uid());

create policy course_tutors_admin_write on course_tutors
  for all using (is_admin()) with check (is_admin());

create or replace function owns_course(cid uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    is_admin()
    or exists (select 1 from courses where id = cid and tutor_id = auth.uid())
    or exists (select 1 from course_tutors where course_id = cid and tutor_id = auth.uid()),
    false
  );
$$;
