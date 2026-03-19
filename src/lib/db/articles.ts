import type { SupabaseClient } from '@supabase/supabase-js'
import type { Article, Feed, ArticleWithFeed, Database } from '@/types/database'

export type ArticleDetail = Article & {
  feeds: Pick<Feed, 'id' | 'title' | 'category'> & { url: string }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Client = SupabaseClient<any>

interface GetArticlesOptions {
  userId: string
  feedId?: string
  onlyFavorites?: boolean
  onlyUnread?: boolean
  limit?: number
  offset?: number
}

export async function getArticlesForUser(
  supabase: Client,
  options: GetArticlesOptions
): Promise<ArticleWithFeed[]> {
  const { userId, feedId, onlyFavorites, onlyUnread, limit = 30, offset = 0 } = options

  // Get subscribed feed IDs
  const { data: userFeeds } = await supabase
    .from('user_feeds')
    .select('feed_id')
    .eq('user_id', userId)

  const feedIds = userFeeds?.map(f => f.feed_id) ?? []
  if (feedIds.length === 0) return []

  let query = supabase
    .from('articles')
    .select(`
      *,
      feeds!inner(id, title, category),
      user_articles(is_read, is_favorite)
    `)
    .in('feed_id', feedId ? [feedId] : feedIds)
    .order('published_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (onlyFavorites) {
    query = query.eq('user_articles.is_favorite', true)
  }
  if (onlyUnread) {
    query = query.eq('user_articles.is_read', false)
  }

  const { data, error } = await query
  if (error) throw new Error(`Failed to get articles: ${error.message}`)

  return (data ?? []) as ArticleWithFeed[]
}

export async function getArticleById(
  supabase: Client,
  articleId: string
): Promise<ArticleDetail> {
  const { data, error } = await supabase
    .from('articles')
    .select(`*, feeds(id, title, category, url)`)
    .eq('id', articleId)
    .single()

  if (error) throw new Error(`Failed to get article: ${error.message}`)
  return data as unknown as ArticleDetail
}

export async function upsertUserArticle(
  supabase: Client,
  userId: string,
  articleId: string,
  update: { is_read?: boolean; is_favorite?: boolean }
): Promise<void> {
  const { error } = await supabase
    .from('user_articles')
    .upsert(
      {
        user_id: userId,
        article_id: articleId,
        ...update,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id,article_id' }
    )

  if (error) throw new Error(`Failed to update article: ${error.message}`)
}

export async function insertArticles(
  supabase: Client,
  articles: Database['public']['Tables']['articles']['Insert'][]
): Promise<void> {
  if (articles.length === 0) return

  const { error } = await supabase
    .from('articles')
    .upsert(articles, { onConflict: 'url', ignoreDuplicates: true })

  if (error) throw new Error(`Failed to insert articles: ${error.message}`)
}
