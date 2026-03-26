'use client'

import { useState } from 'react'
import { ExtractButton } from './extract-button'

interface ArticleContentProps {
  articleId: string
  initialContent: string | null
}

export function ArticleContent({ articleId, initialContent }: ArticleContentProps) {
  const [content, setContent] = useState(initialContent)

  return (
    <div className="border-t pt-4 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-semibold text-muted-foreground">
          {content ? '記事本文' : '記事本文（未取得）'}
        </h3>
        <ExtractButton articleId={articleId} onExtracted={setContent} />
      </div>

      {content ? (
        <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
          {content.slice(0, 5000)}
          {content.length > 5000 && '…'}
        </p>
      ) : (
        <p className="text-sm text-muted-foreground italic">
          「全文を取得」ボタンで元記事から本文を取得できます。
        </p>
      )}
    </div>
  )
}
