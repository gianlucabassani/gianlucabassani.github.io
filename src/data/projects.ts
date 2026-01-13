export interface Project {
  id: string;
  title: string;
  category: 'tool' | 'webapp' | 'library' | 'security' | 'devops' | 'other';
  status: 'active' | 'completed' | 'archived' | 'in-progress';
  technologies: string[];
  tags: string[];
  date: string;
  summary: string;
  description: string;
  features: string[];
  githubUrl?: string;
  liveUrl?: string;
  contentPath?: string;
}

// Load projects metadata from JSON
import projectsData from './projects.json';

export const projects: Project[] = projectsData as Project[];

export const getProjectsByCategory = (category: string) => {
  return projects.filter(p => p.category === category);
};

export const getProjectsByStatus = (status: string) => {
  return projects.filter(p => p.status === status);
};

export const getProjectById = (id: string) => {
  return projects.find(p => p.id === id);
};

export const loadProjectContent = async (contentPath: string): Promise<string> => {
  try {
    const response = await fetch(`/src/data/projects/${contentPath}`);
    if (!response.ok) {
      throw new Error(`Failed to load project content: ${response.statusText}`);
    }
    return await response.text();
  } catch (error) {
    console.error('Error loading project content:', error);
    return '# Error\n\nFailed to load project content.';
  }
};