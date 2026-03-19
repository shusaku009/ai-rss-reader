import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getArticleById, upsertUserArticle } from '@/lib/db/articles'
import { z } from 'zod'

const UpdateSchema = z.object({
  is_read: z.boolean().optional(),
  is_favorite: z.boolean().optional(),
})

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const article = await getArticleById(supabase, id)

    // Mark as read automatically
    await upsertUserArticle(supabase, user.id, id, { is_read: true })

    return NextResponse.json({ article })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal error' },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await request.json()
    const update = UpdateSchema.parse(body)

    await upsertUserArticle(supabase, user.id, id, update)

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
