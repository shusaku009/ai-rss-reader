import Anthropic from '@anthropic-ai/sdk'
import type { ChatMessage } from '@/types/database'

const client = new Anthropic()

export async function* streamArticleChat(
  articleTitle: string,
  articleContent: string,
  articleSummary: string | null,
  history: ChatMessage[],
  userMessage: string
): AsyncGenerator<string> {
  const systemPrompt = `あなたは技術記事のアシスタントです。以下の記事について、ユーザーの質問に日本語で回答してください。

# 記事タイトル
${articleTitle}

# 記事の要約
${articleSummary ?? '要約なし'}

# 記事の内容（抜粋）
${articleContent.slice(0, 4000)}

記事の内容に基づいて回答し、不明な点は正直にお伝えください。`

  const messages: Anthropic.MessageParam[] = [
    ...history.map(m => ({
      role: m.role as 'user' | 'assistant',
      content: m.content,
    })),
    { role: 'user', content: userMessage },
  ]

  const stream = await client.messages.stream({
    model: 'claude-sonnet-4-6',
    max_tokens: 1024,
    system: systemPrompt,
    messages,
  })

  for await (const chunk of stream) {
    if (
      chunk.type === 'content_block_delta' &&
      chunk.delta.type === 'text_delta'
    ) {
      yield chunk.delta.text
    }
  }
}
