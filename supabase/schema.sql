create table public.profiles (
  id         uuid primary key references auth.users on delete cascade,
  username   text not null default '',
  created_at timestamptz not null default now()
);

create unique index profiles_username_key
  on public.profiles (lower(username)) where username <> '';

create table public.runs (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references public.profiles on delete cascade,
  level_id   text not null,
  solved     boolean not null,
  value      numeric not null,
  elapsed_ms integer not null default 0 check (elapsed_ms >= 0),
  created_at timestamptz not null default now()
);

create index runs_user_level_idx on public.runs (user_id, level_id);
create index runs_level_time_idx on public.runs (level_id, elapsed_ms) where solved;

create function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = '' as $$
declare
  base text := coalesce(
    nullif(trim(new.raw_user_meta_data ->> 'username'), ''),
    split_part(new.email, '@', 1)
  );
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
  values (new.id, base || '-' || left(replace(new.id::text, '-', ''), 6));
  return new;
end $$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

grant select, insert on public.runs     to authenticated;
grant select         on public.profiles to authenticated;
grant update         on public.profiles to authenticated;

alter table public.profiles enable row level security;
alter table public.runs     enable row level security;

create policy "profiles are readable"   on public.profiles for select to authenticated using (true);
create policy "own profile is writable" on public.profiles for update to authenticated
  using (id = (select auth.uid())) with check (id = (select auth.uid()));

create policy "own runs readable" on public.runs for select to authenticated
  using (user_id = (select auth.uid()));
create policy "own runs writable" on public.runs for insert to authenticated
  with check (user_id = (select auth.uid()));

create view public.leaderboard with (security_invoker = false) as
select distinct on (r.level_id)
  r.level_id,
  p.username,
  r.elapsed_ms
from public.runs r
join public.profiles p on p.id = r.user_id
where r.solved
order by r.level_id, r.elapsed_ms asc, r.created_at asc;

grant select on public.leaderboard to authenticated;
