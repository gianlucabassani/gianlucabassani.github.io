import { lazy, Suspense, type ComponentType } from 'react';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import type { InitialArticle } from './data/article';
import type { ArticlePageProps } from './pages/ArticlePage';
import LatestPublication from './components/LatestPublication';
import SectionMetadata from './components/SectionMetadata';

const Index = lazy(() => import('./pages/Index'));
const ArticlePage = lazy(() => import('./pages/ArticlePage'));
const TerminalPage = lazy(() => import('./pages/TerminalPage'));
const NotFound = lazy(() => import('./pages/NotFound'));

interface AppContentProps {
  initialArticle?: InitialArticle;
  ArticleComponent?: ComponentType<ArticlePageProps>;
}

export function AppContent({initialArticle, ArticleComponent = ArticlePage}: AppContentProps) {
  return <TooltipProvider>
    <a className="skip-link" href="#route-content">Skip to content</a>
    <SectionMetadata />
    <Toaster />
    <div id="route-content" tabIndex={-1}><Suspense fallback={<div className="route-loading" role="status">Loading page...</div>}>
      <Routes>
        {['/', '/about', '/projects', '/projects/:id', '/boxes', '/boxes/:platform', '/ctf', '/blog', '/skills', '/certifications'].map(path => <Route key={path} path={path} element={<Index />} />)}
        <Route path="/blog/:id" element={<ArticleComponent kind="blog" initialArticle={initialArticle} />} />
        <Route path="/boxes/:platform/:id" element={<ArticleComponent kind="writeup" initialArticle={initialArticle} />} />
        <Route path="/ctf/:id" element={<ArticleComponent kind="ctf" initialArticle={initialArticle} />} />
        <Route path="/terminal" element={<TerminalPage />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense></div>
    <LatestPublication />
  </TooltipProvider>;
}

export default function App({initialArticle}: {initialArticle?:InitialArticle}) {
  return <BrowserRouter><AppContent initialArticle={initialArticle} /></BrowserRouter>;
}
