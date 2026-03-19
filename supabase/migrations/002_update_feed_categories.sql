-- Update feeds table: add new categories and reclassify existing feeds

-- Update Mercari, ZOZO, Classmethod to 'engineering'
update feeds set category = 'engineering'
where url in (
  'https://engineering.mercari.com/blog/feed.xml',
  'https://techblog.zozo.com/feed',
  'https://dev.classmethod.jp/feed/'
);

-- Update Zenn, Qiita to 'community'
update feeds set category = 'community'
where url in (
  'https://zenn.dev/feed',
  'https://qiita.com/popular-items/feed'
);
