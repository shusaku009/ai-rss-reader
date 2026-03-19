'use client'

import { useState, useEffect, useCallback } from 'react'
import { ArticleCard } from './article-card'
import { Button } from '@/components/ui/button'
import type { ArticleWithFeed } from '@/types/database'
import { Loader2 } from 'lucide-react'

interface ArticleListProps {
  feedId?: string
  onlyFavorites?: boolean
  onlyUnread?: boolean
}

export function ArticleList({ feedId, onlyFavorites, onlyUnread }: ArticleListProps) {
  const [articles, setArticles] = useState<ArticleWithFeed[]>([])
  const [offset, setOffset] = useState(0)
  const [hasMore, setHasMore] = useState(true)
  const [loading, setLoading] = useState(true)

  const LIMIT = 30

  const fetchArticles = useCallback(async (currentOffset: number, reset = false) => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ limit: String(LIMIT), offset: String(currentOffset) })
      if (feedId) params.set('feedId', feedId)
      if (onlyFavorites) params.set('favorites', 'true')
      if (onlyUnread) params.set('unread', 'true')

      const res = await fetch(`/api/articles?${params}`)
      if (!res.ok) throw new Error('Failed to fetch')

      const { articles: fetched } = await res.json() as { articles: ArticleWithFeed[] }

      setArticles(prev => reset ? fetched : [...prev, ...fetched])
      setHasMore(fetched.length === LIMIT)
    } catch {
      // silent fail — keep showing existing articles
    } finally {
      setLoading(false)
    }
  }, [feedId, onlyFavorites, onlyUnread])

  useEffect(() => {
    setOffset(0)
    setArticles([])
    fetchArticles(0, true)
  }, [feedId, onlyFavorites, onlyUnread, fetchArticles])

  const loadMore = () => {
    const next = offset + LIMIT
    setOffset(next)
    fetchArticles(next)
  }

  if (loading && articles.length === 0) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!loading && articles.length === 0) {
    return (
      <div className="text-center py-16 text-muted-foreground">
        <p>記事がありません。</p>
        <p className="text-sm mt-1">フィードを購読してください。</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-3">
        {articles.map(article => (
          <ArticleCard key={article.id} article={article} />
        ))}
      </div>
      {hasMore && (
        <div className="flex justify-center pt-2">
          <Button variant="outline" onClick={loadMore} disabled={loading}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            もっと読み込む
          </Button>
        </div>
      )}
    </div>
  )
}
