export type Json = string | number | boolean | null | { [key: string]: Json } | Json[]

export type FeedCategory = 'languages' | 'engineering' | 'community' | 'infrastructure' | 'platform' | 'other'

export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
  timestamp: string
}

export interface Database {
  public: {
    Tables: {
      feeds: {
        Row: {
          id: string
          url: string
          title: string
          description: string | null
          category: FeedCategory
          site_url: string | null
          last_fetched_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          url: string
          title: string
          description?: string | null
          category?: FeedCategory
          site_url?: string | null
          last_fetched_at?: string | null
          created_at?: string
        }
        Update: {
          url?: string
          title?: string
          description?: string | null
          category?: FeedCategory
          site_url?: string | null
          last_fetched_at?: string | null
        }
      }
      articles: {
        Row: {
          id: string
          feed_id: string
          title: string
          url: string
          content: string | null
          summary: string | null
          tags: string[]
          author: string | null
          published_at: string | null
          thumbnail_url: string | null
          created_at: string
        }
        Insert: {
          id?: string
          feed_id: string
          title: string
          url: string
          content?: string | null
          summary?: string | null
          tags?: string[]
          author?: string | null
          published_at?: string | null
          thumbnail_url?: string | null
          created_at?: string
        }
        Update: {
          title?: string
          content?: string | null
          summary?: string | null
          tags?: string[]
          author?: string | null
          published_at?: string | null
          thumbnail_url?: string | null
        }
      }
      user_feeds: {
        Row: {
          id: string
          user_id: string
          feed_id: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          feed_id: string
          created_at?: string
        }
        Update: never
      }
      user_articles: {
        Row: {
          id: string
          user_id: string
          article_id: string
          is_read: boolean
          is_favorite: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          article_id: string
          is_read?: boolean
          is_favorite?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          is_read?: boolean
          is_favorite?: boolean
          updated_at?: string
        }
      }
      chat_sessions: {
        Row: {
          id: string
          user_id: string
          article_id: string
          messages: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          article_id: string
          messages?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          messages?: Json
          updated_at?: string
        }
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}

// Convenient domain types
export type Feed = Database['public']['Tables']['feeds']['Row']
export type Article = Database['public']['Tables']['articles']['Row']
export type UserFeed = Database['public']['Tables']['user_feeds']['Row']
export type UserArticle = Database['public']['Tables']['user_articles']['Row']
export type ChatSession = Omit<Database['public']['Tables']['chat_sessions']['Row'], 'messages'> & {
  messages: ChatMessage[]
}

export type ArticleWithFeed = Article & {
  feeds: Pick<Feed, 'id' | 'title' | 'category'>
  user_articles: Pick<UserArticle, 'is_read' | 'is_favorite'>[]
}
