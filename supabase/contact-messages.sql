-- Public portfolio contact form: visitors may insert messages, but cannot read them.
create table if not exists public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(trim(name)) between 1 and 120),
  email text not null check (char_length(email) between 3 and 320),
  message text not null check (char_length(trim(message)) between 1 and 5000),
  created_at timestamptz not null default now()
);

alter table public.contact_messages enable row level security;
revoke all on table public.contact_messages from anon, authenticated;
grant insert on table public.contact_messages to anon;

drop policy if exists "Allow public contact submissions" on public.contact_messages;
create policy "Allow public contact submissions"
  on public.contact_messages
  for insert
  to anon
  with check (
    char_length(trim(name)) between 1 and 120
    and char_length(email) between 3 and 320
    and char_length(trim(message)) between 1 and 5000
  );
