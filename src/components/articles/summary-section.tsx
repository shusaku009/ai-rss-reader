'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Sparkles, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

interface SummarySectionProps {
  articleId: string
  initialSummary: string | null
  hasContent: boolean
}

export function SummarySection({ articleId, initialSummary, hasContent }: SummarySectionProps) {
  const [summary, setSummary] = useState<string | null>(initialSummary)
  const [loading, setLoading] = useState(false)

  const generateSummary = async () => {
    if (!hasContent) {
      toast.error('要約する本文がありません')
      return
    }
    setLoading(true)
    try {
      const res = await fetch('/api/ai/summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ articleId }),
      })
      if (!res.ok) throw new Error('Failed')

      const { summary: s } = await res.json()
      setSummary(s)
    } catch {
      toast.error('要約の生成に失敗しました')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="bg-primary/5 border-primary/20">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            AI要約
          </CardTitle>
          {!summary && hasContent && (
            <Button size="sm" variant="outline" onClick={generateSummary} disabled={loading}>
              {loading ? (
                <><Loader2 className="h-3 w-3 animate-spin mr-1" />生成中...</>
              ) : (
                <><Sparkles className="h-3 w-3 mr-1" />要約を生成</>
              )}
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {summary ? (
          <p className="text-sm leading-relaxed">{summary}</p>
        ) : (
          <p className="text-sm text-muted-foreground">
            {hasContent ? 'ボタンを押してAI要約を生成してください' : '要約できる本文がありません'}
          </p>
        )}
      </CardContent>
    </Card>
  )
}
