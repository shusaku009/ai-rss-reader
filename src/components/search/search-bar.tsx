'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Search } from 'lucide-react'
import { cn } from '@/lib/utils'

interface SearchBarProps {
  initialQuery?: string
  className?: string
}

export function SearchBar({ initialQuery = '', className }: SearchBarProps) {
  const [value, setValue] = useState(initialQuery)
  const router = useRouter()
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    setValue(initialQuery)
  }, [initialQuery])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        document.getElementById('search-input')?.focus()
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const q = e.target.value
    setValue(q)

    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => {
      if (q.trim().length >= 2) {
        router.replace(`/search?q=${encodeURIComponent(q.trim())}`)
      } else if (q.trim().length === 0) {
        router.replace('/search')
      }
    }, 300)
  }

  return (
    <div className={cn('relative', className)}>
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
      <input
        id="search-input"
        type="search"
        placeholder="記事を検索… (⌘K)"
        value={value}
        onChange={handleChange}
        className="w-full pl-8 pr-3 py-1.5 text-sm bg-background border rounded-md outline-none focus:ring-2 focus:ring-ring"
      />
    </div>
  )
}
