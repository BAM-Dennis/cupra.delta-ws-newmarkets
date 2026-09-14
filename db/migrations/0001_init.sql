-- CUPRA Workshop 3 "New Market Segment" – Initiales Schema (Prototyp)
-- Ausführen per `npm run db:migrate` (liest DATABASE_URL).
--
-- Der Spielzustand einer Gruppe liegt als JSONB in groups.state und wird
-- ausschließlich vom Server über den Engine-Reducer verändert (server-authoritative).
-- groups.version steigt bei jeder Änderung; Clients pollen mit ?since=<version>.

create extension if not exists pgcrypto;

create table if not exists sessions (
  id             uuid primary key default gen_random_uuid(),
  trainer_token  uuid not null default gen_random_uuid(),
  status         text not null default 'lobby' check (status in ('lobby', 'running')),
  group_count    int  not null check (group_count between 1 and 12),
  -- Runden (Persona-Paare) und Konfiguration werden pro Session eingefroren
  rounds         jsonb not null,
  config         jsonb not null,
  created_at     timestamptz not null default now(),
  started_at     timestamptz
);

create table if not exists groups (
  id          uuid primary key default gen_random_uuid(),
  session_id  uuid not null references sessions(id) on delete cascade,
  idx         int  not null,
  name        text not null,
  -- Kurzcode für den Gruppen-QR (A2)
  code        text not null unique,
  state       jsonb not null,
  version     int  not null default 1,
  updated_at  timestamptz not null default now(),
  unique (session_id, idx)
);
create index if not exists groups_session_idx on groups (session_id);

-- GroupMembership (A3): persistente User-ID des Teilnehmers je Gruppe, plus Präsenz
create table if not exists members (
  group_id      uuid not null references groups(id) on delete cascade,
  user_id       uuid not null,
  nickname      text not null check (char_length(nickname) between 1 and 20),
  joined_at     timestamptz not null default now(),
  last_seen_at  timestamptz not null default now(),
  primary key (group_id, user_id)
);
