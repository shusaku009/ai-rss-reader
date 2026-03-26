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

    if (article.content && article.content.length >= SHORT_CONTENT_THRESHOLD) {
      return NextResponse.json({ content: article.content, skipped: true })
    }

    const content = await extractArticleContent(article.url)

    if (content) {
      const { error } = await supabase
        .from('articles')
        .update({ content })
        .eq('id', id)

      if (error) throw new Error(`Failed to update article: ${error.message}`)
    }

    return NextResponse.json({ content, skipped: false })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal error' },
      { status: 500 }
    )
  }
}
