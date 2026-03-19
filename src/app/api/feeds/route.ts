import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getAllFeeds, getUserSubscribedFeedIds, subscribeFeed, unsubscribeFeed } from '@/lib/db/feeds'
import { z } from 'zod'

const SubscribeSchema = z.object({
  feedId: z.string().uuid(),
  subscribe: z.boolean(),
})

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const [feeds, subscribedIds] = await Promise.all([
      getAllFeeds(supabase),
      getUserSubscribedFeedIds(supabase, user.id),
    ])

    const feedsWithSubscription = feeds.map(feed => ({
      ...feed,
      isSubscribed: subscribedIds.has(feed.id),
    }))

    return NextResponse.json({ feeds: feedsWithSubscription })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal error' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await request.json()
    const { feedId, subscribe } = SubscribeSchema.parse(body)

    if (subscribe) {
      await subscribeFeed(supabase, user.id, feedId)
    } else {
      await unsubscribeFeed(supabase, user.id, feedId)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 })
    }
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal error' },
      { status: 500 }
    )
  }
}
