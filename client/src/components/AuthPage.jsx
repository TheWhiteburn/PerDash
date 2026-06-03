import { useState, useEffect, useRef } from 'react';
import BackgroundScene from './BackgroundScene';

const phrases = [
  'memento mori', 'amor fati', 'the obstacle is the way',
  'focus on what you control', 'master your mind',
  'discipline equals freedom', 'lock in', 'do the work',
  'consistency over intensity', 'no zero days',
  'embrace the grind', 'stay hungry', 'actions over words',
  'fortune favors the bold', 'rise and grind',
  'slow is smooth', 'done is better than perfect',
  'trust the process', 'keep showing up', 'one day at a time',
];

function buildWriters() {
  const positions = [];
  let minDistX = 16, minDistY = 12;
  while (positions.length < 20) {
    const x = 2 + Math.random() * 88;
    const y = 2 + Math.random() * 86;
    const tooClose = positions.some(p => Math.abs(p.x - x) < minDistX && Math.abs(p.y - y) < minDistY);
    if (!tooClose) positions.push({ x, y });
    if (positions.length < 20 && positions.length > 0 && Math.random() < 0.001) {
      minDistX = Math.max(8, minDistX - 1);
      minDistY = Math.max(6, minDistY - 1);
    }
  }
  const shuffled = [...phrases].sort(() => Math.random() - 0.5);
  return positions.map((p, i) => ({
    id: i,
    x: p.x.toFixed(2),
    y: p.y.toFixed(2),
    phrase: shuffled[i % shuffled.length],
    typed: '',
    charIndex: 0,
    phase: 'typing',
    frame: 0,
    typeThreshold: 2 + Math.floor(Math.random() * 6),
    backspaceThreshold: 1 + Math.floor(Math.random() * 4),
    holdCounter: 0,
    holdDuration: 40 + Math.floor(Math.random() * 120),
    typeCounter: 0,
    fontSize: (13 + Math.random() * 5).toFixed(1),
    opacity: (0.28 + Math.random() * 0.05).toFixed(3),
  }));
}

export default function AuthPage({ onSignIn, onSignUp }) {
  const writersRef = useRef(null);
  const tickRef = useRef(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mode, setMode] = useState('signin');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [, forceRender] = useState(0);

  useEffect(() => {
    if (!writersRef.current) writersRef.current = buildWriters();
    tickRef.current = setInterval(() => {
      const writers = writersRef.current;
      for (const w of writers) {
        w.frame++;
        if (w.phase === 'typing') {
          w.typeCounter++;
          if (w.typeCounter >= w.typeThreshold && w.charIndex < w.phrase.length) {
            w.typeCounter = 0;
            w.charIndex++;
            w.typed = w.phrase.slice(0, w.charIndex);
            if (w.charIndex >= w.phrase.length) {
              w.phase = 'hold';
              w.holdCounter = 0;
            }
          }
        } else if (w.phase === 'hold') {
          w.holdCounter++;
          if (w.holdCounter >= w.holdDuration) {
            w.phase = 'backspacing';
          }
        } else if (w.phase === 'backspacing') {
          w.typeCounter++;
          if (w.typeCounter >= w.backspaceThreshold && w.charIndex > 0) {
            w.typeCounter = 0;
            w.charIndex--;
            w.typed = w.phrase.slice(0, w.charIndex);
            if (w.charIndex <= 0) {
              w.phase = 'typing';
            }
          }
        }
      }
      forceRender(t => t + 1);
    }, 60);
    return () => clearInterval(tickRef.current);
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setMessage('');
    try {
      if (mode === 'signin') {
        await onSignIn(email, password);
      } else {
        await onSignUp(email, password);
        setMessage('Check your email to confirm, then start tracking your goals!');
        setMode('signin');
      }
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="h-screen bg-black text-slate-200 overflow-hidden relative flex items-center justify-center">
      <BackgroundScene />
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0 select-none">
        {(writersRef.current || buildWriters()).map(w => (
          <span
            key={w.id}
            className="absolute font-mono whitespace-nowrap"
            style={{
              left: w.x + '%',
              top: w.y + '%',
              fontSize: w.fontSize + 'px',
              opacity: w.opacity,
              color: '#e5e7eb',
              letterSpacing: '0.12em',
            }}
          >
            {w.typed}
            <span className="inline-block w-[1ch] h-[1.1em] ml-[1px] align-middle" style={{ backgroundColor: '#b0b0b0' }} />
          </span>
        ))}
      </div>
      <div className="relative z-10 flex flex-col items-center gap-6">
        <div className="flex items-center gap-4">
          <span className="text-white text-3xl drop-shadow-[0_0_8px_rgba(255,255,255,0.3)]">◉</span>
          <h1 className="text-2xl font-bold tracking-wide text-white drop-shadow-[0_0_6px_rgba(255,255,255,0.25)]">PerDash</h1>
        </div>
        <p className="text-sm text-gray-300 tracking-wide text-center max-w-xs drop-shadow-[0_0_4px_rgba(255,255,255,0.15)]">
          Personal dashboard. Track goals, workouts, sleep, and more.
        </p>
        <form onSubmit={handleSubmit} className="flex flex-col gap-3 w-72">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            className="px-3 py-2.5 text-sm bg-transparent border border-white/20 rounded-md text-white placeholder-white/40 focus:outline-none focus:border-white/60 transition-colors"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            minLength={6}
            className="px-3 py-2.5 text-sm bg-transparent border border-white/20 rounded-md text-white placeholder-white/40 focus:outline-none focus:border-white/60 transition-colors"
          />
          {error && <p className="text-xs text-red-400 text-center">{error}</p>}
          {message && <p className="text-xs text-green-400 text-center">{message}</p>}
          <button
            type="submit"
            className="px-6 py-2.5 text-sm bg-white text-gray-900 rounded-md hover:bg-gray-900 hover:text-white hover:-translate-y-1 transition-all duration-300 tracking-wide font-medium"
          >
            {mode === 'signin' ? 'Sign in' : 'Create account'}
          </button>
        </form>
        <button
          onClick={() => { setMode(mode === 'signin' ? 'signup' : 'signin'); setError(''); setMessage(''); }}
          className="text-xs text-white/50 hover:text-white transition-colors"
        >
          {mode === 'signin' ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
        </button>
      </div>
    </div>
  );
}
