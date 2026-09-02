import { useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import { ArrowLeft, BookOpen, Calendar, Tag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BlogPost, loadBlogPostContent } from '@/data/blog';
import 'highlight.js/styles/github-dark.css';
import PageBackground from '@/components/PageBackground';

interface BlogViewProps {
  post: BlogPost;
  onBack: () => void;
}

const BlogView = ({ post, onBack }: BlogViewProps) => {
  const [content, setContent] = useState<string>('Loading...');
  const [isLoading, setIsLoading] = useState(true);
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const loadContent = async () => {
      setIsLoading(true);
      const markdownContent = await loadBlogPostContent(post.contentPath);
      setContent(markdownContent);
      setIsLoading(false);
    };

    loadContent();
  }, [post.contentPath]);

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
    <div className="min-h-screen bg-background cyber-grid relative overflow-hidden">
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
        <div className="max-w-4xl mx-auto px-4 py-4">
          <Button
            variant="outline"
            onClick={onBack}
            className="mb-4 font-mono border-accent/30 text-accent hover:bg-accent/10 hover:text-accent"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Blog
          </Button>

          <div className="flex items-center gap-2 mb-4 text-sm text-muted-foreground font-mono">
            <BookOpen className="w-5 h-5 text-accent" />
            BLOG POST
          </div>

          <h1 className="text-3xl font-display font-bold gradient-text-purple mb-2 tracking-tight">
            {post.title}
          </h1>

          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <Calendar className="w-4 h-4" />
            {new Date(post.date).toLocaleDateString()}
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8 relative z-10">
        <Card className="mb-8 card-hover theme-purple hover:ring-1 hover:ring-accent/20 border-accent/20">
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

        <Card className="card-hover theme-purple hover:ring-1 hover:ring-accent/20 border-accent/20">
          <CardContent className="p-8">
            {isLoading ? (
              <div className="text-center py-8">
                <div className="text-muted-foreground">Loading blog post...</div>
              </div>
            ) : (
              <div className="prose prose-invert prose-purple max-w-none [&>*]:max-w-none [&_pre]:overflow-x-hidden [&_pre]:whitespace-pre-wrap [&_pre]:break-words [&_code]:whitespace-pre-wrap [&_code]:break-words">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  rehypePlugins={[rehypeHighlight]}
                  components={{
                    code: ({ className, children, ...props }) => {
                      const match = /language-(\w+)/.exec(className || '');
                      const isInline = !className;

                      return !isInline && match ? (
                        <div className="my-2 rounded-lg border bg-muted/20" style={{ borderColor: `${accentColor}25` }}>
                          <div className="px-3 py-1.5 bg-muted/40 border-b" style={{ borderBottomColor: `${accentColor}25` }}>
                            <span className="text-xs text-muted-foreground font-mono">{match[1]}</span>
                          </div>
                          <pre className="p-4 overflow-x-hidden whitespace-pre-wrap break-words text-sm font-mono leading-relaxed">
                            <code className={className} {...props}>{children}</code>
                          </pre>
                        </div>
                      ) : (
                        <code className="bg-muted px-2 py-1 rounded text-sm font-mono text-foreground" {...props}>
                          {children}
                        </code>
                      );
                    },
                    h1: ({ children }) => (
                      <h1 className="text-3xl font-display font-bold gradient-text-purple mb-6 pb-2 border-b border-border">
                        {children}
                      </h1>
                    ),
                    h2: ({ children }) => (
                      <h2 className="text-2xl font-display font-semibold text-accent mt-8 mb-4">{children}</h2>
                    ),
                    h3: ({ children }) => (
                      <h3 className="text-xl font-display font-semibold text-foreground/90 mt-6 mb-3">{children}</h3>
                    ),
                    blockquote: ({ children }) => (
                      <blockquote className="border-l-4 pl-4 italic text-muted-foreground my-2" style={{ borderColor: accentColor }}>
                        {children}
                      </blockquote>
                    ),
                    p: ({ children }) => <p className="mb-4 text-foreground leading-relaxed">{children}</p>,
                    img: ({ src, alt, ...props }) => (
                      <img
                        src={src}
                        alt={alt}
                        className="my-6 max-w-full h-auto rounded-lg shadow-lg border border-border"
                        {...props}
                      />
                    ),
                    table: ({ children }) => (
                      <div className="overflow-x-auto my-6">
                        <table className="w-full border-collapse border border-border">{children}</table>
                      </div>
                    ),
                    th: ({ children }) => (
                      <th className="border border-border bg-muted p-2 text-left font-semibold">{children}</th>
                    ),
                    td: ({ children }) => <td className="border border-border p-2">{children}</td>,
                  }}
                >
                  {content}
                </ReactMarkdown>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default BlogView;
