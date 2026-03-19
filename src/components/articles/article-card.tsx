'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Star, CheckCheck, ExternalLink } from 'lucide-react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import type { ArticleWithFeed } from '@/types/database'
import { formatDistanceToNow } from '@/lib/format-date'

interface ArticleCardProps {
  article: ArticleWithFeed
}

export function ArticleCard({ article }: ArticleCardProps) {
  const userArticle = article.user_articles?.[0]
  const [isRead, setIsRead] = useState(userArticle?.is_read ?? false)
  const [isFavorite, setIsFavorite] = useState(userArticle?.is_favorite ?? false)

  const toggle = async (field: 'is_read' | 'is_favorite', value: boolean) => {
    try {
      const res = await fetch(`/api/articles/${article.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [field]: value }),
      })
      if (!res.ok) throw new Error('Failed to update')

      if (field === 'is_read') setIsRead(value)
      if (field === 'is_favorite') {
        setIsFavorite(value)
        toast(value ? 'お気に入りに追加しました' : 'お気に入りを解除しました')
      }
    } catch {
      toast.error('更新に失敗しました')
    }
  }

  return (
    <Card className={`transition-opacity ${isRead ? 'opacity-60' : ''}`}>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          {article.thumbnail_url && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={article.thumbnail_url}
              alt=""
              className="w-20 h-16 object-cover rounded shrink-0"
              loading="lazy"
              onError={e => { (e.target as HTMLImageElement).style.display = 'none' }}
            />
          )}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <Badge variant="secondary" className="text-xs shrink-0">
                {article.feeds.title}
              </Badge>
              {article.tags?.slice(0, 3).map(tag => (
                <Badge key={tag} variant="outline" className="text-xs shrink-0">
                  {tag}
                </Badge>
              ))}
            </div>
            <Link
              href={`/articles/${article.id}`}
              className="font-semibold text-sm leading-tight hover:underline line-clamp-2"
            >
              {article.title}
            </Link>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => toggle('is_favorite', !isFavorite)}
            >
              <Star className={`h-4 w-4 ${isFavorite ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground'}`} />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => toggle('is_read', !isRead)}
            >
              <CheckCheck className={`h-4 w-4 ${isRead ? 'text-primary' : 'text-muted-foreground'}`} />
            </Button>
          </div>
        </div>
      </CardHeader>
      {article.summary && (
        <CardContent className="pt-0 pb-3">
          <p className="text-xs text-muted-foreground line-clamp-3">{article.summary}</p>
        </CardContent>
      )}
      <CardContent className="pt-0 pb-3">
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">
            {article.published_at ? formatDistanceToNow(article.published_at) : ''}
          </span>
          <a
            href={article.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1"
          >
            <ExternalLink className="h-3 w-3" />
            元記事
          </a>
        </div>
      </CardContent>
    </Card>
  )
}
