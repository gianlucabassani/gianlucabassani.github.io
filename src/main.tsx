import { createRoot, hydrateRoot } from 'react-dom/client';
import App from './App';
import type { InitialArticle } from './data/article';
import './index.css';
import './styles/portfolio.css';

const root = document.getElementById('root')!;
const data = document.getElementById('article-data');
const initialArticle: InitialArticle | undefined = data ? JSON.parse(data.textContent || 'null') : undefined;
if (initialArticle) hydrateRoot(root, <App initialArticle={initialArticle} />);
else createRoot(root).render(<App />);
