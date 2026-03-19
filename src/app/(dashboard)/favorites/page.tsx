import { ArticleList } from '@/components/articles/article-list'

export default function FavoritesPage() {
  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-bold">お気に入り</h2>
        <p className="text-muted-foreground text-sm mt-1">スターを付けた記事</p>
      </div>
      <ArticleList onlyFavorites />
    </div>
  )
}
