import { DOMParser } from '@xmldom/xmldom'
import type { Feed, FeedCategory } from '@/types/database'

export const MAX_IMPORT_FEEDS = 50

function escapeXmlAttr(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

export interface OPMLEntry {
  title: string
  xmlUrl: string
  htmlUrl?: string
  category?: string
}

export function generateOpml(feeds: Feed[]): string {
  const outlines = feeds
    .map(f => {
      const title = escapeXmlAttr(f.title)
      const xmlUrl = escapeXmlAttr(f.url)
      const htmlUrl = f.site_url ? ` htmlUrl="${escapeXmlAttr(f.site_url)}"` : ''
      return `    <outline type="rss" text="${title}" title="${title}" xmlUrl="${xmlUrl}"${htmlUrl}/>`
    })
    .join('\n')

  return `<?xml version="1.0" encoding="UTF-8"?>
<opml version="2.0">
  <head>
    <title>AI RSS Reader Subscriptions</title>
    <dateCreated>${new Date().toUTCString()}</dateCreated>
  </head>
  <body>
${outlines}
  </body>
</opml>`
}

export function parseOpml(xmlString: string): OPMLEntry[] {
  const parser = new DOMParser()
  const doc = parser.parseFromString(xmlString, 'text/xml')

  const outlines = doc.getElementsByTagName('outline')
  const entries: OPMLEntry[] = []

  for (let i = 0; i < outlines.length; i++) {
    const outline = outlines.item(i)
    if (!outline) continue

    const type = outline.getAttribute('type')
    const xmlUrl = outline.getAttribute('xmlUrl') ?? outline.getAttribute('xmlurl')

    if (!xmlUrl) continue
    if (type && type !== 'rss' && type !== 'atom') continue

    const title =
      outline.getAttribute('title') ??
      outline.getAttribute('text') ??
      xmlUrl

    entries.push({
      title,
      xmlUrl,
      htmlUrl: outline.getAttribute('htmlUrl') ?? outline.getAttribute('htmlurl') ?? undefined,
      category: outline.getAttribute('category') ?? undefined,
    })
  }

  return entries
}

export function opmlCategoryToFeedCategory(opmlCategory?: string): FeedCategory {
  if (!opmlCategory) return 'other'
  const lower = opmlCategory.toLowerCase()
  if (lower.includes('language') || lower.includes('framework')) return 'languages'
  if (lower.includes('engineer') || lower.includes('blog')) return 'engineering'
  if (lower.includes('community')) return 'community'
  if (lower.includes('infra') || lower.includes('cloud')) return 'infrastructure'
  if (lower.includes('platform')) return 'platform'
  return 'other'
}
