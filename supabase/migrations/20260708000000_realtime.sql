do $$
begin
  if not exists (select 1 from pg_publication where pubname = 'supabase_realtime') then
    create publication supabase_realtime;
  end if;
end $$;

do $$
declare
  target text;
  wanted text[] := array[
    'notifications', 'submissions', 'assignments', 'lessons', 'modules',
    'resources', 'quizzes', 'quiz_questions', 'quiz_attempts',
    'class_sessions', 'enrollments', 'lesson_progress', 'certificates',
    'courses', 'profiles'
  ];
begin
  foreach target in array wanted loop
    if not exists (
      select 1 from pg_publication_tables
      where pubname = 'supabase_realtime' and tablename = target
    ) then
      execute format('alter publication supabase_realtime add table public.%I', target);
    end if;
  end loop;
end $$;

alter table submissions replica identity full;
alter table lesson_progress replica identity full;
alter table enrollments replica identity full;
alter table notifications replica identity full;
