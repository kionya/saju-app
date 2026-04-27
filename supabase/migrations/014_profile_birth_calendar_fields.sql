alter table public.profiles
  add column if not exists birth_calendar_type text not null default 'solar';

alter table public.profiles
  add column if not exists birth_time_rule text not null default 'standard';

alter table public.family_profiles
  add column if not exists birth_calendar_type text not null default 'solar';

alter table public.family_profiles
  add column if not exists birth_time_rule text not null default 'standard';

update public.profiles
set
  birth_calendar_type = coalesce(birth_calendar_type, 'solar'),
  birth_time_rule = coalesce(birth_time_rule, 'standard')
where birth_calendar_type is null
   or birth_time_rule is null;

update public.family_profiles
set
  birth_calendar_type = coalesce(birth_calendar_type, 'solar'),
  birth_time_rule = coalesce(birth_time_rule, 'standard')
where birth_calendar_type is null
   or birth_time_rule is null;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'profiles_birth_calendar_type_check'
  ) then
    alter table public.profiles
      add constraint profiles_birth_calendar_type_check
      check (birth_calendar_type in ('solar', 'lunar'));
  end if;

  if not exists (
    select 1
    from pg_constraint
    where conname = 'profiles_birth_time_rule_check'
  ) then
    alter table public.profiles
      add constraint profiles_birth_time_rule_check
      check (birth_time_rule in ('standard', 'trueSolarTime', 'nightZi', 'earlyZi'));
  end if;

  if not exists (
    select 1
    from pg_constraint
    where conname = 'family_profiles_birth_calendar_type_check'
  ) then
    alter table public.family_profiles
      add constraint family_profiles_birth_calendar_type_check
      check (birth_calendar_type in ('solar', 'lunar'));
  end if;

  if not exists (
    select 1
    from pg_constraint
    where conname = 'family_profiles_birth_time_rule_check'
  ) then
    alter table public.family_profiles
      add constraint family_profiles_birth_time_rule_check
      check (birth_time_rule in ('standard', 'trueSolarTime', 'nightZi', 'earlyZi'));
  end if;
end $$;
