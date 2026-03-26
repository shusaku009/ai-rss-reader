import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getAllFeeds, getUserSubscribedFeedIds, registerFeed, subscribeFeed } from '@/lib/db/feeds'
import { fetchFeed } from '@/lib/rss'
import { generateOpml, parseOpml, opmlCategoryToFeedCategory } from '@/lib/opml'

const MAX_IMPORT_FEEDS = 50

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const [feeds, subscribedIds] = await Promise.all([
      getAllFeeds(supabase),
      getUserSubscribedFeedIds(supabase, user.id),
    ])

    const subscribedFeeds = feeds.filter(f => subscribedIds.has(f.id))
    const opml = generateOpml(subscribedFeeds)

    return new Response(opml, {
      headers: {
        'Content-Type': 'text/xml; charset=utf-8',
        'Content-Disposition': 'attachment; filename="feeds.opml"',
      },
    })
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

    const formData = await request.formData()
    const file = formData.get('file')

    if (!file || typeof file === 'string') {
      return NextResponse.json({ error: 'OPMLファイルが必要です' }, { status: 400 })
    }

    const text = await (file as File).text()
    const entries = parseOpml(text)

    if (entries.length === 0) {
      return NextResponse.json({ error: 'フィードが見つかりませんでした' }, { status: 400 })
    }

    const limited = entries.slice(0, MAX_IMPORT_FEEDS)
    let imported = 0
    const errors: string[] = []

    for (const entry of limited) {
      try {
        const fetched = await fetchFeed(entry.xmlUrl)
        const { feed } = await registerFeed(supabase, {
          url: entry.xmlUrl,
          title: fetched.title || entry.title,
          description: fetched.description,
          siteUrl: fetched.siteUrl,
          category: opmlCategoryToFeedCategory(entry.category),
          submittedBy: user.id,
        })
        await subscribeFeed(supabase, user.id, feed.id)
        imported++
      } catch (err) {
        errors.push(`${entry.title}: ${err instanceof Error ? err.message : String(err)}`)
      }
    }

    return NextResponse.json({
      imported,
      failed: limited.length - imported,
      total: entries.length,
      truncated: entries.length > MAX_IMPORT_FEEDS,
      errors: errors.slice(0, 10),
    })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal error' },
      { status: 500 }
    )
  }
}
