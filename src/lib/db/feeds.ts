import type { SupabaseClient } from '@supabase/supabase-js'
import type { Feed, FeedCategory } from '@/types/database'

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

export async function registerFeed(
  supabase: Client,
  data: {
    url: string
    title: string
    description: string | null
    siteUrl: string | null
    category?: FeedCategory
    submittedBy?: string
  }
): Promise<{ feed: Feed; alreadyExisted: boolean }> {
  const { data: existing } = await supabase
    .from('feeds')
    .select('*')
    .eq('url', data.url)
    .maybeSingle()

  if (existing) {
    return { feed: existing, alreadyExisted: true }
  }

  const { data: inserted, error } = await supabase
    .from('feeds')
    .insert({
      url: data.url,
      title: data.title,
      description: data.description,
      site_url: data.siteUrl,
      category: data.category ?? 'other',
      submitted_by: data.submittedBy ?? null,
    })
    .select('*')
    .single()

  if (error) {
    if (error.code === '23505') {
      const { data: concurrent } = await supabase
        .from('feeds')
        .select('*')
        .eq('url', data.url)
        .single()
      if (concurrent) return { feed: concurrent, alreadyExisted: true }
    }
    throw new Error(`Failed to register feed: ${error.message}`)
  }

  return { feed: inserted, alreadyExisted: false }
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
