import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ExternalLink, ArrowLeft } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { getArticleById, upsertUserArticle } from '@/lib/db/articles'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ChatPanel } from '@/components/chat/chat-panel'
import { SummarySection } from '@/components/articles/summary-section'
import type { ChatMessage } from '@/types/database'
import { formatDistanceToNow } from '@/lib/format-date'

interface Props {
  params: Promise<{ id: string }>
}

export default async function ArticleDetailPage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const article = await getArticleById(supabase, id).catch(() => notFound())

  // Mark as read
  if (user) {
    await upsertUserArticle(supabase, user.id, id, { is_read: true })
  }

  // Get chat history
  const { data: chatSessionData } = await (supabase
    .from('chat_sessions')
    .select('messages')
    .eq('user_id', user?.id ?? '')
    .eq('article_id', id)
    .maybeSingle() as unknown as Promise<{ data: { messages: ChatMessage[] } | null }>)

  const chatHistory: ChatMessage[] = chatSessionData?.messages ?? []

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Article content */}
      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-2xl mx-auto">
          <div className="mb-4">
            <Link
              href="/"
              className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground -ml-2 px-2 py-1 rounded-md hover:bg-muted transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              戻る
            </Link>
          </div>

          <div className="space-y-4">
            <div>
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <Badge variant="secondary">{article.feeds?.title}</Badge>
                {article.tags?.map(tag => (
                  <Badge key={tag} variant="outline" className="text-xs">{tag}</Badge>
                ))}
              </div>
              <h1 className="text-2xl font-bold leading-tight">{article.title}</h1>
              <div className="flex items-center gap-3 mt-2 text-sm text-muted-foreground">
                {article.author && <span>{article.author}</span>}
                {article.published_at && (
                  <span>{formatDistanceToNow(article.published_at)}</span>
                )}
                <a
                  href={article.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 hover:text-foreground"
                >
                  <ExternalLink className="h-3 w-3" />
                  元記事を読む
                </a>
              </div>
            </div>

            <SummarySection
              articleId={id}
              initialSummary={article.summary}
              hasContent={!!article.content}
            />

            {article.content && (
              <div className="prose prose-sm dark:prose-invert max-w-none border-t pt-4">
                <h3 className="text-base font-semibold mb-3 text-muted-foreground">記事本文（抜粋）</h3>
                <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
                  {article.content.slice(0, 2000)}
                  {article.content.length > 2000 && '...'}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Chat panel */}
      <div className="w-96 shrink-0 border-l p-4 overflow-hidden flex flex-col">
        <ChatPanel articleId={id} initialMessages={chatHistory} />
      </div>
    </div>
  )
}
