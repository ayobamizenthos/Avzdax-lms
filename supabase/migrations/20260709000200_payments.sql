create table payments (
  id uuid primary key default gen_random_uuid(),
  reference text not null unique,
  email text not null,
  full_name text,
  plan text,
  amount_naira integer not null,
  status text not null default 'success',
  paid_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create index payments_paid_at_idx on payments (paid_at desc);

alter table payments enable row level security;

create policy payments_admin_read on payments for select using (is_admin());

do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and tablename = 'payments'
  ) then
    execute 'alter publication supabase_realtime add table public.payments';
  end if;
end $$;
