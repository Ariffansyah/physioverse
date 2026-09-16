-- Jalankan ini kalau database sudah pernah diisi schema.sql versi lama
-- (sebelum ada peran pengelola). Project baru cukup schema.sql saja.
-- Aman dijalankan ulang.

alter table public.profiles
  add column if not exists role text not null default 'player'
  check (role in ('player', 'admin'));

alter table public.profiles
  add column if not exists banned boolean not null default false;

create table if not exists public.notice (
  id         boolean primary key default true check (id),
  body       text not null default '',
  updated_at timestamptz not null default now()
);
insert into public.notice (id) values (true) on conflict do nothing;

create or replace function public.is_admin() returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.profiles
    where id = (select auth.uid()) and role = 'admin'
  )
$$;

create or replace function public.guard_ban() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  if new.banned is distinct from old.banned and not public.is_admin() then
    raise exception 'hanya admin yang boleh mengubah status akun';
  end if;
  return new;
end $$;

drop trigger if exists profiles_guard_ban on public.profiles;
create trigger profiles_guard_ban
  before update on public.profiles
  for each row execute function public.guard_ban();

-- Kolom, bukan tabel: kalau seluruh baris boleh di-update, pemain bisa
-- menaikkan dirinya sendiri jadi admin lewat API.
revoke update on public.profiles from authenticated;
grant update (username, banned) on public.profiles to authenticated;
grant delete on public.runs to authenticated;
grant select on public.notice to anon, authenticated;
grant update on public.notice to authenticated;

alter table public.notice enable row level security;

drop policy if exists "own runs writable"        on public.runs;
drop policy if exists "admin reads all runs"     on public.runs;
drop policy if exists "admin deletes runs"       on public.runs;
drop policy if exists "admin moderates profiles" on public.profiles;
drop policy if exists "notice is public"         on public.notice;
drop policy if exists "admin writes notice"      on public.notice;

create policy "own runs writable" on public.runs for insert to authenticated
  with check (
    user_id = (select auth.uid())
    and exists (
      select 1 from public.profiles p
      where p.id = (select auth.uid()) and not p.banned
    )
  );

create policy "admin reads all runs"  on public.runs for select to authenticated using (public.is_admin());
create policy "admin deletes runs"    on public.runs for delete to authenticated using (public.is_admin());

create policy "admin moderates profiles" on public.profiles for update to authenticated
  using (public.is_admin()) with check (public.is_admin());

create policy "notice is public" on public.notice for select to anon, authenticated using (true);
create policy "admin writes notice" on public.notice for update to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- Akun beku tidak menempati papan rekor.
create or replace view public.leaderboard with (security_invoker = false) as
select distinct on (r.level_id)
  r.level_id,
  p.username,
  r.elapsed_ms
from public.runs r
join public.profiles p on p.id = r.user_id
where r.solved and not p.banned
order by r.level_id, r.elapsed_ms asc, r.created_at asc;

-- update public.profiles set role = 'admin' where username = 'admin';
