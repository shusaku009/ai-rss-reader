'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Loader2 } from 'lucide-react'
import type { SearchResult } from '@/lib/db/search'
import { formatDistanceToNow } from '@/lib/format-date'

interface SearchResultsProps {
  query: string
}

export function SearchResults({ query }: SearchResultsProps) {
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (query.trim().length < 2) {
      setResults([])
      return
    }

    setLoading(true)
    setError(null)

    fetch(`/api/search?q=${encodeURIComponent(query)}`)
      .then(r => r.json())
      .then(data => {
        if (data.error) throw new Error(data.error)
        setResults(data.articles ?? [])
      })
      .catch(err => setError(err instanceof Error ? err.message : '検索に失敗しました'))
      .finally(() => setLoading(false))
  }, [query])

  if (query.trim().length < 2) {
    return (
      <p className="text-sm text-muted-foreground text-center py-16">
        2文字以上入力して検索してください
      </p>
    )
  }

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (error) {
    return <p className="text-sm text-destructive text-center py-8">{error}</p>
  }

  if (results.length === 0) {
    return (
      <p className="text-sm text-muted-foreground text-center py-16">
        「{query}」に一致する記事が見つかりませんでした
      </p>
    )
  }

  return (
    <div className="space-y-1">
      <p className="text-xs text-muted-foreground mb-3">{results.length}件の結果</p>
      {results.map(article => (
        <Link
          key={article.id}
          href={`/articles/${article.id}`}
          className="block rounded-lg border p-4 hover:bg-muted/50 transition-colors"
        >
          <h3 className="font-medium text-sm leading-snug line-clamp-2">{article.title}</h3>
          {article.summary && (
            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{article.summary}</p>
          )}
          <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
            {article.author && <span>{article.author}</span>}
            {article.published_at && <span>{formatDistanceToNow(article.published_at)}</span>}
          </div>
        </Link>
      ))}
    </div>
  )
}
