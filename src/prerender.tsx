import { renderToString } from 'react-dom/server';
import { StaticRouter } from 'react-router-dom/server';
import { AppContent } from './App';
import ArticlePage from './pages/ArticlePage';
import type { InitialArticle } from './data/article';

export function renderArticle(article:InitialArticle) {
  return renderToString(<StaticRouter location={`/${article.route}/`}>
    <AppContent initialArticle={article} ArticleComponent={ArticlePage} />
  </StaticRouter>);
}

import BlogListView from './components/BlogListView';
import SiteNavigation from './components/SiteNavigation';
import type { BlogPost } from './data/blog';

export function renderBlogIndex(posts: BlogPost[]) {
  return renderToString(<StaticRouter location="/blog/"><SiteNavigation /><BlogListView posts={posts} onBack={() => {}} /></StaticRouter>);
}
