import { useRef, useState, useEffect } from 'react';

const phrases = [
  // Stoic
  'memento mori', 'amor fati', 'the obstacle is the way',
  'focus on what you control', 'endure', 'master your mind',
  'act. don\'t react.', 'still mind', 'strong will',
  'the path is the goal', 'discomfort is the price',
  'you decide', 'what stands in the way becomes the way',
  'choose not to be harmed', 'be tough not soft',
  'live with purpose', 'prepare for the worst',
  'expect nothing appreciate everything',
  'fate leads the willing', 'we suffer more in imagination',
  'the mind is everything', 'focus on the present',
  'nothing is good or bad thinking makes it so',
  'waste no time', 'you have power over your mind',
  'if it is not right do not do it', 'be the wall',
  'stand firm', 'inner fortress', 'stillness', 'persist',
  'discipline over motivation', 'choose the harder path',
  'no excuses', 'do the work', 'show up', 'do what you must',
  'suffer well', 'mind over matter', 'control your emotions',
  'rise above', 'stay grounded', 'accept what is',
  'wherever you are be there', 'clarity before action',
  'speak little do much', 'solitude is strength',
  'reflect', 'adapt', 'turn obstacles into opportunity',
  'true freedom is inner freedom', 'the only wealth is peace of mind',
  'better to trip than to slip',

  // Fitness
  'no pain no gain', 'push harder', 'stay hard',
  'one more rep', 'train insane', 'earn it', 'no zero days',
  'pain is temporary', 'shut up and train', 'grind', 'hustle',
  'the only easy day was yesterday', 'comfort is a slow death',
  'get after it', 'rise and grind', 'every rep counts',
  'never skip', 'champion mindset', 'beat your yesterday',
  'growth starts at discomfort', 'don\'t quit',
  'finish what you started', 'blood sweat respect',
  'respect the grind', 'earned not given',
  'sore today strong tomorrow', 'no shortcuts',
  'consistency over intensity', 'show up when it\'s hard',
  'stronger every day', 'the grind doesn\'t stop',
  'no days off', 'every second counts', 'push yourself',
  'mental toughness', 'find your limit go beyond',
  'what hurts today makes you stronger tomorrow',
  'suffer in silence', 'be stronger than your excuses',
  'it never gets easier you just get stronger',
  'push beyond', 'fight through', 'train like a beast',
  'go hard or go home', 'feel the burn',
  'unleash your potential', 'another rep another victory',
  'the body follows the mind', 'go until you can\'t',
  'then go more', 'build the body build the mind',
  'block out the noise', 'lock in', 'fail to prepare prepare to fail',
  'progress not perfection', 'breathe focus execute',
  'your only limit is you', 'break your limits',
  'stay hungry', 'fall in love with the process',
  'the price of excellence is discipline',

  // Crossover
  'discipline equals freedom', 'embrace the grind',
  'pain is weakness leaving the body', 'train the mind lift the spirit',
  'iron sharpens iron', 'what you do today defines your tomorrow',
  'small wins compound', 'trust the process', 'keep going',
  'never quit', 'one step at a time',
];

function rand(n) {
  return Math.floor(Math.random() * n);
}

function buildWriters() {
  return Array.from({ length: 50 }, (_, i) => {
    const cols = 10;
    const rows = 5;
    const col = i % cols;
    const row = Math.floor(i / cols) % rows;
    const x = ((col + 0.5) / cols) * 96 + 2 + (Math.random() - 0.5) * 6;
    const y = ((row + 0.5) / rows) * 94 + 2 + (Math.random() - 0.5) * 10;

    const phrase = phrases[rand(phrases.length)];
    return {
      id: i,
      x: x.toFixed(1), y: y.toFixed(1),
      phrase,
      typed: '',
      charIndex: 0,
      phase: 'waiting',
      frame: 0,
      waitFrames: rand(200),
      pauseFrames: 30 + rand(40),
      typeInterval: 1 + rand(2),
      deleteInterval: 1,
      fontSize: (10 + Math.random() * 4).toFixed(1),
      opacity: (0.03 + Math.random() * 0.035).toFixed(3),
      rotation: ((Math.random() - 0.5) * 6).toFixed(1),
    };
  });
}

export default function BackgroundScene() {
  const [tick, setTick] = useState(0);
  const ref = useRef(null);

  if (!ref.current) {
    ref.current = buildWriters();
  }

  useEffect(() => {
    const id = setInterval(() => {
      const writers = ref.current;
      for (let w of writers) {
        w.frame++;
        if (w.phase === 'waiting') {
          if (w.frame >= w.waitFrames) {
            w.phase = 'typing';
            w.frame = 0;
            w.charIndex = 0;
            w.typed = '';
          }
        } else if (w.phase === 'typing') {
          if (w.frame % w.typeInterval === 0 && w.charIndex < w.phrase.length) {
            w.charIndex++;
            w.typed = w.phrase.slice(0, w.charIndex);
            if (w.charIndex >= w.phrase.length) {
              w.phase = 'pausing';
              w.frame = 0;
            }
          }
        } else if (w.phase === 'pausing') {
          if (w.frame >= w.pauseFrames) {
            w.phase = 'deleting';
            w.frame = 0;
          }
        } else if (w.phase === 'deleting') {
          if (w.frame % w.deleteInterval === 0 && w.charIndex > 0) {
            w.charIndex--;
            w.typed = w.phrase.slice(0, w.charIndex);
            if (w.charIndex <= 0) {
              w.phase = 'waiting';
              w.frame = 0;
              w.waitFrames = 10 + rand(20);
              let next;
              do { next = phrases[rand(phrases.length)]; } while (next === w.phrase);
              w.phrase = next;
            }
          }
        }
      }
      setTick(t => t + 1);
    }, 60);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0 select-none" style={{ letterSpacing: '0.12em' }}>
      {ref.current.map(w => (
        <span
          key={w.id}
          className="absolute font-mono whitespace-nowrap"
          style={{
            left: w.x + '%',
            top: w.y + '%',
            fontSize: w.fontSize + 'px',
            opacity: w.opacity,
            color: '#3b82f6',
            transform: `rotate(${w.rotation}deg)`,
            transformOrigin: '0 50%',
          }}
        >
          {w.typed}
          <span className="inline-block w-[1ch] h-[1em] ml-[1px] align-middle animate-pulse" style={{ backgroundColor: '#3b82f6' }} />
        </span>
      ))}
    </div>
  );
}
