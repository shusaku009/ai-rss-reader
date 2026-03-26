import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { searchArticles } from '@/lib/db/search'
import { z } from 'zod'

const SearchParamsSchema = z.object({
  q: z.string().min(2, '2文字以上入力してください'),
  limit: z.coerce.number().int().min(1).max(50).default(30),
  offset: z.coerce.number().int().min(0).default(0),
})

export async function GET(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { searchParams } = new URL(request.url)
    const parsed = SearchParamsSchema.safeParse({
      q: searchParams.get('q') ?? '',
      limit: searchParams.get('limit') ?? undefined,
      offset: searchParams.get('offset') ?? undefined,
    })

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message ?? 'Invalid params' }, { status: 400 })
    }

    const { q, limit, offset } = parsed.data
    const articles = await searchArticles(supabase, { userId: user.id, query: q, limit, offset })

    return NextResponse.json({ articles, query: q })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal error' },
      { status: 500 }
    )
  }
}
