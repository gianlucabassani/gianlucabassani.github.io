import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Terminal as TerminalIcon, X } from 'lucide-react';
import skillsData from '@/data/skills';
import { projects } from '@/data/projects';
import { ctfWriteups } from '@/data/ctf';
import { writeups } from '@/data/writeups';
import { getBlogPosts } from '@/data/blog';
import { contactLinks } from '@/data/profile';
import { skillGroups } from '@/data/skillGroups';

interface TerminalProps {
  onClose?: () => void;
}

interface Entry {
  /** Working directory shown in the prompt; omitted for system lines. */
  prompt?: string;
  command?: string;
  output: React.ReactNode;
}

// --- JOKES LIST ---
const jokes = [
  "There are 10 types of people: those who understand binary, and those who don't.",
  "Why do programmers wear glasses? Because they can't C#.",
  "What is a programmer's favorite hangout place? Foo Bar.",
  "How many programmers does it take to change a light bulb? None, it's a hardware problem.",
  "Cybersecurity is like the IT version of lockpicking, except the lock is made of sand, the door is open, and there's a guy inside trying to sell you a VPN.",
  "If at first you don't succeed, call it version 1.0.",
  "An SQL query walks into a bar, walks up to two tables and asks, 'Can I join you?'",
  "Why did the developer go broke? Because he used up all his cache.",
  "A TCP packet walks into a bar. 'I'd like a beer.' 'You'd like a beer?' 'Yes, a beer.'",
  "IP addresses are like opinions. Everyone has one, but yours is probably dynamic and mine is static.",
  "What do you call a group of 8 Hobbits? A Hobbyte.",
  "Why do Java programmers wear glasses? Because they don't C#.",
  "A hacker walks into a bar, sits down, and orders a null pointer exception.",
  "sudo make me a sandwich. — That's not in your sudoers file. This incident will be reported.",
];

// --- PONG MINIGAME COMPONENT ---
// Canvas dimensions — bigger for a more enjoyable experience
const CANVAS_W = 560;
const CANVAS_H = 300;

function PongGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [playerScore, setPlayerScore] = useState(0);
  const [aiScore, setAiScore] = useState(0);
  const [gameState, setGameState] = useState<'idle' | 'playing' | 'gameover'>('idle');
  const [winner, setWinner] = useState<string | null>(null);

  const keys = useRef<{ w: boolean; s: boolean; ArrowUp: boolean; ArrowDown: boolean }>({
    w: false, s: false, ArrowUp: false, ArrowDown: false,
  });

  const paddleHeight = 60;
  const paddleWidth = 8;
  const ball = useRef({ x: CANVAS_W / 2, y: CANVAS_H / 2, vx: 4, vy: 2.5, radius: 6 });
  const playerY = useRef((CANVAS_H - paddleHeight) / 2);
  const aiY = useRef((CANVAS_H - paddleHeight) / 2);
  const animationId = useRef<number | null>(null);

  const resetBall = (direction: number) => {
    ball.current.x = CANVAS_W / 2;
    ball.current.y = CANVAS_H / 2;
    ball.current.vx = direction * 4.5;
    ball.current.vy = (Math.random() * 2 - 1) * 2.5;
  };

  const handleStart = () => {
    setPlayerScore(0);
    setAiScore(0);
    setWinner(null);
    setGameState('playing');
    playerY.current = (CANVAS_H - paddleHeight) / 2;
    aiY.current = (CANVAS_H - paddleHeight) / 2;
    resetBall(Math.random() > 0.5 ? 1 : -1);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['w', 's', 'ArrowUp', 'ArrowDown'].includes(e.key)) {
        if (gameState === 'playing') e.preventDefault();
        if (e.key === 'w') keys.current.w = true;
        if (e.key === 's') keys.current.s = true;
        if (e.key === 'ArrowUp') keys.current.ArrowUp = true;
        if (e.key === 'ArrowDown') keys.current.ArrowDown = true;
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'w') keys.current.w = false;
      if (e.key === 's') keys.current.s = false;
      if (e.key === 'ArrowUp') keys.current.ArrowUp = false;
      if (e.key === 'ArrowDown') keys.current.ArrowDown = false;
    };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [gameState]);

  useEffect(() => {
    if (gameState !== 'playing') {
      if (animationId.current) cancelAnimationFrame(animationId.current);
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const update = () => {
      // Player paddle
      const speed = 5.5;
      if (keys.current.w || keys.current.ArrowUp)
        playerY.current = Math.max(0, playerY.current - speed);
      if (keys.current.s || keys.current.ArrowDown)
        playerY.current = Math.min(CANVAS_H - paddleHeight, playerY.current + speed);

      // AI paddle (lagging follow)
      const aiSpeed = 3.2;
      const targetY = ball.current.y - paddleHeight / 2;
      const diff = targetY - aiY.current;
      if (Math.abs(diff) > 2) {
        if (diff > 0) aiY.current = Math.min(CANVAS_H - paddleHeight, aiY.current + aiSpeed);
        else aiY.current = Math.max(0, aiY.current - aiSpeed);
      }

      // Ball movement
      ball.current.x += ball.current.vx;
      ball.current.y += ball.current.vy;

      // Wall bounce
      if (ball.current.y - ball.current.radius <= 0) {
        ball.current.y = ball.current.radius;
        ball.current.vy = -ball.current.vy;
      } else if (ball.current.y + ball.current.radius >= CANVAS_H) {
        ball.current.y = CANVAS_H - ball.current.radius;
        ball.current.vy = -ball.current.vy;
      }

      // Player paddle collision (left)
      const playerPaddleX = 14;
      if (ball.current.vx < 0 &&
        ball.current.x - ball.current.radius <= playerPaddleX + paddleWidth &&
        ball.current.x - ball.current.radius >= playerPaddleX &&
        ball.current.y >= playerY.current &&
        ball.current.y <= playerY.current + paddleHeight
      ) {
        ball.current.vx = Math.abs(ball.current.vx) * 1.04;
        const rel = (ball.current.y - (playerY.current + paddleHeight / 2)) / (paddleHeight / 2);
        ball.current.vy = rel * 4.5;
        ball.current.x = playerPaddleX + paddleWidth + ball.current.radius;
      }

      // AI paddle collision (right)
      const aiPaddleX = CANVAS_W - 14 - paddleWidth;
      if (ball.current.vx > 0 &&
        ball.current.x + ball.current.radius >= aiPaddleX &&
        ball.current.x + ball.current.radius <= aiPaddleX + paddleWidth &&
        ball.current.y >= aiY.current &&
        ball.current.y <= aiY.current + paddleHeight
      ) {
        ball.current.vx = -Math.abs(ball.current.vx) * 1.04;
        const rel = (ball.current.y - (aiY.current + paddleHeight / 2)) / (paddleHeight / 2);
        ball.current.vy = rel * 4.5;
        ball.current.x = aiPaddleX - ball.current.radius;
      }

      // Score
      if (ball.current.x < 0) {
        setAiScore((prev) => {
          const next = prev + 1;
          if (next >= 5) { setGameState('gameover'); setWinner('AI'); }
          else resetBall(1);
          return next;
        });
      } else if (ball.current.x > CANVAS_W) {
        setPlayerScore((prev) => {
          const next = prev + 1;
          if (next >= 5) { setGameState('gameover'); setWinner('Player'); }
          else resetBall(-1);
          return next;
        });
      }

      // --- RENDER ---
      // Background
      ctx.fillStyle = '#0b0812';
      ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

      // Subtle grid lines
      ctx.strokeStyle = 'rgba(183,156,245,0.05)';
      ctx.lineWidth = 1;
      for (let x = 0; x < CANVAS_W; x += 40) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, CANVAS_H); ctx.stroke();
      }
      for (let y = 0; y < CANVAS_H; y += 40) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(CANVAS_W, y); ctx.stroke();
      }

      // Center dashed line
      ctx.strokeStyle = 'rgba(255,255,255,0.1)';
      ctx.lineWidth = 2;
      ctx.setLineDash([8, 8]);
      ctx.beginPath();
      ctx.moveTo(CANVAS_W / 2, 0);
      ctx.lineTo(CANVAS_W / 2, CANVAS_H);
      ctx.stroke();
      ctx.setLineDash([]);

      // Player paddle — neon green
      const playerGrad = ctx.createLinearGradient(playerPaddleX, playerY.current, playerPaddleX + paddleWidth, playerY.current);
      playerGrad.addColorStop(0, '#7de3e8');
      playerGrad.addColorStop(1, '#4fc3d0');
      ctx.fillStyle = playerGrad;
      ctx.shadowColor = '#7de3e8';
      ctx.shadowBlur = 12;
      ctx.fillRect(playerPaddleX, playerY.current, paddleWidth, paddleHeight);

      // AI paddle — neon blue
      const aiGrad = ctx.createLinearGradient(aiPaddleX, aiY.current, aiPaddleX + paddleWidth, aiY.current);
      aiGrad.addColorStop(0, '#b79cf5');
      aiGrad.addColorStop(1, '#8f6fe0');
      ctx.fillStyle = aiGrad;
      ctx.shadowColor = '#b79cf5';
      ctx.shadowBlur = 12;
      ctx.fillRect(aiPaddleX, aiY.current, paddleWidth, paddleHeight);

      // Ball — glowing white
      ctx.shadowColor = '#ffffff';
      ctx.shadowBlur = 18;
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(ball.current.x, ball.current.y, ball.current.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;

      if (gameState === 'playing') {
        animationId.current = requestAnimationFrame(update);
      }
    };

    animationId.current = requestAnimationFrame(update);
    return () => { if (animationId.current) cancelAnimationFrame(animationId.current); };
  }, [gameState]);

  return (
    <div className="flex flex-col items-center gap-3 p-4 border border-border/60 bg-[#0b0812]/80 rounded-lg select-none mx-auto my-2 w-full max-w-[600px]">
      <div className="flex justify-between w-full font-mono text-xs px-1">
        <span className="text-secondary font-bold">YOU: {playerScore}</span>
        <span className="text-muted-foreground tracking-widest">⚡ PONG  •  First to 5 ⚡</span>
        <span className="text-accent font-bold">AI: {aiScore}</span>
      </div>

      <div className="relative border border-border/40 overflow-hidden rounded w-full" style={{ maxWidth: CANVAS_W }}>
        <canvas ref={canvasRef} width={CANVAS_W} height={CANVAS_H} className="block w-full" />

        {gameState === 'idle' && (
          <div className="absolute inset-0 bg-[#0b0812]/90 flex flex-col items-center justify-center text-center p-6 gap-4">
            <p className="text-muted-foreground text-xs leading-relaxed">
              Move your paddle with{' '}
              <span className="text-secondary font-bold font-mono">W / S</span>
              {' '}or{' '}
              <span className="text-secondary font-bold font-mono">↑ / ↓</span>
            </p>
            <button
              onClick={handleStart}
              className="px-6 py-2 bg-secondary/10 border border-secondary/40 text-secondary hover:bg-secondary/20 rounded font-mono font-bold text-sm uppercase tracking-widest transition-all"
            >
              ▶ Start Game
            </button>
          </div>
        )}

        {gameState === 'gameover' && (
          <div className="absolute inset-0 bg-[#0b0812]/90 flex flex-col items-center justify-center text-center p-6 gap-3">
            <p className={`text-lg font-bold font-mono uppercase tracking-widest ${winner === 'Player' ? 'text-secondary' : 'text-accent'}`}>
              {winner === 'Player' ? '🎉 VICTORY!' : '👾 AI WINS!'}
            </p>
            <p className="text-muted-foreground text-xs font-mono">
              Final: {playerScore} – {aiScore}
            </p>
            <button
              onClick={handleStart}
              className="px-6 py-2 bg-secondary/10 border border-secondary/40 text-secondary hover:bg-secondary/20 rounded font-mono font-bold text-sm uppercase tracking-widest transition-all"
            >
              ↺ Play Again
            </button>
          </div>
        )}
      </div>

      {gameState === 'playing' && (
        <div className="flex gap-3 w-full justify-center md:hidden mt-1">
          <button
            onMouseDown={() => { keys.current.w = true; }}
            onMouseUp={() => { keys.current.w = false; }}
            onTouchStart={() => { keys.current.w = true; }}
            onTouchEnd={() => { keys.current.w = false; }}
            className="flex-1 py-3 bg-muted border border-border text-foreground hover:bg-muted/80 rounded font-mono text-center font-bold text-sm"
          >UP</button>
          <button
            onMouseDown={() => { keys.current.s = true; }}
            onMouseUp={() => { keys.current.s = false; }}
            onTouchStart={() => { keys.current.s = true; }}
            onTouchEnd={() => { keys.current.s = false; }}
            className="flex-1 py-3 bg-muted border border-border text-foreground hover:bg-muted/80 rounded font-mono text-center font-bold text-sm"
          >DOWN</button>
        </div>
      )}
    </div>
  );
}

