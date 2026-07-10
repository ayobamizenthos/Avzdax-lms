create type user_role as enum ('student', 'tutor', 'admin');
create type submission_kind as enum ('text', 'file', 'link');
create type submission_status as enum ('pending', 'graded');
create type enrollment_status as enum ('active', 'completed', 'suspended');

create table profiles (
  id uuid primary key references auth.users on delete cascade,
  full_name text not null,
  email text not null unique,
  role user_role not null default 'student',
  avatar_url text,
  created_at timestamptz not null default now()
);

create table courses (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  summary text,
  cover_url text,
  created_by uuid references profiles(id) on delete set null,
  is_published boolean not null default false,
  created_at timestamptz not null default now()
);

create table modules (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references courses(id) on delete cascade,
  title text not null,
  position integer not null default 0,
  created_at timestamptz not null default now()
);

create table lessons (
  id uuid primary key default gen_random_uuid(),
  module_id uuid not null references modules(id) on delete cascade,
  title text not null,
  youtube_id text,
  body text,
  position integer not null default 0,
  created_at timestamptz not null default now()
);

create table resources (
  id uuid primary key default gen_random_uuid(),
  lesson_id uuid not null references lessons(id) on delete cascade,
  name text not null,
  file_url text not null,
  created_at timestamptz not null default now()
);

create table enrollments (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references profiles(id) on delete cascade,
  course_id uuid not null references courses(id) on delete cascade,
  status enrollment_status not null default 'active',
  enrolled_at timestamptz not null default now(),
  unique (student_id, course_id)
);

create table lesson_progress (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references profiles(id) on delete cascade,
  lesson_id uuid not null references lessons(id) on delete cascade,
  completed_at timestamptz not null default now(),
  unique (student_id, lesson_id)
);

create table quizzes (
  id uuid primary key default gen_random_uuid(),
  module_id uuid not null references modules(id) on delete cascade,
  title text not null,
  pass_score integer not null default 70,
  created_at timestamptz not null default now()
);

create table quiz_questions (
  id uuid primary key default gen_random_uuid(),
  quiz_id uuid not null references quizzes(id) on delete cascade,
  prompt text not null,
  options jsonb not null,
  correct_index integer not null,
  position integer not null default 0
);

create table quiz_attempts (
  id uuid primary key default gen_random_uuid(),
  quiz_id uuid not null references quizzes(id) on delete cascade,
  student_id uuid not null references profiles(id) on delete cascade,
  score integer not null,
  answers jsonb not null,
  submitted_at timestamptz not null default now()
);

create table assignments (
  id uuid primary key default gen_random_uuid(),
  module_id uuid not null references modules(id) on delete cascade,
  title text not null,
  instructions text,
  due_at timestamptz,
  created_at timestamptz not null default now()
);

create table submissions (
  id uuid primary key default gen_random_uuid(),
  assignment_id uuid not null references assignments(id) on delete cascade,
  student_id uuid not null references profiles(id) on delete cascade,
  kind submission_kind not null,
  body text,
  file_url text,
  link_url text,
  status submission_status not null default 'pending',
  score integer,
  feedback text,
  submitted_at timestamptz not null default now(),
  graded_at timestamptz
);

create table class_sessions (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references courses(id) on delete cascade,
  title text not null,
  teams_url text not null,
  starts_at timestamptz not null,
  duration_minutes integer not null default 60,
  created_at timestamptz not null default now()
);

create table certificates (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references profiles(id) on delete cascade,
  course_id uuid not null references courses(id) on delete cascade,
  serial text not null unique,
  issued_at timestamptz not null default now(),
  unique (student_id, course_id)
);

