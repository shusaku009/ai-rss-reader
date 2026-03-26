import { parseHTML } from 'linkedom'
import { Readability } from '@mozilla/readability'

const MAX_RESPONSE_BYTES = 5 * 1024 * 1024 // 5MB
const FETCH_TIMEOUT_MS = 15_000
const MAX_CONTENT_LENGTH = 50_000

export async function extractArticleContent(url: string): Promise<string | null> {
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

    // Read body with size limit
    const reader = res.body?.getReader()
    if (!reader) throw new Error('No response body')

    const chunks: Uint8Array[] = []
    let totalBytes = 0

    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      totalBytes += value.byteLength
      if (totalBytes > MAX_RESPONSE_BYTES) {
        await reader.cancel()
        break
      }
      chunks.push(value)
    }

    const html = new TextDecoder().decode(
      chunks.reduce((acc, chunk) => {
        const merged = new Uint8Array(acc.length + chunk.length)
        merged.set(acc)
        merged.set(chunk, acc.length)
        return merged
      }, new Uint8Array())
    )

    const { document } = parseHTML(html)
    const reader2 = new Readability(document as unknown as Document)
    const article = reader2.parse()

    if (!article?.textContent) return null

    return article.textContent
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, MAX_CONTENT_LENGTH)
  } finally {
    clearTimeout(timer)
  }
}
