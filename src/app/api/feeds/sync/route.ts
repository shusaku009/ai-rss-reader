import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { fetchFeed } from '@/lib/rss'
import { getAllFeeds, updateFeedLastFetched } from '@/lib/db/feeds'
import { insertArticles } from '@/lib/db/articles'

export async function POST(request: Request) {
  const authHeader = request.headers.get('authorization')
  const expectedToken = `Bearer ${process.env.CRON_SECRET}`

  if (authHeader !== expectedToken) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = await createServiceClient()
  const feeds = await getAllFeeds(supabase)

  const results = await Promise.allSettled(
    feeds.map(async feed => {
      try {
        const fetched = await fetchFeed(feed.url)

        const articles = fetched.articles
          .filter(a => a.url)
          .map(a => ({
            feed_id: feed.id,
            title: a.title,
            url: a.url,
            content: a.content,
            author: a.author,
            published_at: a.publishedAt,
            thumbnail_url: a.thumbnailUrl,
          }))

        await insertArticles(supabase, articles)
        await updateFeedLastFetched(supabase, feed.id)

        return { feedId: feed.id, inserted: articles.length }
      } catch (error) {
        return { feedId: feed.id, error: error instanceof Error ? error.message : String(error) }
      }
    })
  )

  const summary = results.map(r => r.status === 'fulfilled' ? r.value : r.reason)
  return NextResponse.json({ success: true, results: summary })
}
