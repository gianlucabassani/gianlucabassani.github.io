import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { type BlogPost, getBlogPosts } from '@/data/blog';
import PageBackground from '@/components/PageBackground';
import BlogBook from '@/components/BlogBook';

interface BlogListViewProps {
  onBack: () => void;
  onPostSelect?: (post: BlogPost) => void;
  posts?: BlogPost[];
}

export default function BlogListView({onBack, posts = getBlogPosts()}: BlogListViewProps) {
  const sortedPosts = [...posts].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  return <div className="portfolio-page blog-index min-h-screen bg-background text-foreground relative">
    <PageBackground primary="hsl(315,80%,65%)" secondary="hsl(185,85%,65%)" tertiary="hsl(265,80%,70%)" />
    <main id="main-content" tabIndex={-1} className="portfolio-container relative z-10">
      <Button variant="outline" className="page-back" onClick={onBack}><ArrowLeft size={16} aria-hidden="true" />Back to Home</Button>
      <header className="portfolio-page-heading">
        <h1>Blog<span aria-hidden="true">.</span></h1>
        <p>Notes, experiments, and lessons from cybersecurity and software development</p>
      </header>
      <BlogBook posts={sortedPosts} />
    </main>
  </div>;
}