// --- VIRTUAL FILESYSTEM: the site, laid out as files ---
type FileNode = { kind: 'file'; text: string; url?: string; exec?: boolean };
type DirNode = { kind: 'dir'; children: Record<string, FsNode>; url?: string; locked?: boolean };
type FsNode = FileNode | DirNode;

const USER = 'guest';
const HOST = '0xpr1m3';
const SHELL = 'prsh';
const HOME = ['home', USER];
const file = (lines: (string | false | undefined)[], url?: string, exec = false): FileNode => ({ kind: 'file', text: lines.filter(line => line !== false && line !== undefined).join('\n'), url, exec });
const dir = (children: Record<string, FsNode>, url?: string, locked = false): DirNode => ({ kind: 'dir', children, url, locked });
const bar = (level: number) => `[${'#'.repeat(Math.round(level / 10))}${'.'.repeat(10 - Math.round(level / 10))}]`;

const root: DirNode = dir({
  home: dir({
    [USER]: dir({
      'README.md': file([
        '# You found the shell',
        '',
        'The whole site is mounted here as files.',
        '',
        '  ls, cd, cat, tree     look around',
        '  open <path>           jump to the real page',
        '  grep <word>           search projects, posts and writeups',
        '  fastfetch             system summary',
        '  help                  everything else',
        '',
        'Not every command is listed. Some files are hidden.',
      ]),
      'about.txt': file([
        'Gianluca Bassani (0xPr1m3)',
        '',
        'I’m into breaking systems, understanding how they work, and building',
        'around what I learn.',
        '',
        'Currently focused on Red Teaming, AI security, and automation. Big fan',
        'of digging into low-level mechanics to understand how systems actually',
        'work and turning curiosity into hands-on projects.',
        '',
        'Usually grinding on CTFs, Hack The Box, and Hextree.',
      ], '/about'),
      'skills.txt': file(skillGroups.flatMap(group => [`## ${group.title}`, ...group.skills.map(skill => `  ${skill.name.padEnd(30)} ${bar(skill.level)} ${skill.level}%`), '']), '/skills'),
      'contact.txt': file(['Open to collaboration.', '', ...contactLinks.map(link => `  ${link.label.padEnd(10)} ${link.href.replace(/^mailto:/, '')}`)], '/contact'),
      projects: dir(Object.fromEntries(projects.map(project => [`${project.id.toLowerCase()}.md`, file([
        `# ${project.title}`,
        `status: ${project.status}    category: ${project.category}    date: ${project.date}`,
        `stack:  ${project.technologies.join(', ')}`,
        `tags:   ${project.tags.join(', ')}`,
        '',
        project.description,
        '',
        '## Features',
        ...project.features.map(feature => `  - ${feature}`),
        '',
        project.githubUrl && `github  ${project.githubUrl}`,
        project.gitlabUrl && `gitlab  ${project.gitlabUrl}`,
        project.liveUrl && `live    ${project.liveUrl}`,
      ], `/projects/${project.id}`)])), '/projects'),
      blog: dir(Object.fromEntries(getBlogPosts().map(post => [`${post.id}.md`, file([
        `# ${post.title}`, `date: ${post.date}    tags: ${post.tags.join(', ')}`, '', post.summary,
      ], `/blog/${post.id}`)])), '/blog'),
      boxes: dir(Object.fromEntries(writeups.map(box => [`${box.id}.md`, file([
        `# ${box.title}`, `platform: ${box.platform}    os: ${box.os}    difficulty: ${box.difficulty}    date: ${box.date}`, `tags: ${box.tags.join(', ')}`, '', box.summary,
      ], `/boxes/${box.platform}/${box.id}`)])), '/boxes'),
      ctf: dir(Object.fromEntries(ctfWriteups.map(solve => [`${solve.id}.md`, file([
        `# ${solve.title}`, `event: ${solve.competition}    category: ${solve.category}    points: ${solve.points}    date: ${solve.date}`, `tags: ${solve.tags.join(', ')}`, '', solve.summary,
      ], `/ctf/${solve.id}`)])), '/ctf'),
      '.flag': file(['flag{y0u_r34d_th3_d0tf1l35_n1c3}', '', 'No points for this one. You get bragging rights.']),
      '.bash_history': file(['sudo rm -rf /var/log/*', 'nmap -sV 10.10.11.0/24', 'cat notes.txt | grep password', 'vim exploit.py', ':q', ':q!', ':wq!!!', 'man vim', 'nano exploit.py']),
    }, '/'),
  }),
  etc: dir({
    passwd: file(['root:x:0:0:root:/root:/bin/bash', `${USER}:x:1000:1000:visitor:/home/${USER}:/bin/${SHELL}`, 'prime:x:1337:1337:0xPr1m3:/home/prime:/bin/zsh']),
    shadow: file(['']),
    hostname: file([HOST]),
    'os-release': file(['NAME="PrimeOS"', 'VERSION="5.2 (Build, Break, Repeat)"', 'ID=primeos', 'HOME_URL="https://gianlucabassani.com"']),
  }),
  root: dir({}, undefined, true),
  tmp: dir({}),
});

