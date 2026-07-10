alter table submissions add column if not exists file_paths jsonb not null default '[]'::jsonb;
