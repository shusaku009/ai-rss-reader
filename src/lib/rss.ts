import Parser from 'rss-parser'
import { z } from 'zod'

const parser = new Parser({
  timeout: 10000,
  headers: { 'User-Agent': 'AI-RSS-Reader/1.0' },
})

const FetchedArticleSchema = z.object({
  title: z.string(),
  url: z.string().url(),
  content: z.string().nullable(),
  author: z.string().nullable(),
  publishedAt: z.string().nullable(),
})

export type FetchedArticle = z.infer<typeof FetchedArticleSchema>

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
        const content = item['content:encoded'] ?? item.content ?? item.summary ?? null
        const cleanContent = content ? stripHtml(content).slice(0, 5000) : null

        return {
          title: item.title ?? 'No title',
          url: item.link ?? item.guid ?? '',
          content: cleanContent,
          author: item.creator ?? item.author ?? null,
          publishedAt: item.pubDate ?? item.isoDate ?? null,
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

function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}
