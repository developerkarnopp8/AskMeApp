-- ============================================================
-- AskMe App - Supabase SQL Setup
-- Execute este arquivo no SQL Editor do Supabase
-- ============================================================

-- 0. LIMPEZA (caso já exista algo)
-- ============================================================
drop trigger if exists on_auth_user_created on auth.users;
drop function if exists public.handle_new_user();
drop function if exists public.get_answered_questions(uuid);
drop table if exists public.answers cascade;
drop table if exists public.questions cascade;
drop table if exists public.profiles cascade;

-- 1. TABELA DE PERFIS
-- ============================================================
create table public.profiles (
  id           uuid primary key references auth.users(id) on delete cascade,
  username     text unique not null,
  display_name text,
  created_at   timestamptz default now()
);

-- Cria perfil automaticamente quando um novo usuário se registra
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id, username, display_name)
  values (
    new.id,
    coalesce(
      new.raw_user_meta_data->>'username',
      split_part(new.email, '@', 1)
    ),
    coalesce(
      new.raw_user_meta_data->>'full_name',
      new.raw_user_meta_data->>'username',
      split_part(new.email, '@', 1)
    )
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();


-- 2. TABELA DE PERGUNTAS
-- ============================================================
create table public.questions (
  id           uuid primary key default gen_random_uuid(),
  recipient_id uuid not null references public.profiles(id) on delete cascade,
  sender_name  text,            -- null = anônimo
  content      text not null check (length(content) between 1 and 500),
  created_at   timestamptz default now()
);


-- 3. TABELA DE RESPOSTAS
-- ============================================================
create table public.answers (
  id          uuid primary key default gen_random_uuid(),
  question_id uuid unique not null references public.questions(id) on delete cascade,
  content     text not null,
  created_at  timestamptz default now()
);


-- 4. ROW LEVEL SECURITY (RLS)
-- ============================================================
alter table public.profiles  enable row level security;
alter table public.questions enable row level security;
alter table public.answers   enable row level security;

-- PROFILES: leitura pública, edição apenas pelo dono
create policy "profiles_public_read"
  on public.profiles for select using (true);

create policy "profiles_owner_insert"
  on public.profiles for insert with check (auth.uid() = id);

create policy "profiles_owner_update"
  on public.profiles for update using (auth.uid() = id);

-- QUESTIONS: qualquer um pode inserir, só o destinatário lê
create policy "questions_public_insert"
  on public.questions for insert with check (true);

create policy "questions_recipient_select"
  on public.questions for select
  using (recipient_id = auth.uid());

create policy "questions_public_read_if_answered"
  on public.questions for select
  using (
    exists (select 1 from public.answers a where a.question_id = id)
  );

-- ANSWERS: leitura pública, inserção somente pelo dono da pergunta
create policy "answers_public_select"
  on public.answers for select using (true);

create policy "answers_recipient_insert"
  on public.answers for insert
  with check (
    exists (
      select 1 from public.questions q
      where q.id = question_id
        and q.recipient_id = auth.uid()
    )
  );

create policy "answers_recipient_delete"
  on public.answers for delete
  using (
    exists (
      select 1 from public.questions q
      where q.id = question_id
        and q.recipient_id = auth.uid()
    )
  );


-- 5. ÍNDICES PARA PERFORMANCE
-- ============================================================
create index on public.questions (recipient_id);
create index on public.questions (created_at desc);
create index on public.answers   (question_id);
create index on public.answers   (created_at desc);


-- 6. GRANTS PARA ROLE ANON
-- ============================================================
grant select on public.profiles  to anon;
grant select on public.questions to anon;
grant select on public.answers   to anon;
grant insert on public.questions to anon;


-- 7. FUNÇÃO PÚBLICA: perguntas respondidas por perfil
-- ============================================================
-- Usa security definer para contornar RLS ao buscar perguntas respondidas
-- em perfis públicos (visitantes anônimos)
create or replace function public.get_answered_questions(profile_id uuid)
returns table (
  answer_id        uuid,
  answer_content   text,
  answer_created_at timestamptz,
  question_id      uuid,
  question_content text,
  sender_name      text,
  question_created_at timestamptz
)
language sql
security definer
stable
as $$
  select
    a.id,
    a.content,
    a.created_at,
    q.id,
    q.content,
    q.sender_name,
    q.created_at
  from public.answers a
  join public.questions q on q.id = a.question_id
  where q.recipient_id = profile_id
  order by a.created_at desc;
$$;

grant execute on function public.get_answered_questions(uuid) to anon;
