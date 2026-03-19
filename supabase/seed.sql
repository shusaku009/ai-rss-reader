-- Preset RSS feeds
insert into feeds (url, title, description, category, site_url) values
  -- Languages / Frameworks (公式ブログ)
  ('https://deno.com/blog/feed', 'Deno Blog', 'Official Deno blog', 'languages', 'https://deno.com'),
  ('https://go.dev/blog/feed.atom', 'Go Blog', 'The Go Programming Language blog', 'languages', 'https://go.dev'),
  ('https://blog.rust-lang.org/feed.xml', 'Rust Blog', 'Official Rust programming language blog', 'languages', 'https://blog.rust-lang.org'),
  ('https://devblogs.microsoft.com/typescript/feed/', 'TypeScript Blog', 'Official TypeScript blog', 'languages', 'https://devblogs.microsoft.com/typescript'),
  ('https://trilon.io/blog/rss.xml', 'NestJS Blog', 'Official NestJS blog', 'languages', 'https://trilon.io'),
  -- Engineering Blogs (企業テックブログ)
  ('https://engineering.mercari.com/blog/feed.xml', 'メルカリエンジニアブログ', 'Mercari Engineering Blog', 'engineering', 'https://engineering.mercari.com'),
  ('https://techblog.zozo.com/feed', 'ZOZOエンジニアブログ', 'ZOZO Technologies engineering blog', 'engineering', 'https://techblog.zozo.com'),
  ('https://dev.classmethod.jp/feed/', 'Classmethod', 'DevelopersIO - クラスメソッド株式会社', 'engineering', 'https://dev.classmethod.jp'),
  -- Community (技術コミュニティ)
  ('https://zenn.dev/feed', 'Zenn', 'Zenn - エンジニアのための情報共有コミュニティ', 'community', 'https://zenn.dev'),
  ('https://qiita.com/popular-items/feed', 'Qiita', 'Qiita - プログラマのための技術情報共有サービス', 'community', 'https://qiita.com'),
  -- Infrastructure (インフラ・クラウド)
  ('https://blog.cloudflare.com/rss/', 'Cloudflare Blog', 'Cloudflare official blog', 'infrastructure', 'https://blog.cloudflare.com'),
  ('https://aws.amazon.com/blogs/aws/feed/', 'AWS Blog', 'Official AWS News Blog', 'infrastructure', 'https://aws.amazon.com/blogs/aws'),
  -- Platform (開発プラットフォーム)
  ('https://github.blog/feed/', 'GitHub Blog', 'Official GitHub blog', 'platform', 'https://github.blog')
on conflict (url) do nothing;