create table notifications (
  id uuid primary key default gen_random_uuid(),
  recipient_id uuid not null references profiles(id) on delete cascade,
  title text not null,
  body text,
  href text,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create index modules_course_id_idx on modules (course_id);
create index lessons_module_id_idx on lessons (module_id);
create index resources_lesson_id_idx on resources (lesson_id);
create index enrollments_student_id_idx on enrollments (student_id);
create index enrollments_course_id_idx on enrollments (course_id);
create index lesson_progress_student_id_idx on lesson_progress (student_id);
create index submissions_assignment_id_idx on submissions (assignment_id);
create index submissions_student_id_idx on submissions (student_id);
create index notifications_recipient_id_idx on notifications (recipient_id);

create function current_role_name()
returns user_role
language sql
stable
security definer
set search_path = public
as $$
  select role from profiles where id = auth.uid();
$$;

create function is_staff()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(current_role_name() in ('tutor', 'admin'), false);
$$;

create function is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(current_role_name() = 'admin', false);
$$;

create function handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into profiles (id, full_name, email, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    new.email,
    coalesce((new.raw_user_meta_data->>'role')::user_role, 'student')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function handle_new_user();

alter table profiles enable row level security;
alter table courses enable row level security;
alter table modules enable row level security;
alter table lessons enable row level security;
alter table resources enable row level security;
alter table enrollments enable row level security;
alter table lesson_progress enable row level security;
alter table quizzes enable row level security;
alter table quiz_questions enable row level security;
alter table quiz_attempts enable row level security;
alter table assignments enable row level security;
alter table submissions enable row level security;
alter table class_sessions enable row level security;
alter table certificates enable row level security;
alter table notifications enable row level security;

create policy profiles_self_read on profiles for select using (auth.uid() = id or is_staff());
create policy profiles_self_update on profiles for update using (auth.uid() = id);
create policy profiles_admin_write on profiles for all using (is_admin()) with check (is_admin());

create policy courses_read on courses for select using (is_published or is_staff());
create policy courses_staff_write on courses for all using (is_staff()) with check (is_staff());

create policy modules_read on modules for select using (
  is_staff() or exists (select 1 from courses c where c.id = course_id and c.is_published)
);
create policy modules_staff_write on modules for all using (is_staff()) with check (is_staff());

create policy lessons_read on lessons for select using (
  is_staff() or exists (
    select 1 from modules m join courses c on c.id = m.course_id
    where m.id = module_id and c.is_published
  )
);
create policy lessons_staff_write on lessons for all using (is_staff()) with check (is_staff());

create policy resources_read on resources for select using (
  is_staff() or exists (
    select 1 from lessons l join modules m on m.id = l.module_id
    join courses c on c.id = m.course_id
    where l.id = lesson_id and c.is_published
  )
);
create policy resources_staff_write on resources for all using (is_staff()) with check (is_staff());

create policy enrollments_read on enrollments for select using (student_id = auth.uid() or is_staff());
create policy enrollments_staff_write on enrollments for all using (is_staff()) with check (is_staff());

create policy progress_read on lesson_progress for select using (student_id = auth.uid() or is_staff());
create policy progress_own_write on lesson_progress for insert with check (student_id = auth.uid());
create policy progress_own_delete on lesson_progress for delete using (student_id = auth.uid());

create policy quizzes_read on quizzes for select using (true);
create policy quizzes_staff_write on quizzes for all using (is_staff()) with check (is_staff());

create policy quiz_questions_read on quiz_questions for select using (true);
create policy quiz_questions_staff_write on quiz_questions for all using (is_staff()) with check (is_staff());

create policy quiz_attempts_read on quiz_attempts for select using (student_id = auth.uid() or is_staff());
create policy quiz_attempts_own_write on quiz_attempts for insert with check (student_id = auth.uid());

create policy assignments_read on assignments for select using (true);
create policy assignments_staff_write on assignments for all using (is_staff()) with check (is_staff());

create policy submissions_read on submissions for select using (student_id = auth.uid() or is_staff());
create policy submissions_own_write on submissions for insert with check (student_id = auth.uid());
create policy submissions_staff_grade on submissions for update using (is_staff()) with check (is_staff());

create policy classes_read on class_sessions for select using (true);
create policy classes_staff_write on class_sessions for all using (is_staff()) with check (is_staff());

create policy certificates_read on certificates for select using (student_id = auth.uid() or is_staff());
create policy certificates_staff_write on certificates for all using (is_staff()) with check (is_staff());

create policy notifications_own_read on notifications for select using (recipient_id = auth.uid());
create policy notifications_own_update on notifications for update using (recipient_id = auth.uid());
create policy notifications_staff_write on notifications for insert with check (is_staff());
