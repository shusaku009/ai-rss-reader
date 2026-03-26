'use client'

import { useState, useEffect } from 'react'
import { FileText, Sparkles } from 'lucide-react'
import { toast } from 'sonner'
import { ArticleContent } from './article-content'
import { SummarySection } from './summary-section'

type Tab = 'content' | 'summary'

interface ArticleViewTabsProps {
  articleId: string
  initialContent: string | null
  initialSummary: string | null
}

export function ArticleViewTabs({ articleId, initialContent, initialSummary }: ArticleViewTabsProps) {
  const SHORT_CONTENT_THRESHOLD = 3000

  const [activeTab, setActiveTab] = useState<Tab>('content')
  const [content, setContent] = useState(initialContent)
  const [loadingContent, setLoadingContent] = useState(initialContent === null)

  useEffect(() => {
    const isShort = !initialContent || initialContent.length < SHORT_CONTENT_THRESHOLD
    if (!isShort) return

    if (initialContent === null) setLoadingContent(true)

    fetch(`/api/articles/${articleId}/extract`, { method: 'POST' })
      .then(r => r.json())
      .then(data => {
        if (data.content) {
          setContent(data.content)
        } else if (data.error && initialContent === null) {
          toast.error('記事の全文を取得できませんでした')
        }
      })
      .catch(() => {
        if (initialContent === null) toast.error('記事の取得中にエラーが発生しました')
      })
      .finally(() => setLoadingContent(false))
  }, [articleId, initialContent])

  return (
    <div>
      <div className="flex border-b">
        <button
          onClick={() => setActiveTab('content')}
          className={`flex items-center gap-1.5 px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
            activeTab === 'content'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <FileText className="h-4 w-4" />
          本文
        </button>
        <button
          onClick={() => setActiveTab('summary')}
          className={`flex items-center gap-1.5 px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
            activeTab === 'summary'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <Sparkles className="h-4 w-4" />
          AI要約
        </button>
      </div>

      <div className="pt-4">
        {activeTab === 'content' ? (
          <ArticleContent
            articleId={articleId}
            content={content}
            onContentChange={setContent}
            loading={loadingContent}
          />
        ) : (
          <SummarySection
            articleId={articleId}
            initialSummary={initialSummary}
            hasContent={!!content}
          />
        )}
      </div>
    </div>
  )
}
