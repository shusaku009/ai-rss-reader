'use client'

import { useState } from 'react'
import { ArticleList } from '@/components/articles/article-list'
import { FeedFilter } from '@/components/articles/feed-filter'

export default function HomePage() {
  const [selectedFeedId, setSelectedFeedId] = useState<string | undefined>(undefined)

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-bold">最新記事</h2>
        <p className="text-muted-foreground text-sm mt-1">購読中のフィードから最新記事をまとめて表示</p>
      </div>
      <div className="mb-4">
        <FeedFilter selectedFeedId={selectedFeedId} onChange={setSelectedFeedId} />
      </div>
      <ArticleList feedId={selectedFeedId} />
    </div>
  )
}
