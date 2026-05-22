import React, { useState, useEffect, useRef } from 'react';
import { Terminal as TerminalIcon, X, Maximize2, Minimize2 } from 'lucide-react';
import skillsData from '@/data/skills';
import { projects } from '@/data/projects';
import { ctfWriteups } from '@/data/ctf';

interface TerminalProps {
  onClose?: () => void;
}

interface CommandHistory {
  command: string;
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
      ctx.fillStyle = '#050a0f';
      ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

      // Subtle grid lines
      ctx.strokeStyle = 'rgba(100,200,255,0.04)';
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
      playerGrad.addColorStop(0, '#39ff14');
      playerGrad.addColorStop(1, '#00cc44');
      ctx.fillStyle = playerGrad;
      ctx.shadowColor = '#39ff14';
      ctx.shadowBlur = 12;
      ctx.fillRect(playerPaddleX, playerY.current, paddleWidth, paddleHeight);

      // AI paddle — neon blue
      const aiGrad = ctx.createLinearGradient(aiPaddleX, aiY.current, aiPaddleX + paddleWidth, aiY.current);
      aiGrad.addColorStop(0, '#00b4ff');
      aiGrad.addColorStop(1, '#0077ff');
      ctx.fillStyle = aiGrad;
      ctx.shadowColor = '#00b4ff';
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
    <div className="flex flex-col items-center gap-3 p-4 border border-border/60 bg-[#050a0f]/80 rounded-lg select-none mx-auto my-2 w-full max-w-[600px]">
      <div className="flex justify-between w-full font-mono text-xs px-1">
        <span className="text-[#39ff14] font-bold">YOU: {playerScore}</span>
        <span className="text-muted-foreground tracking-widest">⚡ PONG  •  First to 5 ⚡</span>
        <span className="text-[#00b4ff] font-bold">AI: {aiScore}</span>
      </div>

      <div className="relative border border-border/40 overflow-hidden rounded w-full" style={{ maxWidth: CANVAS_W }}>
        <canvas ref={canvasRef} width={CANVAS_W} height={CANVAS_H} className="block w-full" />

        {gameState === 'idle' && (
          <div className="absolute inset-0 bg-[#050a0f]/90 flex flex-col items-center justify-center text-center p-6 gap-4">
            <p className="text-muted-foreground text-xs leading-relaxed">
              Move your paddle with{' '}
              <span className="text-[#39ff14] font-bold font-mono">W / S</span>
              {' '}or{' '}
              <span className="text-[#39ff14] font-bold font-mono">↑ / ↓</span>
            </p>
            <button
              onClick={handleStart}
              className="px-6 py-2 bg-[#39ff14]/10 border border-[#39ff14]/40 text-[#39ff14] hover:bg-[#39ff14]/20 rounded font-mono font-bold text-sm uppercase tracking-widest transition-all"
            >
              ▶ Start Game
            </button>
          </div>
        )}

