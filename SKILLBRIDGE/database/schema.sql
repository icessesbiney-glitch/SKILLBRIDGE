create table public.courses (
    id uuid default gen_random_uuid() primary key,
    title text not null,
    description text,
    format_category text check (format_category in ('Video lessons', 'Audio lessons', 'Social Skills courses')),
    duration text,
    access_level text check (access_level in ('Free', 'Advanced Premium Tier')),
    cost numeric default 0.00,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table public.learners (
    user_id uuid references auth.users on delete cascade primary key,
    legal_name text not null,
    tier_classification text check (tier_classification in ('Beginner/Free', 'Advanced/Paid')) default 'Beginner/Free',
    proof_of_skills_url text,
    bio text,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table public.quizzes (
    id uuid default gen_random_uuid() primary key,
    course_id uuid references public.courses(id) on delete cascade,
    title text not null,
    scheduled_time timestamp with time zone,
    total_questions integer not null,
    completion_threshold integer not null,
    token_reward numeric default 0.00,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table public.task_submissions (
    id uuid default gen_random_uuid() primary key,
    task_id uuid not null,
    user_id uuid references auth.users on delete cascade not null,
    notes_text text,
    file_storage_path text not null,
    file_size_bytes bigint,
    status text check (status in ('Pending Review', 'Approved', 'Completed', 'Disbursed', 'Rejected')) default 'Pending Review',
    submitted_at timestamp with time zone default timezone('utc'::text, now()) not null    
);

create table public.platform_wallets (
    user_id uuid references auth.users on delete cascade primary key,
    available_balance numeric(10,2) default 0.00 not null,
    total_earnings numeric(10,2) default 0.00 not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table public.dodo_payments_log (
    id uuid default gen_random_uuid() primary key,
    payment_id text unique not null,
    user_id uuid not null,
    amount numeric(10,2) not null,
    status text not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.courses enable row level security;
alter table public.learners enable row level security;
alter table public.quizzes enable row level security;
alter table public.task_submissions enable row level security;
alter table public.platform_wallets enable row level security;

create policy "Allow public read access to courses" on public.courses for select using (true);
create policy "Allow public read access to quizzes" on public.quizzes for select using (true);
create policy "Allow users to view own learner data" on public.learners for select using (auth.uid() = user_id);
create policy "Allow users to edit own learner data" on public.learners for update using (auth.uid() = user_id);
create policy "Allow users to process task submissions" on public.task_submissions for all using (auth.uid() = user_id);
create policy "Secure balance visualization" on public.platform_wallets for select using (auth.uid() = user_id);

create or replace function public.increment_wallet_balance(target_user_id uuid, amount_to_add numeric)
returns void as $$
begin
    insert into public.platform_wallets (user_id, available_balance, total_earnings)
    values (target_user_id, amount_to_add, amount_to_add)
    on conflict (user_id) do update
    set available_balance = public.platform_wallets.available_balance + amount_to_add,
        total_earnings = public.platform_wallets.total_earnings + amount_to_add,
        updated_at = now();
end;
$$ language plpgsql security definer;
