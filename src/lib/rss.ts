import Parser from 'rss-parser'
import { z } from 'zod'

const parser = new Parser({
  timeout: 10000,
  headers: { 'User-Agent': 'AI-RSS-Reader/1.0' },
  customFields: {
    item: [
      ['media:content', 'mediaContent'],
      ['media:thumbnail', 'mediaThumbnail'],
    ],
  },
})

const FetchedArticleSchema = z.object({
  title: z.string(),
  url: z.string().url(),
  content: z.string().nullable(),
  author: z.string().nullable(),
  publishedAt: z.string().nullable(),
  thumbnailUrl: z.string().nullable(),
})

export type FetchedArticle = z.infer<typeof FetchedArticleSchema>

function extractThumbnail(item: Record<string, unknown>): string | null {
  // enclosure (e.g. podcast/image enclosures)
  const enclosure = item.enclosure as { url?: string; type?: string } | undefined
  if (enclosure?.url && enclosure.type?.startsWith('image/')) {
    return enclosure.url
  }

  // media:thumbnail
  const mediaThumbnail = item.mediaThumbnail as { $?: { url?: string } } | undefined
  if (mediaThumbnail?.$?.url) return mediaThumbnail.$.url

  // media:content
  const mediaContent = item.mediaContent as { $?: { url?: string; medium?: string } } | undefined
  if (mediaContent?.$?.url && mediaContent.$?.medium === 'image') {
    return mediaContent.$.url
  }

  // first <img> in raw content HTML
  const rawContent = (item['content:encoded'] ?? item.content ?? item.summary ?? '') as string
  const match = rawContent.match(/<img[^>]+src=["']([^"']+)["']/i)
  if (match) return match[1]

  return null
}

export interface FetchedFeed {
  title: string
  description: string | null
  siteUrl: string | null
  articles: FetchedArticle[]
}

export async function fetchFeed(url: string): Promise<FetchedFeed> {
  try {
    const feed = await parser.parseURL(url)

    const articles: FetchedArticle[] = (feed.items ?? [])
      .slice(0, 50)
      .map(item => {
        const raw = item as unknown as Record<string, unknown>
        const rawContent = (raw['content:encoded'] ?? item.content ?? item.summary ?? null) as string | null
        const content = rawContent ? sanitizeHtml(rawContent) : null

        return {
          title: item.title ?? 'No title',
          url: item.link ?? item.guid ?? '',
          content,
          author: item.creator ?? (raw['author'] as string | undefined) ?? null,
          publishedAt: item.pubDate ?? item.isoDate ?? null,
          thumbnailUrl: extractThumbnail(raw),
        }
      })
      .filter(a => a.url !== '')

    return {
      title: feed.title ?? 'Unknown Feed',
      description: feed.description ?? null,
      siteUrl: feed.link ?? null,
      articles,
    }
  } catch (error) {
    throw new Error(`Failed to fetch feed ${url}: ${error instanceof Error ? error.message : String(error)}`)
  }
}

function sanitizeHtml(html: string): string {
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    .replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, '')
    .replace(/<embed\b[^>]*>/gi, '')
    .replace(/(\s)on\w+="[^"]*"/gi, '$1')
    .replace(/(\s)on\w+='[^']*'/gi, '$1')
    .replace(/href="javascript:[^"]*"/gi, 'href="#"')
    .replace(/href='javascript:[^']*'/gi, "href='#'")
    .slice(0, 200_000)
}
