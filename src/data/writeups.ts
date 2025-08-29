export interface Writeup {
  id: string;
  title: string;
  platform: 'hackthebox' | 'tryhackme' | 'vulnhub';
  difficulty: 'easy' | 'medium' | 'hard' | 'insane';
  os: 'linux' | 'windows' | 'other';
  tags: string[];
  date: string;
  summary: string;
  contentPath: string;
}

// Load writeups metadata from JSON
import writeupsData from './writeups.json';

export const writeups: Writeup[] = writeupsData as Writeup[];

export const getWriteupsByPlatform = (platform: string) => {
  return writeups.filter(w => w.platform === platform);
};

export const getWriteupsByDifficulty = (platform: string, difficulty: string) => {
  return writeups.filter(w => w.platform === platform && w.difficulty === difficulty);
};

export const getWriteupById = (id: string) => {
  return writeups.find(w => w.id === id);
};
export const loadWriteupContent = async (contentPath: string): Promise<string> => {
  try {
    // fetch from /writeups/ in the public folder
    const response = await fetch(`/writeups/${contentPath}`);
    if (!response.ok) {
      throw new Error(`Failed to load writeup: ${response.statusText}`);
    }
    return await response.text();
  } catch (error) {
    console.error('Error loading writeup content:', error);
    return '# Error\n\nFailed to load writeup content.';
  }
};
