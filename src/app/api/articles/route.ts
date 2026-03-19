import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getArticlesForUser } from '@/lib/db/articles'

export async function GET(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { searchParams } = new URL(request.url)
    const feedId = searchParams.get('feedId') ?? undefined
    const onlyFavorites = searchParams.get('favorites') === 'true'
    const onlyUnread = searchParams.get('unread') === 'true'
    const limit = Math.min(Number(searchParams.get('limit') ?? '30'), 100)
    const offset = Number(searchParams.get('offset') ?? '0')

    const articles = await getArticlesForUser(supabase, {
      userId: user.id,
      feedId,
      onlyFavorites,
      onlyUnread,
      limit,
      offset,
    })

    return NextResponse.json({ articles })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal error' },
      { status: 500 }
    )
  }
}
