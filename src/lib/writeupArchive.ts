import type { CSSProperties } from 'react';

export const platformNames = { hackthebox: 'Hack The Box', tryhackme: 'TryHackMe', vulnhub: 'VulnHub' };
export const difficulties = ['easy', 'medium', 'hard', 'insane'] as const;
const difficultyColors = { easy: '158 68% 68%', medium: '40 90% 72%', hard: '326 85% 73%', insane: '264 85% 76%' };
export type ArchiveDifficulty = keyof typeof difficultyColors;
export const difficultyStyle = (difficulty: keyof typeof difficultyColors) => ({ '--entry-color': difficultyColors[difficulty] } as CSSProperties);
export const newestFirst = <T extends { date: string; publishedAt?: string }>(entries: T[]) => [...entries].sort((a, b) => (b.publishedAt ?? b.date).localeCompare(a.publishedAt ?? a.date));

/** Case-insensitive match of every whitespace-separated term against title, tags, OS and difficulty. */
export const matchesQuery = (entry: { title: string; tags: string[]; os: string; difficulty: string }, query: string) => {
  const terms = query.toLowerCase().split(/\s+/).filter(Boolean);
  if (!terms.length) return true;
  const haystack = [entry.title, entry.os, entry.difficulty, ...entry.tags].join(' ').toLowerCase();
  return terms.every(term => haystack.includes(term));
};
