import { useLocation, useNavigate, useParams } from 'react-router-dom';
import BlogView from '@/components/BlogView';
import WriteupView from '@/components/WriteupView';
import CTFView from '@/components/CTFView';
import NotFound from './NotFound';
import { getBlogPostById } from '@/data/blog';
import { writeups } from '@/data/writeups';
import { ctfWriteups } from '@/data/ctf';
import type { InitialArticle } from '@/data/article';

export interface ArticlePageProps {
  kind:InitialArticle['kind'];
  initialArticle?:InitialArticle;
}

export default function ArticlePage({kind, initialArticle}: ArticlePageProps) {
  const {id, platform} = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const initial = initialArticle?.route === location.pathname.replace(/^\/+|\/+$/g, '') ? initialArticle : undefined;
  if (kind === 'blog') {
    const post = initial?.kind === 'blog' ? initial.entry : getBlogPostById(id || '');
    return post ? <BlogView key={post.id} post={post} initialContent={initial?.content} onBack={() => navigate('/blog')} /> : <NotFound />;
  }
  if (kind === 'writeup') {
    const writeup = initial?.kind === 'writeup' ? initial.entry : writeups.find(entry => entry.id === id && entry.platform === platform);
    return writeup ? <WriteupView key={writeup.id} writeup={writeup} initialContent={initial?.content} onBack={() => navigate(`/boxes/${platform}`)} /> : <NotFound />;
  }
  const ctf = initial?.kind === 'ctf' ? initial.entry : ctfWriteups.find(entry => entry.id === id);
  return ctf ? <CTFView key={ctf.id} ctfWriteup={ctf} initialContent={initial?.content} onBack={() => navigate('/ctf')} /> : <NotFound />;
}
