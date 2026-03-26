-- Enable pg_trgm for trigram-based full-text search (works with CJK characters)
create extension if not exists pg_trgm;

-- Add search index columns to articles
alter table articles
  add column if not exists search_text text generated always as (
    coalesce(title, '') || ' ' || coalesce(summary, '') || ' ' || coalesce(content, '')
  ) stored;

-- GIN trigram index for fast similarity search
create index if not exists articles_search_text_trgm_idx
  on articles using gin (search_text gin_trgm_ops);

-- Also index title separately with trgm for higher-weight title matches
create index if not exists articles_title_trgm_idx
  on articles using gin (title gin_trgm_ops);

-- RPC function: search articles restricted to a user's subscribed feeds
create or replace function search_articles(
  query text,
  uid uuid,
  lim integer default 30,
  off integer default 0
)
returns table (
  id uuid,
  feed_id uuid,
  title text,
  url text,
  content text,
  summary text,
  tags text[],
  author text,
  published_at timestamptz,
  thumbnail_url text,
  created_at timestamptz,
  rank real
)
language sql
security definer
set search_path = public
as $$
  select
    a.id,
    a.feed_id,
    a.title,
    a.url,
    a.content,
    a.summary,
    a.tags,
    a.author,
    a.published_at,
    a.thumbnail_url,
    a.created_at,
    (
      similarity(a.title, query) * 2.0 +
      similarity(coalesce(a.summary, ''), query) * 1.0 +
      similarity(coalesce(a.content, ''), query) * 0.5
    ) as rank
  from articles a
  inner join user_feeds uf on uf.feed_id = a.feed_id
  where
    uf.user_id = uid
    and (
      a.search_text ilike '%' || query || '%'
      or similarity(a.search_text, query) > 0.1
    )
  order by rank desc, a.published_at desc
  limit lim
  offset off;
$$;

-- Grant execute to authenticated users
grant execute on function search_articles(text, uuid, integer, integer) to authenticated;
