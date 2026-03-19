import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic()

export interface SummarizeResult {
  summary: string
  tags: string[]
}

export async function summarizeArticle(
  title: string,
  content: string
): Promise<SummarizeResult> {
  const truncatedContent = content.slice(0, 3000)

  const response = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 512,
    messages: [
      {
        role: 'user',
        content: `以下の技術記事を日本語で3〜5文に要約し、関連タグを5個以内で返してください。

タイトル: ${title}

本文:
${truncatedContent}

必ずJSON形式で返してください:
{
  "summary": "要約文",
  "tags": ["tag1", "tag2"]
}`,
      },
    ],
  })

  const text = response.content[0].type === 'text' ? response.content[0].text : ''

  try {
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) throw new Error('No JSON found')

    const parsed = JSON.parse(jsonMatch[0]) as { summary: string; tags: string[] }
    return {
      summary: parsed.summary ?? '',
      tags: Array.isArray(parsed.tags) ? parsed.tags.slice(0, 5) : [],
    }
  } catch {
    return { summary: text, tags: [] }
  }
}
