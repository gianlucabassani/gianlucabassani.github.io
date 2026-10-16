import ReaderLayout from '@/components/ReaderLayout';
import ArticleNavigation from '@/components/ArticleNavigation';
import useArticleContent from '@/hooks/use-article-content';
import ArticleMetadata from '@/components/ArticleMetadata';
import ArticleContent from '@/components/ArticleContent';
import { useEffect, useState } from 'react';
import { BookOpen, Calendar, Tag } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
          <ArticleNavigation title={post.title} content={content} parent={{label:'Blog', path:'/blog'}} />




          <h1 className="text-2xl sm:text-3xl font-display font-bold reader-title mb-2 tracking-tight">
            {post.title}
          </h1>

          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <Calendar className="w-4 h-4" />
            {new Date(post.date).toLocaleDateString('en-GB', {day:'numeric', month:'short', year:'numeric', timeZone:'UTC'})}
          </div>
        </div>
      </div>

      <ReaderLayout content={content} title={post.title}>
        <Card className="mb-6 reader-summary theme-purple hover:ring-1 hover:ring-accent/20 border-accent/20">
          <CardHeader>
            <CardTitle className="flex items-center text-xl">
              <BookOpen className="w-5 h-5 mr-2 text-accent" />
              Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">{post.summary}</p>
            <div className="flex flex-wrap gap-2">
              {post.tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="tag">
                  <Tag className="w-3 h-3 mr-1" />
                  {tag}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        {post.coverImage && <img src={post.coverImage} alt="Voxel dungeon chest and encrypted save file illustration" className="article-cover" width={1200} height={630} />}
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
