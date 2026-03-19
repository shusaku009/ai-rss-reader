import type { SupabaseClient } from '@supabase/supabase-js'
import type { Feed } from '@/types/database'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Client = SupabaseClient<any>

export async function getAllFeeds(supabase: Client): Promise<Feed[]> {
  const { data, error } = await supabase
    .from('feeds')
    .select('*')
    .order('category')
    .order('title')

  if (error) throw new Error(`Failed to get feeds: ${error.message}`)
  return data
}

export async function getUserSubscribedFeedIds(
  supabase: Client,
  userId: string
): Promise<Set<string>> {
  const { data, error } = await supabase
    .from('user_feeds')
    .select('feed_id')
    .eq('user_id', userId)

  if (error) throw new Error(`Failed to get user feeds: ${error.message}`)
  return new Set(data.map(r => r.feed_id))
}

export async function subscribeFeed(
  supabase: Client,
  userId: string,
  feedId: string
): Promise<void> {
  const { error } = await supabase
    .from('user_feeds')
    .insert({ user_id: userId, feed_id: feedId })

  if (error && error.code !== '23505') {
    throw new Error(`Failed to subscribe: ${error.message}`)
  }
}

export async function unsubscribeFeed(
  supabase: Client,
  userId: string,
  feedId: string
): Promise<void> {
  const { error } = await supabase
    .from('user_feeds')
    .delete()
    .eq('user_id', userId)
    .eq('feed_id', feedId)

  if (error) throw new Error(`Failed to unsubscribe: ${error.message}`)
}

export async function updateFeedLastFetched(
  supabase: Client,
  feedId: string
): Promise<void> {
  const { error } = await supabase
    .from('feeds')
    .update({ last_fetched_at: new Date().toISOString() })
    .eq('id', feedId)

  if (error) throw new Error(`Failed to update feed: ${error.message}`)
}