const showPath = (parts: string[]) => { const path = `/${parts.join('/')}`; const home = `/${HOME.join('/')}`; return path === home ? '~' : path.startsWith(`${home}/`) ? `~${path.slice(home.length)}` : path; };
const resolvePath = (cwd: string[], path: string) => {
  const parts = path.startsWith('/') ? [] : path.startsWith('~') ? [...HOME] : [...cwd];
  for (const segment of path.replace(/^~/, '').split('/')) {
    if (!segment || segment === '.') continue;
    if (segment === '..') parts.pop(); else parts.push(segment);
  }
  return parts;
};
/** Case-insensitive walk; returns the node with its canonical path. */
const lookup = (parts: string[]): { node: FsNode; parts: string[] } | null => {
  let node: FsNode = root;
  const canonical: string[] = [];
  for (const part of parts) {
    if (node.kind !== 'dir') return null;
    const key = Object.keys(node.children).find(name => name.toLowerCase() === part.toLowerCase());
    if (!key) return null;
    canonical.push(key);
    node = node.children[key];
  }
  return { node, parts: canonical };
};
const walk = (node: FsNode, parts: string[], visit: (node: FileNode, parts: string[]) => void) => {
  if (node.kind === 'file') visit(node, parts);
  else if (!node.locked) for (const [name, child] of Object.entries(node.children)) walk(child, [...parts, name], visit);
};

const manual: [string, string, string][] = [
  ['ls', '[-la] [path]', 'list a directory'],
  ['cd', '[path]', 'change directory'],
  ['pwd', '', 'print the working directory'],
  ['cat', '<file>...', 'print a file'],
  ['tree', '[path]', 'show a directory as a tree'],
  ['open', '<path>', 'open the matching page of the site'],
  ['grep', '<word>', 'search every project, post and writeup'],
  ['fastfetch', '', 'system summary'],
  ['whoami', '', 'who you are here'],
  ['history', '', 'commands typed this session'],
  ['pong', '', 'play Pong in the terminal'],
  ['fortune', '', 'a random bad joke'],
  ['clear', '', 'clear the screen'],
  ['exit', '', 'leave the shell'],
  ['help', '', 'this list'],
];
const hiddenCommands = ['neofetch', 'id', 'hostname', 'uname', 'date', 'uptime', 'echo', 'man', 'which', 'sudo', 'su', 'rm', 'vim', 'vi', 'nano', 'emacs', 'ssh', 'ping', 'curl', 'wget', 'nmap', 'cowsay', 'sl', 'joke', 'ascii', 'coffee', 'make', 'logout', 'xdg-open', 'll', 'touch', 'mkdir', 'top', 'htop', 'ps'];
const allCommands = [...manual.map(([name]) => name), ...hiddenCommands];
const quickCommands = ['ls', 'cat README.md', 'fastfetch', 'help', 'clear'];

const logo = [
  '           /\\           ',
  '          /  \\          ',
  '         / /\\ \\         ',
  '        / /  \\ \\        ',
  '       / / 0x \\ \\       ',
  '      / /  __  \\ \\      ',
  '     / /  /  \\  \\ \\     ',
  '    / /__/ /\\ \\__\\ \\    ',
  '   /______/  \\______\\   ',
  '                        ',
  '     B U I L D          ',
  '       B R E A K        ',
  '         R E P E A T    ',
];
const logoTone = ['text-secondary', 'text-secondary', 'text-secondary', 'text-accent', 'text-accent', 'text-accent', 'text-primary', 'text-primary', 'text-primary', '', 'text-secondary', 'text-accent', 'text-primary'];
const swatches = ['bg-background', 'bg-destructive', 'bg-success', 'bg-warning', 'bg-accent', 'bg-primary', 'bg-secondary', 'bg-foreground'];

function browserName() {
  const agent = navigator.userAgent;
  const match = agent.match(/(Firefox|Edg|OPR|Chrome|Safari)\/(\d+)/);
  if (!match) return 'unknown browser';
  const names: Record<string, string> = { Edg: 'Edge', OPR: 'Opera' };
  return `${names[match[1]] ?? match[1]} ${match[2]}`;
}
function uptime() {
  const seconds = Math.floor(performance.now() / 1000);
  const minutes = Math.floor(seconds / 60);
  return minutes ? `${minutes} min${minutes === 1 ? '' : 's'}, ${seconds % 60} secs` : `${seconds} secs`;
}

function Fastfetch() {
  const device = navigator as Navigator & { deviceMemory?: number };
  const rows: [string, string][] = [
    ['OS', 'PrimeOS 5.2 (Build, Break, Repeat) x86_64'],
    ['Host', 'gianlucabassani.com'],
    ['Kernel', `React ${React.version}`],
    ['Uptime', uptime()],
    ['Packages', `${projects.length} (projects), ${writeups.length} (boxes), ${ctfWriteups.length} (ctf), ${getBlogPosts().length} (blog)`],
    ['Shell', `${SHELL} 1.0`],
    ['Display', `${window.innerWidth}x${window.innerHeight} @ ${window.devicePixelRatio}x`],
    ['WM', 'Vite + react-router'],
    ['Terminal', browserName()],
    ['CPU', `${navigator.hardwareConcurrency ?? '?'} cores (yours, borrowed)`],
    ['Memory', device.deviceMemory ? `${device.deviceMemory} GiB reported` : 'not telling'],
    ['Locale', navigator.language],
    ['Focus', 'Red Teaming, AI Security, Automation'],
    ['Team', 'pwnthem0le'],
  ];
  return <div className="terminal-fetch">
    <pre className="terminal-fetch-logo" aria-hidden="true">{logo.map((line, index) => <span key={index} className={logoTone[index]}>{line}{'\n'}</span>)}</pre>
    <div className="terminal-fetch-info">
      <p><span className="text-primary font-bold">{USER}</span>@<span className="text-primary font-bold">{HOST}</span></p>
      <p className="text-muted-foreground">{'-'.repeat(USER.length + HOST.length + 1)}</p>
      {rows.map(([key, value]) => <p key={key}><span className="text-secondary font-bold">{key}</span>: {value}</p>)}
      <p className="terminal-fetch-swatches" aria-hidden="true">{swatches.map(tone => <span key={tone} className={tone} />)}</p>
    </div>
  </div>;
}

