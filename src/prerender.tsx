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
