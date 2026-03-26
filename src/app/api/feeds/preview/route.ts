import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { fetchFeed } from '@/lib/rss'
import { z } from 'zod'

const PreviewSchema = z.object({
  url: z.string().url('有効なURLを入力してください'),
})

function isPrivateIp(url: string): boolean {
  try {
    const { hostname } = new URL(url)
    return (
      hostname === 'localhost' ||
      hostname === '127.0.0.1' ||
      hostname.startsWith('192.168.') ||
      hostname.startsWith('10.') ||
      hostname.startsWith('172.16.') ||
      hostname === '0.0.0.0' ||
      hostname.endsWith('.local')
    )
  } catch {
    return false
  }
}

export async function GET(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { searchParams } = new URL(request.url)
    const { url } = PreviewSchema.parse({ url: searchParams.get('url') ?? '' })

    if (isPrivateIp(url)) {
      return NextResponse.json(
        { error: 'プライベートIPアドレスへのアクセスは許可されていません' },
        { status: 400 }
      )
    }

    const fetched = await fetchFeed(url)

    return NextResponse.json({
      title: fetched.title,
      description: fetched.description,
      siteUrl: fetched.siteUrl,
      articleCount: fetched.articles.length,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0]?.message ?? 'Invalid input' }, { status: 400 })
    }
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'フィードの取得に失敗しました' },
      { status: 500 }
    )
  }
}