/** Plain file output: headings tinted, URLs clickable. */
function FileText({ text }: { text: string }) {
  return <pre className="terminal-text">{text.split('\n').map((line, index) => {
    const tone = line.startsWith('# ') ? 'text-secondary font-bold' : line.startsWith('## ') ? 'text-primary font-bold' : line.startsWith('flag{') ? 'text-success font-bold' : '';
    const pieces = line.split(/(https?:\/\/\S+)/);
    return <span key={index} className={tone}>{pieces.map((piece, at) => /^https?:\/\//.test(piece) ? <a key={at} href={piece} target="_blank" rel="noreferrer" className="text-accent hover:underline">{piece}</a> : piece)}{'\n'}</span>;
  })}</pre>;
}

const Err = ({ children }: { children: React.ReactNode }) => <p className="text-destructive">{children}</p>;
const Dim = ({ children }: { children: React.ReactNode }) => <p className="text-muted-foreground">{children}</p>;

export default function Terminal({ onClose }: TerminalProps) {
  const [input, setInput] = useState('');
  const [entries, setEntries] = useState<Entry[]>([]);
  const [cwd, setCwd] = useState<string[]>(HOME);
  const [typed, setTyped] = useState<string[]>([]);
  const [typedIndex, setTypedIndex] = useState(-1);
  const outputRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const runRef = useRef<(line: string) => void>(() => {});
  const booted = useRef(false);
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  /** Text that runs a command when clicked, so the shell also works by mouse and touch. */
  const run = (command: string, label: React.ReactNode = command, className = '') => <button type="button" className={`terminal-command ${className}`} onClick={event => { event.stopPropagation(); runRef.current(command); inputRef.current?.focus({ preventScroll: true }); }}>{label}</button>;

  const listing = (node: DirNode, parts: string[], flags: string) => {
    const names = Object.keys(node.children).filter(name => flags.includes('a') || !name.startsWith('.')).sort((a, b) => a.localeCompare(b));
    const target = (name: string) => showPath([...parts, name]);
    const label = (name: string) => {
      const child = node.children[name];
      if (child.kind === 'dir') return run(`cd ${target(name)} && ls`, `${name}/`, 'text-secondary font-bold');
      return run(`cat ${target(name)}`, name, child.exec ? 'text-success' : name.startsWith('.') ? 'text-muted-foreground' : 'text-foreground');
    };
    if (flags.includes('l')) return <div>
      <Dim>total {names.length}</Dim>
      {names.map(name => {
        const child = node.children[name];
        const size = child.kind === 'dir' ? 4096 : child.text.length;
        return <p key={name} className="whitespace-pre"><span className="text-muted-foreground">{child.kind === 'dir' ? 'drwxr-xr-x' : child.exec ? '-rwxr-xr-x' : '-rw-r--r--'} {USER} {USER} {String(size).padStart(5)} </span>{label(name)}</p>;
      })}
    </div>;
    return names.length ? <div className="terminal-listing">{names.map(name => <span key={name}>{label(name)}</span>)}</div> : null;
  };

  const tree = (node: DirNode, prefix = ''): string[] => {
    const names = Object.keys(node.children).filter(name => !name.startsWith('.')).sort((a, b) => a.localeCompare(b));
    return names.flatMap((name, index) => {
      const last = index === names.length - 1;
      const child = node.children[name];
      return [`${prefix}${last ? '└── ' : '├── '}${name}${child.kind === 'dir' ? '/' : ''}`, ...(child.kind === 'dir' && !child.locked ? tree(child, `${prefix}${last ? '    ' : '│   '}`) : [])];
    });
  };

  /** Runs one command. Returns its output and the directory it leaves the shell in. */
  const execute = (raw: string, at: string[], session: string[]): { output: React.ReactNode; cwd: string[]; clear?: boolean } => {
    const argv = raw.trim().split(/\s+/);
    const command = argv[0].toLowerCase();
    const flags = argv.slice(1).filter(arg => arg.startsWith('-')).join('');
    const args = argv.slice(1).filter(arg => !arg.startsWith('-'));
    const rest = raw.trim().slice(argv[0].length).trim();
    const done = (output: React.ReactNode, cwd = at) => ({ output, cwd });
    const go = (path: string) => { window.setTimeout(() => navigate(path), 450); };

    switch (command) {
      case 'help':
        return done(<div>
          <p className="text-secondary font-bold">{SHELL} 1.0, a read-only shell over this website</p>
          <p>&nbsp;</p>
          {manual.map(([name, usage, about]) => <p key={name} className="terminal-help-row"><span>{run(usage.includes('<') ? `man ${name}` : name, name, 'text-primary font-bold')} <span className="text-muted-foreground">{usage}</span></span><span>{about}</span></p>)}
          <p>&nbsp;</p>
          <Dim>Tab completes, up/down recall, Ctrl+L clears, Ctrl+C cancels. Chain with && or ;</Dim>
          <Dim>Start with {run('cat README.md')}. Not everything is documented.</Dim>
        </div>);

      case 'man': {
        const page = manual.find(([name]) => name === args[0]);
        if (!args[0]) return done(<p>What manual page do you want?</p>);
        if (!page) return done(<Err>No manual entry for {args[0]}</Err>);
        return done(<div><p className="text-secondary font-bold">{page[0].toUpperCase()}(1)</p><p>&nbsp;</p><p>NAME</p><p>{'    '}{page[0]} - {page[2]}</p><p>&nbsp;</p><p>SYNOPSIS</p><p className="whitespace-pre">{'    '}{page[0]} {page[1]}</p></div>);
      }

      case 'pwd':
        return done(<p>/{at.join('/')}</p>);

      case 'll':
      case 'ls': {
        const mode = command === 'll' ? `${flags}la` : flags;
        const outputs = (args.length ? args : ['.']).map(path => {
          const found = lookup(resolvePath(at, path));
          if (!found) return <Err key={path}>ls: cannot access '{path}': No such file or directory</Err>;
          if (found.node.kind === 'file') return <p key={path}>{path}</p>;
          if (found.node.locked) return <Err key={path}>ls: cannot open directory '{path}': Permission denied</Err>;
          return <div key={path}>{args.length > 1 && <Dim>{path}:</Dim>}{listing(found.node, found.parts, mode)}</div>;
        });
        return done(<>{outputs}</>);
      }

      case 'cd': {
        const found = lookup(resolvePath(at, args[0] ?? '~'));
        if (!found) return done(<Err>cd: no such file or directory: {args[0]}</Err>);
        if (found.node.kind === 'file') return done(<Err>cd: not a directory: {args[0]}</Err>);
        if (found.node.locked) return done(<Err>cd: permission denied: {args[0]}</Err>);
        return done(null, found.parts);
      }

      case 'cat': {
        if (!args.length) return done(<Dim>cat: nothing to read. Try {run('cat README.md')}</Dim>);
        return done(<>{args.map(path => {
          const found = lookup(resolvePath(at, path));
          if (!found) return <Err key={path}>cat: {path}: No such file or directory</Err>;
          if (found.node.kind === 'dir') return <Err key={path}>cat: {path}: Is a directory</Err>;
          if (found.parts.join('/') === 'etc/shadow') return <Err key={path}>cat: {path}: Permission denied</Err>;
          return <div key={path}><FileText text={found.node.text} />{found.node.url && <Dim>page: {run(`open ${showPath(found.parts)}`, `open ${showPath(found.parts)}`, 'text-accent')}</Dim>}</div>;
        })}</>);
      }

      case 'tree': {
        const found = lookup(resolvePath(at, args[0] ?? '.'));
        if (!found || found.node.kind === 'file') return done(<Err>tree: {args[0]}: not a directory</Err>);
        const lines = tree(found.node);
        return done(<pre className="terminal-text"><span className="text-secondary font-bold">{showPath(found.parts)}{'\n'}</span>{lines.join('\n')}{'\n\n'}<span className="text-muted-foreground">{lines.filter(line => line.endsWith('/')).length} directories, {lines.filter(line => !line.endsWith('/')).length} files</span></pre>);
      }

      case 'xdg-open':
      case 'open': {
        let found = lookup(resolvePath(at, args[0] ?? '.'));
        if (!found && args[0]) {
          // Bare names work too: `open nidavellir`.
          const wanted = args[0].toLowerCase().replace(/\.md$/, '');
          walk(root, [], (node, parts) => { if (!found && node.url && parts[parts.length - 1].toLowerCase().replace(/\.(md|txt)$/, '') === wanted) found = { node, parts }; });
        }
        if (!found) return done(<Err>open: {args[0]}: No such file or directory</Err>);
        if (!found.node.url) return done(<Err>open: {args[0] ?? '.'}: no page is associated with this path</Err>);
        go(found.node.url);
        return done(<Dim>Opening {found.node.url} ...</Dim>);
      }

      case 'grep': {
        if (!args[0]) return done(<Dim>usage: grep &lt;word&gt;</Dim>);
        const needle = args.join(' ').toLowerCase();
        const hits: { path: string; line: string }[] = [];
        walk(lookup(HOME)!.node, HOME, (node, parts) => {
          if (parts[parts.length - 1].startsWith('.')) return;
          const line = node.text.split('\n').find(text => text.toLowerCase().includes(needle));
          if (line) hits.push({ path: showPath(parts), line: line.trim().slice(0, 110) });
        });
        if (!hits.length) return done(null);
        return done(<div>{hits.slice(0, 20).map(hit => <p key={hit.path}>{run(`cat ${hit.path}`, hit.path, 'text-accent')}<span className="text-muted-foreground">:</span> {hit.line}</p>)}{hits.length > 20 && <Dim>... {hits.length - 20} more</Dim>}</div>);
      }

      case 'neofetch':
      case 'fastfetch':
        return done(<Fastfetch />);

      case 'whoami': return done(<p>{USER}</p>);
      case 'id': return done(<p>uid=1000({USER}) gid=1000({USER}) groups=1000({USER}),1337(curious)</p>);
      case 'hostname': return done(<p>{HOST}</p>);
      case 'uname': return done(<p>{flags.includes('a') ? `PrimeOS ${HOST} 5.2.0-react${React.version} #1 SMP x86_64 GNU/Linux` : 'PrimeOS'}</p>);
      case 'date': return done(<p>{new Date().toString()}</p>);
      case 'uptime': return done(<p>up {uptime()}, 1 user, load average: 0.13, 0.37, 0.42</p>);
      case 'echo': return done(<p>{rest}</p>);
      case 'which': return done(args[0] && allCommands.includes(args[0]) ? <p>/usr/bin/{args[0]}</p> : <Err>{args[0] ?? ''} not found</Err>);
      case 'history': return done(<div>{session.map((line, index) => <p key={index} className="whitespace-pre"><span className="text-muted-foreground">{String(index + 1).padStart(4)}  </span>{line}</p>)}</div>);
      case 'clear': return { output: null, cwd: at, clear: true };

      case 'logout':
      case 'exit':
        go('/');
        return done(<Dim>logout</Dim>);

      case 'pong': return done(<PongGame />);
      case 'joke':
      case 'fortune': return done(<p>{jokes[Math.floor(Math.random() * jokes.length)]}</p>);

      // --- undocumented ---
      case 'su':
      case 'sudo':
        return done(<div><p>[sudo] password for {USER}: </p><Err>{USER} is not in the sudoers file. This incident will be reported.</Err></div>);
      case 'rm':
        return done(flags.includes('r') ? <Err>rm: refusing to remove '{args[0] ?? '/'}': bold move, but this filesystem is read-only</Err> : <Err>rm: cannot remove '{args[0] ?? ''}': Read-only file system</Err>);
      case 'touch':
      case 'mkdir':
        return done(<Err>{command}: cannot create '{args[0] ?? ''}': Read-only file system</Err>);
      case 'vi':
      case 'vim':
        return done(<div><p>~</p><p>~</p><p>~{'      '}VIM - Vi IMproved</p><p>~</p><Dim>You escaped on the first try. That makes one of us. (:q!)</Dim></div>);
      case 'nano':
      case 'emacs':
        return done(<Dim>{command}: no editor here, the files are read-only. Real ones use {run('vim')} anyway.</Dim>);
      case 'ssh':
        return done(<Err>ssh: connect to host {args[0] ?? HOST} port 22: Connection refused (you are already inside)</Err>);
      case 'ping': {
        const target = args[0] ?? 'gianlucabassani.com';
        return done(<div><p>PING {target} 56(84) bytes of data.</p>{[13.7, 12.9, 14.2].map((time, index) => <p key={index}>64 bytes from {target}: icmp_seq={index + 1} ttl=57 time={time} ms</p>)}<p>&nbsp;</p><p>--- {target} ping statistics ---</p><p>3 packets transmitted, 3 received, 0% packet loss</p></div>);
      }
      case 'wget':
      case 'curl':
        return done(<Dim>{command}: you are already looking at the response. View source is one keystroke away.</Dim>);
      case 'nmap':
        return done(<pre className="terminal-text">{`Starting Nmap 7.95 ( https://nmap.org )
Nmap scan report for ${args[0] ?? 'gianlucabassani.com'}
Host is up (0.013s latency).

PORT      STATE    SERVICE
22/tcp    closed   ssh
80/tcp    open     http
443/tcp   open     https
1337/tcp  open     projects
4444/tcp  filtered reverse-shell
31337/tcp open     flag?

Nmap done: 1 IP address (1 host up). One of those services likes `}<span className="text-primary">ls -a</span>.</pre>);
      case 'top':
      case 'htop':
      case 'ps':
        return done(<pre className="terminal-text">{`  PID USER      %CPU %MEM COMMAND
    1 root       0.0  0.1 init
  133 prime     42.0  3.7 nidavellir --arena
  420 prime     13.3  1.2 gosint crawl
 1337 ${USER}      0.7  0.4 ${SHELL}
 1338 ${USER}      0.0  0.1 ${command}`}</pre>);
      case 'cowsay': {
        const say = rest || 'moo. hire the human.';
        return done(<pre className="terminal-text">{` ${'_'.repeat(say.length + 2)}
< ${say} >
 ${'-'.repeat(say.length + 2)}
        \\   ^__^
         \\  (oo)\\_______
            (__)\\       )\\/\\
                ||----w |
                ||     ||`}</pre>);
      }
      case 'sl':
        return done(<pre className="terminal-text text-secondary">{`      ====        ________                ___________
  _D _|  |_______/        \\__I_I_____===__|_________|
   |(_)---  |   H\\________/ |   |        =|___ ___|
   /     |  |   H  |  |     |   |         ||_| |_||
  |      |  |   H  |__--------------------| [___] |
  | ________|___H__/__|_____/[][]~\\_______|       |
  |/ |   |-----------I_____I [][] []  D   |=======|__
`}<span className="text-muted-foreground">You meant ls. The train stops for no one.</span></pre>);
      case 'make':
      case 'coffee':
        return done(<Err>HTTP 418: I'm a teapot.</Err>);
      case 'ascii':
        return done(<pre className="terminal-text text-secondary select-none">{`⠀⠀⠀⠀⠀⠀⢀⣀⣀⣀⣤⣤⣤⣤⣤⣤⣤⣤⣤⣤⣤⣤⣤⣀⣀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⣾⠉⠀⠀⠀⠀⠀⠀⠀⠀⠀⣀⠀⠀⠀⠀⢀⠀⠈⡇⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⣿⠀⠁⠀⠘⠁⠀⠀⠀⠀⠀⣀⡀⠀⠀⠀⠈⠀⠀⡇⠀⠀⠀⠀
⣀⣀⣀⠀⠀⠀⣿⠀⠀⠀⠀⠀⠄⠀⠀⠸⢰⡏⠉⠳⣄⠰⠀⠀⢰⣷⠶⠛⣧⠀
⢻⡀⠈⠙⠲⡄⣿⠀⠀⠀⠀⠀⠀⠀⠠⠀⢸⠀⠀⠀⠈⠓⠒⠒⠛⠁⠀⠀⣿⠀
⠀⠻⣄⠀⠀⠙⣿⠀⠀⠀⠈⠁⠀⢠⠄⣰⠟⠀⢀⡔⢠⠀⠀⠀⠀⣠⠠⡄⠘⢧
⠀⠀⠈⠛⢦⣀⣿⠀⠀⢠⡆⠀⠀⠈⠀⣯⠀⠀⠈⠛⠛⠀⠠⢦⠄⠙⠛⠃⠀⢸
⠀⠀⠀⠀⠀⠉⣿⠀⠀⠀⢠⠀⠀⢠⠀⠹⣆⠀⠀⠀⠢⢤⠠⠞⠤⡠⠄⠀⢀⡾
⠀⠀⠀⠀⠀⢀⡿⠦⢤⣤⣤⣤⣤⣤⣤⣤⡼⣷⠶⠤⢤⣤⣤⡤⢤⡤⠶⠖⠋⠀
⠀⠀⠀⠀⠀⠸⣤⡴⠋⠸⣇⣠⠼⠁⠀⠀⠀⠹⣄⣠⠞⠀⢾⡀⣠⠃⠀⠀⠀⠀`}</pre>);
    }

    // Paths typed as commands: nothing here is executable.
    if (argv[0].startsWith('./') || argv[0].startsWith('~/') || argv[0].startsWith('/')) {
      const found = lookup(resolvePath(at, argv[0]));
      if (!found) return done(<Err>{SHELL}: no such file or directory: {argv[0]}</Err>);
      if (found.node.kind === 'dir') return done(<Err>{SHELL}: is a directory: {argv[0]}</Err>);
      return done(<Err>{SHELL}: permission denied: {argv[0]}</Err>);
    }
    return done(<Err>{SHELL}: command not found: {argv[0]}</Err>);
  };

  /** Runs a full line, honouring `&&` and `;`, and records it under one prompt. */
  const runLine = (line: string) => {
    const trimmed = line.trim();
    const prompt = showPath(cwd);
    if (!trimmed) { setEntries(previous => [...previous, { prompt, command: '', output: null }]); return; }
    const session = typed[typed.length - 1] === trimmed ? typed : [...typed, trimmed];
    setTyped(session);
    setTypedIndex(-1);
    let at = cwd;
    let cleared = false;
    const outputs: React.ReactNode[] = [];
    for (const part of trimmed.split(/\s*(?:&&|;)\s*/).filter(Boolean)) {
      const result = execute(part, at, session);
      at = result.cwd;
      if (result.clear) { cleared = true; outputs.length = 0; continue; }
      if (result.output) outputs.push(<div key={outputs.length}>{result.output}</div>);
    }
    setCwd(at);
    setEntries(previous => cleared && !outputs.length ? [] : [...(cleared ? [] : previous), { prompt, command: trimmed, output: outputs.length ? outputs : null }]);
    setInput('');
  };
  runRef.current = runLine;

  // Boot: a login line and a fastfetch, like a freshly opened terminal.
  useEffect(() => {
    if (booted.current) return;
    booted.current = true;
    setEntries([
      { output: <Dim>Last login: {new Date().toDateString()} on pts/0 from the internet</Dim> },
      { prompt: '~', command: 'fastfetch', output: <Fastfetch /> },
      { output: <Dim>Type {run('help')} or start with {run('ls')}. This shell is read-only, mostly.</Dim> },
    ]);
    // A command handed over from the home prompt (/terminal?cmd=...) runs once on arrival.
    const handedOver = searchParams.get('cmd');
    if (handedOver) {
      setSearchParams({}, { replace: true });
      window.setTimeout(() => runRef.current(handedOver.slice(0, 80)), 350);
    }
    inputRef.current?.focus({ preventScroll: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const output = outputRef.current;
    if (output) output.scrollTop = output.scrollHeight;
  }, [entries]);

  const complete = () => {
    const tokens = input.split(' ');
    const fragment = tokens[tokens.length - 1];
    let matches: string[];
    let prefix = '';
    if (tokens.length === 1 && !fragment.includes('/')) {
      matches = allCommands.filter(name => name.startsWith(fragment.toLowerCase())).map(name => `${name} `);
    } else {
      const slash = fragment.lastIndexOf('/');
      prefix = slash >= 0 ? fragment.slice(0, slash + 1) : '';
      const partial = fragment.slice(slash + 1).toLowerCase();
      const found = lookup(resolvePath(cwd, prefix || '.'));
      if (!found || found.node.kind !== 'dir' || found.node.locked) return;
      const parent = found.node;
      matches = Object.keys(parent.children).filter(name => name.toLowerCase().startsWith(partial) && (partial.startsWith('.') || !name.startsWith('.'))).map(name => parent.children[name].kind === 'dir' ? `${name}/` : `${name} `);
    }
    if (!matches.length) return;
    const head = tokens.slice(0, -1).join(' ');
    const join = (value: string) => `${head}${head ? ' ' : ''}${prefix}${value}`;
    if (matches.length === 1) { setInput(join(matches[0])); return; }
    let common = matches[0].trimEnd();
    for (const match of matches) while (!match.toLowerCase().startsWith(common.toLowerCase())) common = common.slice(0, -1);
    if (common.length > fragment.length - prefix.length) setInput(join(common));
    else setEntries(previous => [...previous, { prompt: showPath(cwd), command: input, output: <div className="terminal-listing text-muted-foreground">{matches.map(match => <span key={match}>{match.trim()}</span>)}</div> }]);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
      if (!typed.length) return;
      event.preventDefault();
      const next = event.key === 'ArrowUp'
        ? (typedIndex < 0 ? typed.length - 1 : Math.max(0, typedIndex - 1))
        : (typedIndex < 0 || typedIndex >= typed.length - 1 ? -1 : typedIndex + 1);
      setTypedIndex(next);
      setInput(next < 0 ? '' : typed[next]);
    } else if (event.key === 'Tab') {
      event.preventDefault();
      complete();
    } else if (event.ctrlKey && event.key.toLowerCase() === 'l') {
      event.preventDefault();
      setEntries([]);
    } else if (event.ctrlKey && event.key.toLowerCase() === 'c' && !window.getSelection()?.toString()) {
      event.preventDefault();
      setEntries(previous => [...previous, { prompt: showPath(cwd), command: `${input}^C`, output: null }]);
      setInput('');
    } else if (event.ctrlKey && event.key.toLowerCase() === 'u') {
      event.preventDefault();
      setInput('');
    }
  };

  const Prompt = ({ path }: { path: string }) => <span className="terminal-prompt"><span className="text-secondary font-bold">{USER}@{HOST}</span><span className="text-muted-foreground">:</span><span className="text-accent font-bold">{path}</span><span className="text-muted-foreground">$</span></span>;

  return (
    <div
      onClick={() => { if (!window.getSelection()?.toString()) inputRef.current?.focus({ preventScroll: true }); }}
      className="terminal-shell flex flex-col bg-[#0b0812]/95 border border-secondary/20 rounded-xl overflow-hidden transition-all duration-300 font-mono text-foreground crt-effect h-full w-full"
      style={{ boxShadow: '0 0 0 1px rgba(125,227,232,0.08), 0 24px 48px -12px rgba(0,0,0,0.8), 0 0 40px -10px rgba(125,227,232,0.06)' }}
    >
      <div className="crt-scanline" />

      <div className="terminal-shell-heading flex items-center justify-between bg-[#120d1c]/90 px-4 py-2.5 border-b border-secondary/15 select-none">
        <div className="flex items-center gap-2.5">
          <div className="flex gap-1.5">
            <span className="w-3 h-3 rounded-full bg-[#ff5f57]" />
            <span className="w-3 h-3 rounded-full bg-[#febc2e]" />
            <span className="w-3 h-3 rounded-full bg-[#28c840]" />
          </div>
          <TerminalIcon className="w-3.5 h-3.5 text-secondary/70" />
          <span className="text-xs font-bold font-mono tracking-wide text-secondary/80">{USER}@{HOST}: {showPath(cwd)}</span>
        </div>
        <div className="flex items-center gap-1.5">
          {onClose && (
            <button onClick={(e) => { e.stopPropagation(); onClose(); }} aria-label="Close terminal" className="p-1 rounded hover:bg-destructive/20 text-muted-foreground hover:text-destructive transition-colors">
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      <div ref={outputRef} className="terminal-output flex-1 p-4 overflow-y-auto custom-scrollbar">
        {entries.map((entry, index) => (
          <div key={index} className="terminal-entry">
            {entry.prompt !== undefined && <p className="terminal-line"><Prompt path={entry.prompt} /> <span>{entry.command}</span></p>}
            {entry.output}
          </div>
        ))}
        <form onSubmit={event => { event.preventDefault(); runLine(input); }} className="terminal-line terminal-input-line">
          <Prompt path={showPath(cwd)} />
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            aria-label="Terminal command"
            spellCheck={false}
            autoComplete="off"
            autoCapitalize="none"
            autoCorrect="off"
          />
        </form>
      </div>

      {/* Quick commands: one tap on touch screens */}
      <div className="terminal-quick" aria-label="Quick commands">
        {quickCommands.map(command => <span key={command}>{run(command)}</span>)}
      </div>
    </div>
  );
}
