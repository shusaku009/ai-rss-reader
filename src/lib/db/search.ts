import type { SupabaseClient } from '@supabase/supabase-js'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Client = SupabaseClient<any>

export interface SearchResult {
  id: string
  feed_id: string
  title: string
  url: string
  content: string | null
  summary: string | null
  tags: string[]
  author: string | null
  published_at: string | null
  thumbnail_url: string | null
  created_at: string
  rank: number
}

export async function searchArticles(
  supabase: Client,
  options: {
    userId: string
    query: string
    limit?: number
    offset?: number
  }
): Promise<SearchResult[]> {
  const { userId, query, limit = 30, offset = 0 } = options

  const { data, error } = await supabase.rpc('search_articles', {
    query,
    uid: userId,
    lim: limit,
    off: offset,
  })

  if (error) throw new Error(`Search failed: ${error.message}`)
  return (data ?? []) as SearchResult[]
}
