'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Loader2, Plus, ExternalLink, ArrowLeft } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import type { Feed, FeedCategory } from '@/types/database'

interface AddFeedFormProps {
  onAdded: (feed: Feed & { isSubscribed: boolean }) => void
}

interface FeedPreview {
  title: string
  description: string | null
  siteUrl: string | null
  articleCount: number
}

const CATEGORY_OPTIONS: { value: FeedCategory; label: string }[] = [
  { value: 'languages', label: '言語 / FW' },
  { value: 'engineering', label: 'エンジニアブログ' },
  { value: 'community', label: 'コミュニティ' },
  { value: 'infrastructure', label: 'インフラ / クラウド' },
  { value: 'platform', label: 'プラットフォーム' },
  { value: 'other', label: 'その他' },
]

export function AddFeedForm({ onAdded }: AddFeedFormProps) {
  const [open, setOpen] = useState(false)
  const [url, setUrl] = useState('')
  const [preview, setPreview] = useState<FeedPreview | null>(null)
  const [category, setCategory] = useState<FeedCategory>('other')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleClose = () => {
    setOpen(false)
    setUrl('')
    setPreview(null)
    setCategory('other')
    setError(null)
  }

  const handlePreview = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const res = await fetch(`/api/feeds/preview?url=${encodeURIComponent(url.trim())}`)
      const data = await res.json()
      if (!res.ok) {
        setError(data.error ?? 'フィードの取得に失敗しました')
        return
      }
      setPreview(data)
    } catch {
      setError('ネットワークエラーが発生しました')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const res = await fetch('/api/feeds/custom', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: url.trim(), category }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error ?? '追加に失敗しました')
        return
      }
      toast(
        data.alreadyExisted
          ? `${data.feed.title} はすでに登録済みです。購読しました`
          : `${data.feed.title} を追加しました`
      )
      onAdded({ ...data.feed, isSubscribed: true })
      handleClose()
    } catch {
      setError('ネットワークエラーが発生しました')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Button size="sm" onClick={() => setOpen(true)}>
        <Plus className="h-4 w-4 mr-1" />
        フィードを追加
      </Button>

      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>RSSフィードを追加</DialogTitle>
          </DialogHeader>

          {preview === null ? (
            <form onSubmit={handlePreview} className="space-y-4">
              <div className="space-y-1">
                <label htmlFor="feed-url" className="text-sm font-medium">
                  RSS / Atom URL
                </label>
                <Input
                  id="feed-url"
                  type="url"
                  placeholder="https://example.com/feed.xml"
                  value={url}
                  onChange={e => setUrl(e.target.value)}
                  required
                  disabled={loading}
                />
                {error && <p className="text-xs text-destructive">{error}</p>}
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={handleClose} disabled={loading}>
                  キャンセル
                </Button>
                <Button type="submit" disabled={loading || !url.trim()}>
                  {loading
                    ? <><Loader2 className="h-4 w-4 animate-spin mr-1" />確認中...</>
                    : 'フィードを確認'
                  }
                </Button>
              </DialogFooter>
            </form>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Feed preview card */}
              <div className="rounded-lg border bg-muted/40 p-4 space-y-1">
                <div className="flex items-start justify-between gap-2">
                  <p className="font-semibold text-sm leading-snug">{preview.title}</p>
                  {preview.siteUrl && (
                    <a
                      href={preview.siteUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="shrink-0 text-muted-foreground hover:text-foreground"
                      aria-label="サイトを開く"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  )}
                </div>
                {preview.description && (
                  <p className="text-xs text-muted-foreground line-clamp-2">{preview.description}</p>
                )}
                <p className="text-xs text-muted-foreground">
                  最新 {preview.articleCount} 件の記事
                </p>
              </div>

              {/* Category selection */}
              <div className="space-y-2">
                <p className="text-sm font-medium">カテゴリ</p>
                <div className="flex flex-wrap gap-2">
                  {CATEGORY_OPTIONS.map(opt => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setCategory(opt.value)}
                      className={cn(
                        'rounded-full border px-3 py-1 text-xs font-medium transition-colors',
                        category === opt.value
                          ? 'border-primary bg-primary text-primary-foreground'
                          : 'border-border bg-background text-muted-foreground hover:border-foreground hover:text-foreground'
                      )}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {error && <p className="text-xs text-destructive">{error}</p>}

              <DialogFooter className="gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => { setPreview(null); setError(null) }}
                  disabled={loading}
                >
                  <ArrowLeft className="h-3.5 w-3.5 mr-1" />
                  戻る
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading
                    ? <><Loader2 className="h-4 w-4 animate-spin mr-1" />追加中...</>
                    : '購読して追加'
                  }
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
