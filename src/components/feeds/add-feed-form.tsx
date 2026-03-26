'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Loader2, Plus } from 'lucide-react'
import { toast } from 'sonner'
import type { Feed } from '@/types/database'

interface AddFeedFormProps {
  onAdded: (feed: Feed & { isSubscribed: boolean }) => void
}

export function AddFeedForm({ onAdded }: AddFeedFormProps) {
  const [open, setOpen] = useState(false)
  const [url, setUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const res = await fetch('/api/feeds/custom', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: url.trim() }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error ?? '追加に失敗しました')
        return
      }
      toast(data.alreadyExisted ? `${data.feed.title} はすでに登録済みです。購読しました` : `${data.feed.title} を追加しました`)
      onAdded({ ...data.feed, isSubscribed: true })
      setUrl('')
      setOpen(false)
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

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>RSSフィードを追加</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
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
              <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={loading}>
                キャンセル
              </Button>
              <Button type="submit" disabled={loading || !url.trim()}>
                {loading ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : null}
                追加して購読
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}
