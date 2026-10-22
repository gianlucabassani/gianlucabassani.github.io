import { difficultyStyle, type ArchiveDifficulty } from '@/lib/writeupArchive';
import { DecodeText } from './ScrollDecrypt';

const dateFormat = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' });
export function ArchiveDate({ date }: { date: string }) {
  const parsed = new Date(date);
  return <time dateTime={date}><DecodeText>{Number.isNaN(parsed.getTime()) ? date : dateFormat.format(parsed)}</DecodeText></time>;
}
export function Difficulty({ value }: { value: ArchiveDifficulty }) {
  return <span className="archive-difficulty" style={difficultyStyle(value)}><span aria-hidden="true" /><DecodeText>{value}</DecodeText></span>;
}
const glyphs: Record<string, string> = {
  latest: 'M5 0h2v5h4v2H5ZM1 2h2v2H1ZM0 5h2v3H0Zm1 4h2v2H1Zm3 2h5v1H4Zm6-2h2v2h-2Zm1-7h1v5h-1Z',
  all: 'M1 1h4v4H1Zm6 0h4v4H7ZM1 7h4v4H1Zm6 0h4v4H7Z',
  web: 'M1 1h10v10H1Zm1 3v6h8V4Zm1-2v1h1V2Zm2 0v1h1V2Z',
  pwn: 'M1 1h10v10H1Zm2 2v2h2v2H3v2h6V7H7V5h2V3H7v2H5V3Z',
  reversing: 'M1 2h7V0l4 4-4 4V6H3v3h5v2H1Z',
  crypto: 'M3 0h6v2h2v3h1v7H0V5h1V2h2Zm2 2v3h2V2ZM5 7v3h2V7Z',
  forensics: 'M1 0h7v2h2v2h2v8H1Zm2 2v8h7V5H7V2Zm1 4h4v1H4Zm0 2h4v1H4Z',
  web3: 'M4 0h4v2h2v2h2v4h-2v2H8v2H4v-2H2V8H0V4h2V2h2Zm0 4v4h4V4Z',
  ai: 'M3 0h1v2h4V0h1v2h2v8H1V2h2ZM3 4v2h2V4Zm4 0v2h2V4ZM3 8v1h6V8ZM3 11h2v1H3Zm4 0h2v1H7Z',
  osint: 'M3 0h5v1h2v2h1v5H9v2H7v1H3V9H1V7H0V3h1V1h2Zm0 3v4h4V3Zm6 6h2v2h1v1h-2v-1H9Z',
  misc: 'M4 0h4v3h4v4H8v5H4V7H0V3h4Z',
};
export function ArchiveGlyph({ category }: { category: string }) {
  return <svg className="archive-glyph" viewBox="0 0 12 12" aria-hidden="true"><path fillRule="evenodd" d={glyphs[category] ?? glyphs.misc} /></svg>;
}