        {gameState === 'gameover' && (
          <div className="absolute inset-0 bg-[#050a0f]/90 flex flex-col items-center justify-center text-center p-6 gap-3">
            <p className={`text-lg font-bold font-mono uppercase tracking-widest ${winner === 'Player' ? 'text-[#39ff14]' : 'text-[#00b4ff]'}`}>
              {winner === 'Player' ? '🎉 VICTORY!' : '👾 AI WINS!'}
            </p>
            <p className="text-muted-foreground text-xs font-mono">
              Final: {playerScore} – {aiScore}
            </p>
            <button
              onClick={handleStart}
              className="px-6 py-2 bg-[#39ff14]/10 border border-[#39ff14]/40 text-[#39ff14] hover:bg-[#39ff14]/20 rounded font-mono font-bold text-sm uppercase tracking-widest transition-all"
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

export default function Terminal({ onClose }: TerminalProps) {
  const [input, setInput] = useState('');
  const [history, setHistory] = useState<CommandHistory[]>([]);
  const [isMaximized, setIsMaximized] = useState(false);
  const terminalEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Initial welcome message
  useEffect(() => {
    setHistory([
      {
        command: 'system_init',
        output: (
          <div className="font-mono text-sm leading-relaxed">
            <pre className="text-xs text-[#39ff14]/90 leading-none mb-3 font-bold select-none">
{`  ███╗   ██╗███████╗ ██████╗       ███████╗██╗  ██╗███████╗██╗     ██╗      ██████╗██╗   ██╗
  ████╗  ██║██╔════╝██╔═══██╗      ██╔════╝██║  ██║██╔════╝██║     ██║     ██╔════╝╚██╗ ██╔╝
  ██╔██╗ ██║█████╗  ██║   ██║█████╗███████╗███████║█████╗  ██║     ██║     ██║      ╚████╔╝ 
  ██║╚██╗██║██╔══╝  ██║   ██║╚════╝╚════██║██╔══██║██╔══╝  ██║     ██║     ██║       ╚██╔╝  
  ██║ ╚████║███████╗╚██████╔╝      ███████║██║  ██║███████╗███████╗███████╗╚██████╗   ██║   
  ╚═╝  ╚═══╝╚══════╝ ╚═════╝       ╚══════╝╚═╝  ╚═╝╚══════╝╚══════╝╚══════╝ ╚═════╝   ╚═╝   `}
            </pre>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[#39ff14] font-bold text-sm">Neo-ShellCy</span>
              <span className="text-muted-foreground text-xs">is the little brother of the Peaky ShellCy project</span>
            </div>
            <p className="text-muted-foreground text-xs mb-1">
              Type <span className="text-[#ffd700] font-bold">help</span> to see available commands.{' '}
              Try <span className="text-[#ffd700] font-bold">ascii</span>, <span className="text-[#ffd700] font-bold">joke</span>, or{' '}
              <span className="text-[#ffd700] font-bold">pong</span> for some fun.
            </p>
            <p className="text-[#39ff14]/70 text-xs">Session: guest@gianlucabassani.io </p>
          </div>
        ),
      },
    ]);
  }, []);

  // Auto scroll
  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history]);

  const focusInput = () => inputRef.current?.focus();

  const handleCommandSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedInput = input.trim();
    if (!trimmedInput) return;

    const parts = trimmedInput.toLowerCase().split(' ');
    const cmd = parts[0];
    let output: React.ReactNode = '';

    switch (cmd) {
      case 'help':
        output = (
          <div className="space-y-1 text-xs">
            <p className="text-[#39ff14] font-bold mb-2">Available Commands:</p>
            {[
              ['about',    'Who am I & what I do'],
              ['skills',   'Technical skill matrix'],
              ['projects', 'Showcase of built tools'],
              ['ctf',      'Recent CTF solves & writeups'],
              ['pong',     'Play Pong right here in the terminal'],
              ['joke',     'A random bad joke'],
              ['ascii',    'It is what it is'],
              ['clear',    'Clear the terminal screen'],
              ['help',     'Show this menu'],
            ].map(([c, d]) => (
              <p key={c}>
                <span className="text-[#39ff14] font-mono inline-block" style={{ minWidth: '6rem' }}>{c}</span>
                <span className="text-muted-foreground">{d}</span>
              </p>
            ))}
          </div>
        );
        break;

      case 'about':
        output = (
          <div className="space-y-2 text-xs leading-relaxed max-w-2xl">
            <p className="text-[#39ff14] font-bold font-mono">Gianluca Bassani — Offensive Security Enthusiast </p>
            <p className="text-foreground">
              Junior Penetration Tester focused on web exploitation, binary analysis, and active directory assessments.
            </p>
            <p className="text-[#ffd700] font-mono">
              ⚡ CTF Player @ pwnthem0le (Turin, Italy) 
            </p>
            <p className="text-[#00b4ff] font-mono">
              🤖 AI Red Teamer and MCP experimenter for agentic automation.
            </p>
          </div>
        );
        break;

      case 'skills':
        output = (
          <div className="space-y-2 text-xs">
            <p className="text-[#39ff14] font-bold">Technical Skill Matrix:</p>
            <div className="space-y-1 font-mono">
              {skillsData.map((skill) => {
                const filled = Math.round(skill.level / 10);
                const empty = 10 - filled;
                const bar = `[${'█'.repeat(filled)}${'░'.repeat(empty)}]`;
                let color = 'text-foreground';
                if (skill.variant === 'success') color = 'text-[#39ff14]';
                if (skill.variant === 'destructive') color = 'text-destructive';
                if (skill.variant === 'accent') color = 'text-accent';
                if (skill.variant === 'warning') color = 'text-[#ffd700]';
                if (skill.variant === 'secondary') color = 'text-[#00b4ff]';
                return (
                  <div key={skill.id} className="flex items-center gap-2">
                    <span className="w-48 text-muted-foreground truncate">{skill.name}</span>
                    <span className={`font-bold ${color}`}>{bar}</span>
                    <span className="text-muted-foreground text-[10px]">{skill.level}%</span>
                  </div>
                );
              })}
            </div>
          </div>
        );
        break;

      case 'projects':
        output = (
          <div className="space-y-3 text-xs">
            <p className="text-[#39ff14] font-bold">Showcased Projects:</p>
            {projects.map((proj) => (
              <div key={proj.id} className="border-l-2 border-[#39ff14]/30 pl-2 space-y-1">
                <p className="font-bold text-[#39ff14] font-mono">
                  {proj.title}{' '}
                  <span className="text-[10px] text-muted-foreground">({proj.technologies.join(', ')})</span>
                </p>
                <p className="text-muted-foreground">{proj.summary}</p>
                {proj.githubUrl && (
                  <a href={proj.githubUrl} target="_blank" rel="noreferrer"
                    className="text-[#00b4ff] hover:underline font-mono text-[10px]">
                    ↗ {proj.githubUrl}
                  </a>
                )}
              </div>
            ))}
          </div>
        );
        break;

      case 'ctf':
        output = (
          <div className="space-y-3 text-xs">
            <p className="text-[#39ff14] font-bold">Recent CTF Solves:</p>
            {ctfWriteups.map((w) => (
              <div key={w.id} className="border-l-2 border-[#ffd700]/40 pl-2">
                <p className="font-bold text-[#ffd700] font-mono">
                  [{w.competition.toUpperCase()}] {w.title} — {w.category.toUpperCase()} ({w.points} pts)
                </p>
                <p className="text-muted-foreground">{w.summary}</p>
                <p className="text-[10px] text-muted-foreground font-mono">Difficulty: {w.difficulty.toUpperCase()} | Solved: {w.date}</p>
              </div>
            ))}
          </div>
        );
        break;

      case 'pong':
        output = <PongGame />;
        break;

      case 'joke':
        const randomJoke = jokes[Math.floor(Math.random() * jokes.length)];
        output = (
          <div className="text-foreground text-xs leading-relaxed max-w-lg font-mono">
            <span className="text-[#ffd700] font-bold">😂 JOKE.EXE &gt; </span> {randomJoke}
          </div>
        );
        break;

      case 'ascii':
        output = (
          <pre className="text-[10px] md:text-xs text-[#39ff14] font-mono leading-tight select-none">
{`
⠀⠀⠀⠀⠀⠀⢀⣀⣀⣀⣤⣤⣤⣤⣤⣤⣤⣤⣤⣤⣤⣤⣤⣀⣀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⣾⠉⠀⠀⠀⠀⠀⠀⠀⠀⠀⣀⠀⠀⠀⠀⢀⠀⠈⡇⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⣿⠀⠁⠀⠘⠁⠀⠀⠀⠀⠀⣀⡀⠀⠀⠀⠈⠀⠀⡇⠀⠀⠀⠀
⣀⣀⣀⠀⠀⠀⣿⠀⠀⠀⠀⠀⠄⠀⠀⠸⢰⡏⠉⠳⣄⠰⠀⠀⢰⣷⠶⠛⣧⠀
⢻⡀⠈⠙⠲⡄⣿⠀⠀⠀⠀⠀⠀⠀⠠⠀⢸⠀⠀⠀⠈⠓⠒⠒⠛⠁⠀⠀⣿⠀
⠀⠻⣄⠀⠀⠙⣿⠀⠀⠀⠈⠁⠀⢠⠄⣰⠟⠀⢀⡔⢠⠀⠀⠀⠀⣠⠠⡄⠘⢧
⠀⠀⠈⠛⢦⣀⣿⠀⠀⢠⡆⠀⠀⠈⠀⣯⠀⠀⠈⠛⠛⠀⠠⢦⠄⠙⠛⠃⠀⢸
⠀⠀⠀⠀⠀⠉⣿⠀⠀⠀⢠⠀⠀⢠⠀⠹⣆⠀⠀⠀⠢⢤⠠⠞⠤⡠⠄⠀⢀⡾
⠀⠀⠀⠀⠀⢀⡿⠦⢤⣤⣤⣤⣤⣤⣤⣤⡼⣷⠶⠤⢤⣤⣤⡤⢤⡤⠶⠖⠋⠀
⠀⠀⠀⠀⠀⠸⣤⡴⠋⠸⣇⣠⠼⠁⠀⠀⠀⠹⣄⣠⠞⠀⢾⡀⣠⠃⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠉⠁⠀⠀⠀⠀⠀
`}
          </pre>
        );
        break;

      case 'clear':
        setHistory([]);
        setInput('');
        return;

      default:
        output = (
          <p className="text-destructive font-mono text-xs">
            Command not found: '{cmd}'. Type <span className="text-[#ffd700]">help</span> for available commands.
          </p>
        );
    }

    setHistory((prev) => [...prev, { command: trimmedInput, output }]);
    setInput('');
  };

  return (
    <div
      onClick={focusInput}
      className="flex flex-col bg-[#050d0f]/97 border border-[#39ff14]/20 rounded-xl overflow-hidden shadow-2xl shadow-black/60 transition-all duration-300 font-mono text-foreground crt-effect h-full w-full"
      style={{ boxShadow: '0 0 0 1px rgba(57,255,20,0.08), 0 24px 48px -12px rgba(0,0,0,0.8), 0 0 40px -10px rgba(57,255,20,0.06)' }}
    >
      <div className="crt-scanline" />

      {/* Title Bar */}
      <div className="flex items-center justify-between bg-[#0a1a0f]/90 px-4 py-2.5 border-b border-[#39ff14]/15 select-none">
        <div className="flex items-center gap-2.5">
          {/* Traffic light dots */}
          <div className="flex gap-1.5">
            <span className="w-3 h-3 rounded-full bg-[#ff5f57]" />
            <span className="w-3 h-3 rounded-full bg-[#febc2e]" />
            <span className="w-3 h-3 rounded-full bg-[#28c840]" />
          </div>
          <TerminalIcon className="w-3.5 h-3.5 text-[#39ff14]/70" />
          <span className="text-xs font-bold font-mono tracking-wide text-[#39ff14]/80">
            neo-shellcy — guest@gianlucabassani.io
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          {onClose && (
            <button
              onClick={(e) => { e.stopPropagation(); onClose(); }}
              className="p-1 rounded hover:bg-destructive/20 text-muted-foreground hover:text-destructive transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Output Area */}
      <div className="flex-1 p-4 overflow-y-auto space-y-4 custom-scrollbar text-xs">
        {history.map((item, idx) => (
          <div key={idx} className="space-y-1">
            {item.command !== 'system_init' && (
              <div className="flex items-center text-muted-foreground gap-1 select-none">
                <span className="text-[#39ff14] font-bold">guest</span>
                <span className="text-muted-foreground/50">@</span>
                <span className="text-[#00b4ff]">neo-shellcy</span>
                <span className="text-muted-foreground/50">:</span>
                <span className="text-[#ffd700]">~</span>
                <span className="text-muted-foreground/70">$</span>
                <span className="text-foreground ml-1">{item.command}</span>
              </div>
            )}
            <div className="pl-2">{item.output}</div>
          </div>
        ))}
        <div ref={terminalEndRef} />
      </div>

      {/* Input */}
      <form
        onSubmit={handleCommandSubmit}
        className="flex items-center gap-1 border-t border-[#39ff14]/10 bg-[#0a1a0f]/60 px-4 py-2.5 select-none"
      >
        <span className="text-[#39ff14] font-bold text-xs">guest</span>
        <span className="text-muted-foreground/50 text-xs">@</span>
        <span className="text-[#00b4ff] text-xs">neo-shellcy</span>
        <span className="text-muted-foreground/50 text-xs">:</span>
        <span className="text-[#ffd700] text-xs">~</span>
        <span className="text-muted-foreground/70 text-xs font-bold">$</span>
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="flex-1 bg-transparent border-none outline-none font-mono text-xs text-foreground p-0 ml-1 focus:ring-0 focus:outline-none"
          placeholder="type a command..."
          autoComplete="off"
          autoCapitalize="none"
        />
        <span className="terminal-cursor bg-[#39ff14]" />
      </form>
    </div>
  );
}
