'use client'

import Link from 'next/link'
import { usePathname, useSearchParams } from 'next/navigation'
import { BookOpen, Rss, Star, LogOut, ChevronDown, ChevronRight } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import type { Feed } from '@/types/database'

export function Sidebar() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const router = useRouter()
  const [feedsOpen, setFeedsOpen] = useState(true)
  const [subscribedFeeds, setSubscribedFeeds] = useState<Feed[]>([])

  const selectedFeedId = searchParams.get('feedId') ?? undefined

  useEffect(() => {
    fetch('/api/feeds')
      .then(r => r.json())
      .then(({ feeds }: { feeds: (Feed & { isSubscribed: boolean })[] }) => {
        setSubscribedFeeds(feeds?.filter(f => f.isSubscribed) ?? [])
      })
      .catch(() => {})
  }, [])

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <aside className="w-60 shrink-0 border-r bg-muted/30 flex flex-col h-screen sticky top-0">
      <div className="px-4 py-5 border-b">
        <h1 className="text-lg font-bold tracking-tight">AI RSS Reader</h1>
      </div>
      <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
        <Link
          href="/"
          className={cn(
            'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
            pathname === '/' && !selectedFeedId
              ? 'bg-primary text-primary-foreground'
              : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
          )}
        >
          <BookOpen className="h-4 w-4" />
          記事一覧
        </Link>

        {/* フィード管理（折りたたみ式） */}
        <div>
          <div className="flex items-center rounded-md transition-colors">
            <Link
              href="/feeds"
              className={cn(
                'flex flex-1 items-center gap-3 px-3 py-2 text-sm font-medium transition-colors rounded-md',
                pathname === '/feeds'
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
              )}
            >
              <Rss className="h-4 w-4" />
              フィード管理
            </Link>
            <button
              onClick={() => setFeedsOpen(prev => !prev)}
              className="p-1.5 text-muted-foreground hover:text-foreground transition-colors"
              aria-label={feedsOpen ? '折りたたむ' : '展開する'}
            >
              {feedsOpen
                ? <ChevronDown className="h-3.5 w-3.5" />
                : <ChevronRight className="h-3.5 w-3.5" />
              }
            </button>
          </div>

          {feedsOpen && subscribedFeeds.length > 0 && (
            <div className="mt-1 ml-3 space-y-0.5 border-l pl-3">
              {subscribedFeeds.map(feed => (
                <Link
                  key={feed.id}
                  href={`/?feedId=${feed.id}`}
                  className={cn(
                    'block rounded-md px-2 py-1.5 text-xs font-medium transition-colors truncate',
                    selectedFeedId === feed.id
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                  )}
                  title={feed.title}
                >
                  {feed.title}
                </Link>
              ))}
            </div>
          )}
        </div>

        <Link
          href="/favorites"
          className={cn(
            'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
            pathname === '/favorites'
              ? 'bg-primary text-primary-foreground'
              : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
          )}
        >
          <Star className="h-4 w-4" />
          お気に入り
        </Link>
      </nav>
      <div className="px-4 py-4 border-t">
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start gap-2 text-muted-foreground"
          onClick={handleLogout}
        >
          <LogOut className="h-4 w-4" />
          ログアウト
        </Button>
      </div>
    </aside>
  )
}
