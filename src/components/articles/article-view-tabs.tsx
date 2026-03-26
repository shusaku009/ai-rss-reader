'use client'

import { useState } from 'react'
import { FileText, Sparkles } from 'lucide-react'
import { ArticleContent } from './article-content'
import { SummarySection } from './summary-section'

type Tab = 'content' | 'summary'

interface ArticleViewTabsProps {
  articleId: string
  initialContent: string | null
  initialSummary: string | null
}

export function ArticleViewTabs({ articleId, initialContent, initialSummary }: ArticleViewTabsProps) {
  const [activeTab, setActiveTab] = useState<Tab>('content')
  const [content, setContent] = useState(initialContent)

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
