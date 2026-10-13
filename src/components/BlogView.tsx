import ArticleNavigation from '@/components/ArticleNavigation';
import useArticleContent from '@/hooks/use-article-content';
import { Link } from 'react-router-dom';
import ArticleMetadata from '@/components/ArticleMetadata';
import ArticleContent from '@/components/ArticleContent';
import { useEffect, useState } from 'react';
import { ArrowLeft, BookOpen, Calendar, Tag } from 'lucide-react';
import { Button } from '@/components/ui/button';
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
        <div className="reader-container mx-auto px-4 py-4">
          <ArticleNavigation title={post.title} content={content} parent={{label:'Blog', path:'/blog'}} />
          <Button
            variant="outline"
            asChild
            className="mb-4 font-mono border-accent/30 text-accent hover:bg-accent/10 hover:text-accent"
          >
            <Link to="/blog">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Blog
            </Link>
          </Button>

          <div className="flex items-center gap-2 mb-4 text-sm text-muted-foreground font-mono">
            <BookOpen className="w-5 h-5 text-accent" />
            BLOG POST
          </div>

          <h1 className="text-2xl sm:text-3xl font-display font-bold gradient-text-purple mb-2 tracking-tight">
            {post.title}
          </h1>

          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <Calendar className="w-4 h-4" />
            {new Date(post.date).toLocaleDateString('en-GB', {day:'numeric', month:'short', year:'numeric', timeZone:'UTC'})}
          </div>
        </div>
      </div>

      <div className="reader-container mx-auto px-4 py-6 sm:py-8 relative z-10">
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
              <ArticleContent content={content} theme={'purple'} />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default BlogView;
