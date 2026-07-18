alter table submissions add column if not exists link_urls jsonb not null default '[]'::jsonb;
