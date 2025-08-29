export interface CTFWriteup {
  id: string;
  title: string;
  competition: string;
  category: 'web' | 'pwn' | 'crypto' | 'forensics' | 'reversing' | 'misc' | 'osint';
  difficulty: 'easy' | 'medium' | 'hard' | 'insane';
  points: number;
  tags: string[];
  date: string;
  summary: string;
  contentPath: string;
}

// Load CTF writeups metadata from JSON
import ctfData from './ctf.json';

export const ctfWriteups: CTFWriteup[] = ctfData as CTFWriteup[];

export const getCTFWriteupsByCategory = (category: string) => {
  return ctfWriteups.filter(w => w.category === category);
};

export const getCTFWriteupsByDifficulty = (difficulty: string) => {
  return ctfWriteups.filter(w => w.difficulty === difficulty);
};

export const getCTFWriteupById = (id: string) => {
  return ctfWriteups.find(w => w.id === id);
};

export const loadCTFWriteupContent = async (contentPath: string): Promise<string> => {
  try {
    // fetch from /blog/ in the public folder
    const response = await fetch(`/ctf/${contentPath}`);
    if (!response.ok) {
      throw new Error(`Failed to load ctf post: ${response.statusText}`);
    }
    return await response.text();
  } catch (error) {
    console.error('Error loading ctf post content:', error);
    return '# Error\n\nFailed to load ctf post content.';
  }
};