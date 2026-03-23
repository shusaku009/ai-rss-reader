'use client'

import { Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { ArticleList } from '@/components/articles/article-list'
import { FeedFilter } from '@/components/articles/feed-filter'

function HomeContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const selectedFeedId = searchParams.get('feedId') ?? undefined

  const handleFeedChange = (feedId: string | undefined) => {
    const params = new URLSearchParams(searchParams.toString())
    if (feedId) {
      params.set('feedId', feedId)
    } else {
      params.delete('feedId')
    }
    router.replace(`/?${params.toString()}`)
  }

  return (
    <>
      <div className="mb-4">
        <FeedFilter selectedFeedId={selectedFeedId} onChange={handleFeedChange} />
      </div>
      <ArticleList feedId={selectedFeedId} />
    </>
  )
}

export default function HomePage() {
  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-bold">最新記事</h2>
        <p className="text-muted-foreground text-sm mt-1">購読中のフィードから最新記事をまとめて表示</p>
      </div>
      <Suspense>
        <HomeContent />
      </Suspense>
    </div>
  )
}
