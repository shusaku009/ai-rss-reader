'use client'

import { useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Loader2, Upload } from 'lucide-react'
import { toast } from 'sonner'
import { MAX_IMPORT_FEEDS } from '@/lib/opml'

export function OPMLImportButton() {
  const [loading, setLoading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setLoading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)

      const res = await fetch('/api/feeds/opml', {
        method: 'POST',
        body: formData,
      })
      const data = await res.json()

      if (!res.ok) {
        toast.error(data.error ?? 'インポートに失敗しました')
        return
      }

      const msg = `${data.imported}件をインポートしました${data.failed > 0 ? `（${data.failed}件失敗）` : ''}${data.truncated ? `（上限${MAX_IMPORT_FEEDS}件）` : ''}`
      toast(msg)
      window.location.reload()
    } catch {
      toast.error('インポートに失敗しました')
    } finally {
      setLoading(false)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept=".opml,.xml,text/xml,application/xml"
        className="hidden"
        onChange={handleFileChange}
      />
      <Button
        size="sm"
        variant="outline"
        onClick={() => inputRef.current?.click()}
        disabled={loading}
      >
        {loading ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <Upload className="h-4 w-4 mr-1" />}
        OPMLインポート
      </Button>
    </>
  )
}
