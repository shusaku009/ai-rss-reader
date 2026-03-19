import { FeedList } from '@/components/feeds/feed-list'

export default function FeedsPage() {
  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-bold">フィード管理</h2>
        <p className="text-muted-foreground text-sm mt-1">購読するフィードを選んでください</p>
      </div>
      <FeedList />
    </div>
  )
}
