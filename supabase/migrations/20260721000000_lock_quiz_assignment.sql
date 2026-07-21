alter table quizzes add column if not exists is_locked boolean not null default false;
alter table assignments add column if not exists is_locked boolean not null default false;
