
alter table public.profiles
  add column if not exists role text not null default 'player'
  check (role in ('player', 'admin'));

alter table public.profiles
  add column if not exists banned boolean not null default false;

update public.profiles set username = left(username, 24) where char_length(username) > 24;
alter table public.profiles drop constraint if exists profiles_username_check;
alter table public.profiles
  add constraint profiles_username_check check (char_length(username) <= 24);

create table if not exists public.notice (
  id         boolean primary key default true check (id),
  body       text not null default '',
  updated_at timestamptz not null default now()
);
insert into public.notice (id) values (true) on conflict do nothing;

create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = '' as $$
declare
  base text := left(coalesce(
    nullif(trim(new.raw_user_meta_data ->> 'username'), ''),
    split_part(new.email, '@', 1)
  ), 20);
  name text := base;
begin
  for n in 1..20 loop
    begin
      insert into public.profiles (id, username) values (new.id, name);
      return new;
    exception when unique_violation then
      name := base || n::text;
    end;
  end loop;

  insert into public.profiles (id, username)
  values (new.id, left(base, 14) || '-' || left(replace(new.id::text, '-', ''), 6));
  return new;
end $$;

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

revoke update on public.profiles from authenticated;
grant update (username, banned) on public.profiles to authenticated;
grant delete on public.runs to authenticated;
grant select on public.notice to anon, authenticated;
grant update on public.notice to authenticated;

alter table public.runs     enable row level security;
alter table public.profiles enable row level security;
alter table public.notice   enable row level security;

revoke all on public.runs     from anon;
revoke all on public.profiles from anon;

do $$
declare pol record;
begin
  for pol in
    select tablename, policyname from pg_policies
    where schemaname = 'public' and tablename in ('runs', 'profiles', 'notice')
  loop
    execute format('drop policy %I on public.%I', pol.policyname, pol.tablename);
  end loop;
end $$;

create policy "profiles are readable" on public.profiles for select to authenticated
  using (true);

create policy "own profile is writable" on public.profiles for update to authenticated
  using (id = (select auth.uid())) with check (id = (select auth.uid()));

create policy "own runs readable" on public.runs for select to authenticated
  using (user_id = (select auth.uid()));

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

create or replace view public.leaderboard with (security_invoker = false) as
select distinct on (r.level_id)
  r.level_id,
  p.username,
  r.elapsed_ms
from public.runs r
join public.profiles p on p.id = r.user_id
where r.solved and not p.banned
order by r.level_id, r.elapsed_ms asc, r.created_at asc;

