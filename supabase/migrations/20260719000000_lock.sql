alter table modules add column if not exists is_locked boolean not null default false;
alter table lessons add column if not exists is_locked boolean not null default false;
