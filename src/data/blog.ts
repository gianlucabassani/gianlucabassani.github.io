export interface BlogPost {
  id: string;
  title: string;
  tags: string[];
  date: string;
  summary: string;
  contentPath: string;
  previewImage?: string;
  icon?: string;
  coverImage?: string;
}

import blogData from './blog.json';

const blogPosts: BlogPost[] = blogData as BlogPost[];

export const getBlogPosts = (): BlogPost[] => {
  return [...blogPosts].sort(
    (first, second) => new Date(second.date).getTime() - new Date(first.date).getTime(),
  );
};

export const getBlogPostById = (id: string) => {
  return blogPosts.find(post => post.id === id);
};

export const loadBlogPostContent = async (contentPath: string): Promise<string> => {
  try {
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
