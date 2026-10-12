import { Link } from 'react-router-dom';
import { ArrowLeft, Calendar, FileText, Tag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BlogPost, getBlogPosts } from '@/data/blog';
import PageBackground from '@/components/PageBackground';

interface BlogListViewProps {
  onBack: () => void;
  onPostSelect: (post: BlogPost) => void;
}

const BlogListView = ({ onBack, onPostSelect }: BlogListViewProps) => {
  const posts = getBlogPosts();

  return (
    <div className="min-h-screen bg-background text-foreground cyber-grid relative overflow-hidden">
      <PageBackground
        primary="hsl(270,85%,65%)"
        secondary="hsl(325,90%,62%)"
        tertiary="hsl(185,95%,48%)"
        variant="scattered"
      />

      <div className="pt-8 pb-20 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <Button
              variant="outline"
              onClick={onBack}
              className="mb-6 border-accent/30 text-accent hover:bg-accent/10 hover:text-accent"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>

            <h1 className="text-4xl md:text-5xl font-display font-bold gradient-text-purple mb-4 tracking-tight">
              Blog
            </h1>
            <p className="text-xl text-muted-foreground">
              Notes, experiments, and lessons from cybersecurity and software development
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {posts.map((post) => (
              <Link key={post.id} to={`/blog/${post.id}`} className="content-card-link">
              <Card
                className="card-hover theme-purple border-accent/20 hover:ring-1 hover:ring-accent/20 cursor-pointer transition-all duration-300 hover:scale-[1.02]"
              >
                <CardHeader>
                  <CardTitle className="flex items-start gap-3 text-2xl">
                    <FileText className="w-6 h-6 mt-1 shrink-0 text-accent" />
                    {post.title}
                  </CardTitle>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground font-mono">
                    <Calendar className="w-4 h-4" />
                    {new Date(post.date).toLocaleDateString()}
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-6">{post.summary}</p>
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
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlogListView;
