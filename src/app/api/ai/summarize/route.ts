import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { summarizeArticle } from '@/lib/ai/summarize'
import { getArticleById } from '@/lib/db/articles'
import { z } from 'zod'

const Schema = z.object({ articleId: z.string().uuid() })

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await request.json()
    const { articleId } = Schema.parse(body)

    const article = await getArticleById(supabase, articleId)

    // Return cached summary if available
    if (article.summary) {
      return NextResponse.json({ summary: article.summary, tags: article.tags })
    }

    if (!article.content) {
      return NextResponse.json({ error: 'No content to summarize' }, { status: 400 })
    }

    const result = await summarizeArticle(article.title, article.content)

    // Cache summary in DB
    await supabase
      .from('articles')
      .update({ summary: result.summary, tags: result.tags })
      .eq('id', articleId)

    return NextResponse.json(result)
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
