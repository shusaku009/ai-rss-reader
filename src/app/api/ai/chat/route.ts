import { createClient } from '@/lib/supabase/server'
import { streamArticleChat } from '@/lib/ai/chat'
import { getArticleById } from '@/lib/db/articles'
import { z } from 'zod'
import type { ChatMessage } from '@/types/database'

const Schema = z.object({
  articleId: z.string().uuid(),
  message: z.string().min(1).max(2000),
})

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return new Response('Unauthorized', { status: 401 })
    }

    const body = await request.json()
    const { articleId, message } = Schema.parse(body)

    const article = await getArticleById(supabase, articleId)

    // Get existing chat session
    const { data: session } = await (supabase
      .from('chat_sessions')
      .select('messages')
      .eq('user_id', user.id)
      .eq('article_id', articleId)
      .maybeSingle() as unknown as Promise<{ data: { messages: ChatMessage[] } | null }>)

    const history: ChatMessage[] = session?.messages ?? []

    const encoder = new TextEncoder()
    let fullResponse = ''

    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of streamArticleChat(
            article.title,
            article.content ?? '',
            article.summary,
            history,
            message
          )) {
            fullResponse += chunk
            controller.enqueue(encoder.encode(chunk))
          }

          // Save updated messages to DB
          const updatedMessages: ChatMessage[] = [
            ...history,
            { role: 'user', content: message, timestamp: new Date().toISOString() },
            { role: 'assistant', content: fullResponse, timestamp: new Date().toISOString() },
          ]

          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          await (supabase as any)
            .from('chat_sessions')
            .upsert(
              {
                user_id: user.id,
                article_id: articleId,
                messages: updatedMessages,
                updated_at: new Date().toISOString(),
              },
              { onConflict: 'user_id,article_id' }
            )

          controller.close()
        } catch (error) {
          controller.error(error)
        }
      },
    })

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Transfer-Encoding': 'chunked',
      },
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new Response(JSON.stringify({ error: error.issues }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      })
    }
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Internal error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
}
