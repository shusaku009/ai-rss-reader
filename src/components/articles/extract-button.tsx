'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Loader2, FileText, Check } from 'lucide-react'
import { toast } from 'sonner'

interface ExtractButtonProps {
  articleId: string
  onExtracted: (content: string) => void
}

export function ExtractButton({ articleId, onExtracted }: ExtractButtonProps) {
  const [loading, setLoading] = useState(false)
  const [extracted, setExtracted] = useState(false)

  const handleExtract = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/articles/${articleId}/extract`, { method: 'POST' })
      const data = await res.json()

      if (!res.ok) {
        toast.error(data.error ?? '取得に失敗しました')
        return
      }

      if (data.skipped || data.content) {
        onExtracted(data.content ?? '')
        setExtracted(true)
        toast(data.skipped ? 'すでに全文が取得済みです' : '全文を取得しました')
      } else {
        toast.error('記事の全文を取得できませんでした（サイトがブロックしている可能性があります）')
      }
    } catch {
      toast.error('取得に失敗しました')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button size="sm" variant="outline" onClick={handleExtract} disabled={loading || extracted}>
      {loading
        ? <Loader2 className="h-3 w-3 animate-spin mr-1" />
        : extracted
          ? <Check className="h-3 w-3 mr-1" />
          : <FileText className="h-3 w-3 mr-1" />
      }
      {extracted ? '取得済み' : '全文を取得'}
    </Button>
  )
}
