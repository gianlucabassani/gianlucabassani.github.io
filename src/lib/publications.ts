export interface Publication {
  title: string;
  date: string;
  path: string;
  kind: 'Article' | 'Writeup' | 'CTF solve';
  image?: string;
}

export function newestPublication(entries: Publication[], now = new Date()) {
  const today = now.toISOString().slice(0, 10);
  const newest = entries.filter(entry => Number.isFinite(Date.parse(entry.date)) && entry.date <= today)
    .sort((a, b) => b.date.localeCompare(a.date) || a.path.localeCompare(b.path))[0];
  return newest ? {...newest, key: `${newest.path}:${newest.date}`} : undefined;
}
