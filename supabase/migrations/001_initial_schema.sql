-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Feeds (shared across all users)
create table feeds (
  id uuid primary key default uuid_generate_v4(),
  url text unique not null,
  title text not null,
  description text,
  category text not null default 'other', -- 'languages' | 'infrastructure' | 'platform' | 'other'
  site_url text,
  last_fetched_at timestamptz,
  created_at timestamptz not null default now()
);

-- Articles (shared across all users)
create table articles (
  id uuid primary key default uuid_generate_v4(),
  feed_id uuid not null references feeds(id) on delete cascade,
  title text not null,
  url text unique not null,
  content text,
  summary text,
  tags text[] default '{}',
  author text,
  published_at timestamptz,
  created_at timestamptz not null default now()
);

create index articles_feed_id_idx on articles(feed_id);
create index articles_published_at_idx on articles(published_at desc);

-- User <-> Feed subscriptions
create table user_feeds (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  feed_id uuid not null references feeds(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique(user_id, feed_id)
);

create index user_feeds_user_id_idx on user_feeds(user_id);

-- User article interactions (read, favorite)
create table user_articles (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  article_id uuid not null references articles(id) on delete cascade,
  is_read boolean not null default false,
  is_favorite boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(user_id, article_id)
);

create index user_articles_user_id_idx on user_articles(user_id);
create index user_articles_is_favorite_idx on user_articles(user_id, is_favorite) where is_favorite = true;

-- AI chat sessions per article per user
create table chat_sessions (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  article_id uuid not null references articles(id) on delete cascade,
  messages jsonb not null default '[]',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(user_id, article_id)
);

create index chat_sessions_user_id_idx on chat_sessions(user_id);

-- Row Level Security
alter table feeds enable row level security;
alter table articles enable row level security;
alter table user_feeds enable row level security;
alter table user_articles enable row level security;
alter table chat_sessions enable row level security;

-- Feeds: readable by all authenticated users
create policy "feeds_select" on feeds for select to authenticated using (true);

-- Articles: readable by all authenticated users
create policy "articles_select" on articles for select to authenticated using (true);

-- User feeds: users can only access their own
create policy "user_feeds_select" on user_feeds for select to authenticated using (auth.uid() = user_id);
create policy "user_feeds_insert" on user_feeds for insert to authenticated with check (auth.uid() = user_id);
create policy "user_feeds_delete" on user_feeds for delete to authenticated using (auth.uid() = user_id);

-- User articles: users can only access their own
create policy "user_articles_select" on user_articles for select to authenticated using (auth.uid() = user_id);
create policy "user_articles_insert" on user_articles for insert to authenticated with check (auth.uid() = user_id);
create policy "user_articles_update" on user_articles for update to authenticated using (auth.uid() = user_id);

-- Chat sessions: users can only access their own
create policy "chat_sessions_select" on chat_sessions for select to authenticated using (auth.uid() = user_id);
create policy "chat_sessions_insert" on chat_sessions for insert to authenticated with check (auth.uid() = user_id);
create policy "chat_sessions_update" on chat_sessions for update to authenticated using (auth.uid() = user_id);
