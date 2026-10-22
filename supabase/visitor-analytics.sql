-- One consented record per IP address per UTC day. IP data is personal/sensitive;
-- keep this table private and remove old rows when they are no longer needed.
create table if not exists public.visitor_visits (
  id bigint generated always as identity primary key,
  ip inet not null,
  visit_date date not null default (now() at time zone 'utc')::date,
  recorded_at timestamptz not null default now(),
  constraint visitor_visits_ip_date_unique unique (ip, visit_date)
);

alter table public.visitor_visits enable row level security;
revoke all on table public.visitor_visits from anon, authenticated;
grant insert on table public.visitor_visits to service_role;
revoke all on sequence public.visitor_visits_id_seq from anon, authenticated;

comment on table public.visitor_visits is
  'Consent-based daily unique visit estimates; contains IP addresses. Do not expose publicly.';
