import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getArticleById } from '@/lib/db/articles'
import { extractArticleContent } from '@/lib/extract'

const SHORT_CONTENT_THRESHOLD = 3000

interface Props {
  params: Promise<{ id: string }>
}

export async function POST(_request: Request, { params }: Props) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const article = await getArticleById(supabase, id)

    const needsContent = !article.content || article.content.length < SHORT_CONTENT_THRESHOLD
    const needsThumbnail = !article.thumbnail_url

    if (!needsContent && !needsThumbnail) {
      return NextResponse.json({ content: article.content, skipped: true })
    }

    const { content, ogImage } = await extractArticleContent(article.url)

    const updateData: Record<string, string | null> = {}
    if (content && needsContent) updateData.content = content
    if (ogImage && needsThumbnail) updateData.thumbnail_url = ogImage

    if (Object.keys(updateData).length > 0) {
      const { error } = await supabase
        .from('articles')
        .update(updateData)
        .eq('id', id)

      if (error) throw new Error(`Failed to update article: ${error.message}`)
    }

    return NextResponse.json({ content: content ?? article.content, skipped: false })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal error' },
      { status: 500 }
    )
  }
}
