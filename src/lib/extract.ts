import { parseHTML } from 'linkedom'
import { Readability } from '@mozilla/readability'

const MAX_RESPONSE_BYTES = 5 * 1024 * 1024 // 5MB
const FETCH_TIMEOUT_MS = 15_000

export interface ExtractResult {
  content: string | null
  ogImage: string | null
}

export async function extractArticleContent(url: string): Promise<ExtractResult> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS)

  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; AI-RSS-Reader/1.0; +https://github.com)',
        'Accept': 'text/html,application/xhtml+xml',
      },
    })

    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`)
    }

    const contentType = res.headers.get('content-type') ?? ''
    if (!contentType.includes('text/html') && !contentType.includes('application/xhtml')) {
      throw new Error('Not an HTML page')
    }

    const bodyReader = res.body?.getReader()
    if (!bodyReader) throw new Error('No response body')

    const chunks: Uint8Array[] = []
    let totalBytes = 0

    while (true) {
      const { done, value } = await bodyReader.read()
      if (done) break
      totalBytes += value.byteLength
      if (totalBytes > MAX_RESPONSE_BYTES) {
        await bodyReader.cancel()
        break
      }
      chunks.push(value)
    }

    const merged = new Uint8Array(totalBytes)
    let offset = 0
    for (const chunk of chunks) {
      merged.set(chunk, offset)
      offset += chunk.length
    }
    const html = new TextDecoder().decode(merged)

    const { document } = parseHTML(html)

    const ogImageMeta = (
      document.querySelector('meta[property="og:image"]') ??
      document.querySelector('meta[name="og:image"]')
    ) as Element | null
    const ogImage = ogImageMeta?.getAttribute('content') ?? null

    const reader2 = new Readability(document as unknown as Document)
    const article = reader2.parse()

    return { content: article?.content ?? null, ogImage }
  } finally {
    clearTimeout(timer)
  }
}
