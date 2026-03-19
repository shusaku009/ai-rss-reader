'use client'

import { useState, useEffect } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2, Plus, Check } from 'lucide-react'
import { toast } from 'sonner'
import type { Feed, FeedCategory } from '@/types/database'

type FeedWithSubscription = Feed & { isSubscribed: boolean }

const CATEGORY_LABELS: Record<FeedCategory, string> = {
  languages: '言語 / フレームワーク',
  engineering: 'エンジニアブログ',
  community: 'コミュニティ',
  infrastructure: 'インフラ / クラウド',
  platform: 'プラットフォーム',
  other: 'その他',
}

export function FeedList() {
  const [feeds, setFeeds] = useState<FeedWithSubscription[]>([])
  const [loading, setLoading] = useState(true)
  const [toggling, setToggling] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/feeds')
      .then(r => r.json())
      .then(({ feeds }) => setFeeds(feeds))
      .catch(() => toast.error('フィードの取得に失敗しました'))
      .finally(() => setLoading(false))
  }, [])

  const toggle = async (feed: FeedWithSubscription) => {
    setToggling(feed.id)
    try {
      const res = await fetch('/api/feeds', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ feedId: feed.id, subscribe: !feed.isSubscribed }),
      })
      if (!res.ok) throw new Error('Failed')

      setFeeds(prev =>
        prev.map(f => f.id === feed.id ? { ...f, isSubscribed: !f.isSubscribed } : f)
      )
      toast(feed.isSubscribed ? `${feed.title} の購読を解除しました` : `${feed.title} を購読しました`)
    } catch {
      toast.error('操作に失敗しました')
    } finally {
      setToggling(null)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  const grouped = feeds.reduce<Record<string, FeedWithSubscription[]>>((acc, feed) => {
    const key = feed.category
    return { ...acc, [key]: [...(acc[key] ?? []), feed] }
  }, {})

  return (
    <div className="space-y-6">
      {(Object.keys(CATEGORY_LABELS) as FeedCategory[]).map(category => {
        const categoryFeeds = grouped[category] ?? []
        if (categoryFeeds.length === 0) return null

        return (
          <Card key={category}>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">{CATEGORY_LABELS[category]}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {categoryFeeds.map(feed => (
                <div
                  key={feed.id}
                  className="flex items-center justify-between py-2 border-b last:border-0"
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm">{feed.title}</p>
                    {feed.description && (
                      <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                        {feed.description}
                      </p>
                    )}
                  </div>
                  <Button
                    size="sm"
                    variant={feed.isSubscribed ? 'secondary' : 'default'}
                    className="ml-3 shrink-0"
                    onClick={() => toggle(feed)}
                    disabled={toggling === feed.id}
                  >
                    {toggling === feed.id ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : feed.isSubscribed ? (
                      <>
                        <Check className="h-3 w-3 mr-1" />
                        購読中
                      </>
                    ) : (
                      <>
                        <Plus className="h-3 w-3 mr-1" />
                        購読
                      </>
                    )}
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
