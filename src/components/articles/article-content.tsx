'use client'

import { Loader2 } from 'lucide-react'

interface ArticleContentProps {
  articleId: string
  content: string | null
  onContentChange: (content: string) => void
  loading?: boolean
}

function isHtml(text: string): boolean {
  return text.trimStart().startsWith('<')
}

export function ArticleContent({ content, loading }: ArticleContentProps) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-16 text-muted-foreground gap-2">
        <Loader2 className="h-4 w-4 animate-spin" />
        <span className="text-sm">記事を読み込み中...</span>
      </div>
    )
  }

  if (!content) {
    return (
      <p className="text-sm text-muted-foreground italic py-4">
        記事の全文を取得できませんでした。
      </p>
    )
  }

  if (isHtml(content)) {
    return (
      <div
        className="article-prose"
        dangerouslySetInnerHTML={{ __html: content }}
      />
    )
  }

  return (
    <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
      {content}
    </p>
  )
}
