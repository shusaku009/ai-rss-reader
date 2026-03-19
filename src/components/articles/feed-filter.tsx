'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import type { Feed } from '@/types/database'

interface FeedFilterProps {
  selectedFeedId: string | undefined
  onChange: (feedId: string | undefined) => void
}

type FeedWithSubscription = Feed & { isSubscribed: boolean }

export function FeedFilter({ selectedFeedId, onChange }: FeedFilterProps) {
  const [subscribedFeeds, setSubscribedFeeds] = useState<Feed[]>([])

  useEffect(() => {
    fetch('/api/feeds')
      .then(r => r.json())
      .then(({ feeds }: { feeds: FeedWithSubscription[] }) => {
        setSubscribedFeeds(feeds.filter(f => f.isSubscribed))
      })
      .catch(() => {})
  }, [])

  if (subscribedFeeds.length === 0) return null

  return (
    <div className="flex flex-wrap gap-2">
      <Button
        size="sm"
        variant={selectedFeedId === undefined ? 'default' : 'outline'}
        onClick={() => onChange(undefined)}
      >
        すべて
      </Button>
      {subscribedFeeds.map(feed => (
        <Button
          key={feed.id}
          size="sm"
          variant={selectedFeedId === feed.id ? 'default' : 'outline'}
          onClick={() => onChange(feed.id)}
        >
          {feed.title}
        </Button>
      ))}
    </div>
  )
}
