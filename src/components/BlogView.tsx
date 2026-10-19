import ArticleSummary from '@/components/ArticleSummary';
import BlogRelatedLinks from '@/components/BlogRelatedLinks';
import ReaderLayout from '@/components/ReaderLayout';
import ArticleNavigation from '@/components/ArticleNavigation';
import useArticleContent from '@/hooks/use-article-content';
import ArticleMetadata from '@/components/ArticleMetadata';
import ArticleContent from '@/components/ArticleContent';
import { useEffect, useState } from 'react';
import { Calendar } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { BlogPost, loadBlogPostContent } from '@/data/blog';
import PageBackground from '@/components/PageBackground';

interface BlogViewProps {
  post: BlogPost;
  onBack: () => void;
  initialContent?: string;
}

const BlogView = ({ post, onBack, initialContent }: BlogViewProps) => {
  const [scrollProgress, setScrollProgress] = useState(0);

  const {content, isLoading} = useArticleContent(post.contentPath, loadBlogPostContent, initialContent);

  useEffect(() => {
    const handleScroll = () => {
      const scrollableHeight = document.documentElement.scrollHeight - window.innerHeight;
      setScrollProgress(scrollableHeight > 0 ? (window.scrollY / scrollableHeight) * 100 : 0);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const accentColor = 'hsl(270,85%,65%)';

  return (
    <div className="min-h-screen bg-background cyber-grid reader-page relative">
      <ArticleMetadata previewImage={post.previewImage} title={post.title} summary={post.summary} date={post.date} path={`/blog/${post.id}`} />
      <PageBackground
        primary={accentColor}
        secondary="hsl(325,90%,62%)"
        variant="scattered"
      />

      <div className="fixed top-0 left-0 w-full h-1 bg-muted z-50">
        <div
          className="h-full transition-all duration-100"
          style={{ width: `${scrollProgress}%`, backgroundImage: 'var(--gradient-purple)' }}
        />
      </div>

      <div className="bg-background/80 backdrop-blur-md border-b border-border relative z-10">
        <div className="reader-header mx-auto px-4 py-4">
          <ArticleNavigation content={content} />

          <h1 className="text-2xl sm:text-3xl font-display font-bold reader-title mb-2 tracking-tight">
            {post.title}
          </h1>

          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <Calendar className="w-4 h-4" />
            {new Date(post.date).toLocaleDateString('en-GB', {day:'numeric', month:'short', year:'numeric', timeZone:'UTC'})}
          </div>
        </div>
      </div>

      <ReaderLayout content={content} title={post.title}
        related={post.relatedLinks?.length ? <BlogRelatedLinks links={post.relatedLinks} /> : undefined}>
        <div className="reader-intro">
          {post.coverImage && <img src={post.coverImage} alt="Voxel dungeon chest and encrypted save file illustration" className="article-cover" width={1200} height={630} />}
          <ArticleSummary summary={post.summary} tags={post.tags} />
        </div>
        <Card className="reader-article theme-purple border-accent/20">
          <CardContent className="reader-content">
            {isLoading ? (
              <p role="status" className="text-muted-foreground py-8 text-center">Loading article...</p>
            ) : (
              <ArticleContent title={post.title} content={content} theme={'purple'} />
            )}
          </CardContent>
        </Card>
      </ReaderLayout>
    </div>
  );
};

export default BlogView;
