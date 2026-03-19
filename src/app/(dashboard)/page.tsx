import { ArticleList } from '@/components/articles/article-list'

export default function HomePage() {
  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-bold">最新記事</h2>
        <p className="text-muted-foreground text-sm mt-1">購読中のフィードから最新記事をまとめて表示</p>
      </div>
      <ArticleList />
    </div>
  )
}
