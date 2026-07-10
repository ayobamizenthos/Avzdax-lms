alter table courses add column if not exists tutor_id uuid references profiles(id) on delete set null;
update courses set tutor_id = created_by where tutor_id is null;

create or replace function owns_course(cid uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select coalesce(is_admin() or exists (
    select 1 from courses where id = cid and tutor_id = auth.uid()
  ), false);
$$;

create or replace function enrolled_in_course(cid uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from enrollments where course_id = cid and student_id = auth.uid()
  );
$$;

create or replace function owns_module(mid uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select owns_course((select course_id from modules where id = mid));
$$;

create or replace function enrolled_in_module(mid uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select enrolled_in_course((select course_id from modules where id = mid));
$$;

create or replace function owns_lesson(lid uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select owns_module((select module_id from lessons where id = lid));
$$;

create or replace function enrolled_in_lesson(lid uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select enrolled_in_module((select module_id from lessons where id = lid));
$$;

create or replace function owns_quiz(qid uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select owns_module((select module_id from quizzes where id = qid));
$$;

create or replace function enrolled_in_quiz(qid uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select enrolled_in_module((select module_id from quizzes where id = qid));
$$;

create or replace function owns_assignment(aid uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select owns_module((select module_id from assignments where id = aid));
$$;

drop policy if exists profiles_self_read on profiles;
drop policy if exists profiles_self_update on profiles;
drop policy if exists profiles_admin_write on profiles;
drop policy if exists courses_read on courses;
drop policy if exists courses_staff_write on courses;
drop policy if exists modules_read on modules;
drop policy if exists modules_staff_write on modules;
drop policy if exists lessons_read on lessons;
drop policy if exists lessons_staff_write on lessons;
drop policy if exists resources_read on resources;
drop policy if exists resources_staff_write on resources;
drop policy if exists enrollments_read on enrollments;
drop policy if exists enrollments_staff_write on enrollments;
drop policy if exists progress_read on lesson_progress;
drop policy if exists progress_own_write on lesson_progress;
drop policy if exists progress_own_delete on lesson_progress;
drop policy if exists quizzes_read on quizzes;
drop policy if exists quizzes_staff_write on quizzes;
drop policy if exists quiz_questions_read on quiz_questions;
drop policy if exists quiz_questions_staff_write on quiz_questions;
drop policy if exists quiz_attempts_read on quiz_attempts;
drop policy if exists quiz_attempts_own_write on quiz_attempts;
drop policy if exists assignments_read on assignments;
drop policy if exists assignments_staff_write on assignments;
drop policy if exists submissions_read on submissions;
drop policy if exists submissions_own_write on submissions;
drop policy if exists submissions_staff_grade on submissions;
drop policy if exists submissions_own_update on submissions;
drop policy if exists classes_read on class_sessions;
drop policy if exists classes_staff_write on class_sessions;
drop policy if exists certificates_read on certificates;
drop policy if exists certificates_staff_write on certificates;
drop policy if exists notifications_own_read on notifications;
drop policy if exists notifications_own_update on notifications;
drop policy if exists notifications_staff_write on notifications;

create policy profiles_read on profiles for select using (
  auth.uid() = id or is_admin() or exists (
    select 1 from enrollments e join courses c on c.id = e.course_id
    where e.student_id = profiles.id and c.tutor_id = auth.uid()
  )
);
create policy profiles_self_update on profiles for update using (auth.uid() = id);
create policy profiles_admin_write on profiles for all using (is_admin()) with check (is_admin());

create policy courses_select on courses for select using (
  owns_course(id) or enrolled_in_course(id)
);
create policy courses_insert on courses for insert with check (is_admin() or tutor_id = auth.uid());
create policy courses_update on courses for update using (owns_course(id)) with check (is_admin() or tutor_id = auth.uid());
create policy courses_delete on courses for delete using (owns_course(id));

create policy modules_select on modules for select using (
  owns_course(course_id) or enrolled_in_course(course_id)
);
create policy modules_write on modules for all using (owns_course(course_id)) with check (owns_course(course_id));

create policy lessons_select on lessons for select using (
  owns_module(module_id) or enrolled_in_module(module_id)
);
create policy lessons_write on lessons for all using (owns_module(module_id)) with check (owns_module(module_id));

create policy resources_select on resources for select using (
  owns_lesson(lesson_id) or enrolled_in_lesson(lesson_id)
);
create policy resources_write on resources for all using (owns_lesson(lesson_id)) with check (owns_lesson(lesson_id));

create policy enrollments_select on enrollments for select using (
  student_id = auth.uid() or owns_course(course_id)
);
create policy enrollments_write on enrollments for all using (owns_course(course_id)) with check (owns_course(course_id));

create policy progress_select on lesson_progress for select using (
  student_id = auth.uid() or owns_lesson(lesson_id)
);
create policy progress_insert on lesson_progress for insert with check (student_id = auth.uid());
create policy progress_delete on lesson_progress for delete using (student_id = auth.uid());

create policy quizzes_select on quizzes for select using (
  owns_module(module_id) or enrolled_in_module(module_id)
);
create policy quizzes_write on quizzes for all using (owns_module(module_id)) with check (owns_module(module_id));

create policy quiz_questions_select on quiz_questions for select using (
  owns_quiz(quiz_id) or enrolled_in_quiz(quiz_id)
);
create policy quiz_questions_write on quiz_questions for all using (owns_quiz(quiz_id)) with check (owns_quiz(quiz_id));

create policy quiz_attempts_select on quiz_attempts for select using (
  student_id = auth.uid() or owns_quiz(quiz_id)
);
create policy quiz_attempts_insert on quiz_attempts for insert with check (student_id = auth.uid());

create policy assignments_select on assignments for select using (
  owns_module(module_id) or enrolled_in_module(module_id)
);
create policy assignments_write on assignments for all using (owns_module(module_id)) with check (owns_module(module_id));

create policy submissions_select on submissions for select using (
  student_id = auth.uid() or owns_assignment(assignment_id)
);
create policy submissions_insert on submissions for insert with check (student_id = auth.uid());
create policy submissions_own_update on submissions for update
  using (student_id = auth.uid() and status = 'pending') with check (student_id = auth.uid());
create policy submissions_grade on submissions for update
  using (owns_assignment(assignment_id)) with check (owns_assignment(assignment_id));

create policy classes_select on class_sessions for select using (
  owns_course(course_id) or enrolled_in_course(course_id)
);
create policy classes_write on class_sessions for all using (owns_course(course_id)) with check (owns_course(course_id));

create policy certificates_select on certificates for select using (
  student_id = auth.uid() or owns_course(course_id)
);
create policy certificates_write on certificates for all
  using (student_id = auth.uid() or owns_course(course_id))
  with check (student_id = auth.uid() or owns_course(course_id));

create policy notifications_own_read on notifications for select using (recipient_id = auth.uid());
create policy notifications_own_update on notifications for update using (recipient_id = auth.uid());
create policy notifications_admin_write on notifications for insert with check (is_admin() or is_staff());
