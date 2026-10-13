import type { BlogPost } from './blog';
import type { Writeup } from './writeups';
import type { CTFWriteup } from './ctf';

export type InitialArticle = {
  route: string;
  content: string;
} & ({kind:'blog'; entry:BlogPost} | {kind:'writeup'; entry:Writeup} | {kind:'ctf'; entry:CTFWriteup});
