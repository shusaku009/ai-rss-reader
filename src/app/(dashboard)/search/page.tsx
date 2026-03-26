import { SearchBar } from '@/components/search/search-bar'
import { SearchResults } from '@/components/search/search-results'

interface Props {
  searchParams: Promise<{ q?: string }>
}

export default async function SearchPage({ searchParams }: Props) {
  const { q = '' } = await searchParams

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-bold">記事を検索</h2>
        <p className="text-muted-foreground text-sm mt-1">購読中のフィード記事を全文検索できます</p>
      </div>
      <SearchBar initialQuery={q} className="mb-6" />
      <SearchResults query={q} />
    </div>
  )
}
