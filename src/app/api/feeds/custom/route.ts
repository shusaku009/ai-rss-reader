import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { fetchFeed } from '@/lib/rss'
import { registerFeed, subscribeFeed } from '@/lib/db/feeds'
import { isPrivateIp } from '@/lib/ssrf'
import { z } from 'zod'

const AddFeedSchema = z.object({
  url: z.string().url('有効なURLを入力してください'),
  category: z.enum(['languages', 'engineering', 'community', 'infrastructure', 'platform', 'other']).optional(),
})

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await request.json()
    const { url, category } = AddFeedSchema.parse(body)

    if (isPrivateIp(url)) {
      return NextResponse.json({ error: 'プライベートIPアドレスへのアクセスは許可されていません' }, { status: 400 })
    }

    const fetched = await fetchFeed(url)

    const { feed, alreadyExisted } = await registerFeed(supabase, {
      url,
      title: fetched.title,
      description: fetched.description,
      siteUrl: fetched.siteUrl,
      category,
      submittedBy: user.id,
    })

    await subscribeFeed(supabase, user.id, feed.id)

    return NextResponse.json({ feed, alreadyExisted })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0]?.message ?? 'Invalid input' }, { status: 400 })
    }
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal error' },
      { status: 500 }
    )
  }
}
