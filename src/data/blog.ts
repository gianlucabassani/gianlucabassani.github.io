export interface BlogPost {
  id: string;
  title: string;
  category: string;
  tags: string[];
  date: string;
  readTime: string;
  summary: string;
  contentPath: string;
}

// Load blog posts metadata from JSON
import blogData from './blog.json';

export const blogPosts: BlogPost[] = blogData as BlogPost[];

export const getBlogPostsByCategory = (category: string) => {
  return blogPosts.filter(p => p.category === category);
};

export const getBlogPostById = (id: string) => {
  return blogPosts.find(p => p.id === id);
};

export const loadBlogPostContent = async (contentPath: string): Promise<string> => {
  try {
    // fetch from /blog/ in the public folder
    const response = await fetch(`/blog/${contentPath}`);
    if (!response.ok) {
      throw new Error(`Failed to load blog post: ${response.statusText}`);
    }
    return await response.text();
  } catch (error) {
    console.error('Error loading blog post content:', error);
    return '# Error\n\nFailed to load blog post content.';
  }
};