import { useState, useEffect } from 'react';

const HABIT_OPTIONS = ['Eat healthy', 'Work out', 'Sleep 8h', 'Read 30min', 'Meditate', 'Study 1h', 'No junk food', 'Walk 10k steps'];

const TOUR_SPOTS = [
  { selector: 'main', title: 'Overview', text: 'Your command center. Progress, trends, journal — everything at a glance.' },
  { selector: '[data-tour="sidebar"]', title: 'Sidebar', text: 'Track what matters. Goals trickle down from 5-year vision to monthly actions.' },
  { selector: '[data-tour="coach"]', title: 'Coach', text: 'Your AI assistant. Tell him what you did — he logs sleep, workouts, goals, and checklist.' },
];

const CATEGORIES = [
  { key: 'career', label: 'Career', placeholder: 'e.g., Run my own business' },
  { key: 'fitness', label: 'Fitness', placeholder: 'e.g., Complete a marathon' },
  { key: 'finance', label: 'Finance', placeholder: 'e.g., \u20B92L/month income' },
  { key: 'skills', label: 'Skills', placeholder: 'e.g., Scuba certified' },
];

function StepDots({ current, total }) {
  return (
    <div className="flex gap-1.5 mb-8">
      {Array.from({ length: total }, (_, i) => (
        <div key={i} className={`h-1 flex-1 rounded-full transition-all duration-300 ${i <= current ? 'bg-white' : 'bg-white/20'}`} />
      ))}
    </div>
  );
}

export default function OnboardingWizard({ onFinish }) {
  const [step, setStep] = useState(0);
  const [profile, setProfile] = useState({ name: '', age: '', gender: '' });
  const [selectedHabits, setSelectedHabits] = useState([]);
  const [customHabit, setCustomHabit] = useState('');
  const [goals, setGoals] = useState({ career: '', fitness: '', finance: '', skills: '' });
  const [sleepTarget, setSleepTarget] = useState(8);
  const [tourStep, setTourStep] = useState(0);
  const [spotlight, setSpotlight] = useState(null);

  const toggleHabit = (h) => {
    setSelectedHabits(prev => prev.includes(h) ? prev.filter(x => x !== h) : [...prev, h]);
  };

  const addCustomHabit = (e) => {
    if (e.key === 'Enter' && customHabit.trim()) {
      setSelectedHabits(prev => [...prev, customHabit.trim()]);
      setCustomHabit('');
    }
  };

  useEffect(() => {
    if (step === 5) {
      const spot = TOUR_SPOTS[tourStep];
      if (!spot) return;
      const el = document.querySelector(spot.selector);
      if (el) {
        const rect = el.getBoundingClientRect();
        setSpotlight(rect);
      } else {
        setSpotlight(null);
      }
    }
  }, [step, tourStep]);

  // Steps 0-4: full-screen setup
  if (step < 5) {
    const TOTAL = 5;
    return (
      <div className="fixed inset-0 z-50 bg-black flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <StepDots current={step} total={TOTAL} />

          {/* Welcome */}
          {step === 0 && (
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className="text-slate-200 text-3xl">◉</span>
                <h1 className="text-xl font-medium tracking-wide text-white">PerDash</h1>
              </div>
              <p className="text-sm text-gray-500 mb-2">Your command center. Goals, habits, growth.</p>
              <p className="text-xs text-gray-600 mb-8">Set up in under a minute.</p>
              <button onClick={() => setStep(1)} className="px-6 py-2.5 text-sm bg-white text-gray-900 rounded-md hover:bg-gray-900 hover:text-white hover:-translate-y-1 transition-all duration-300">
                Get started
              </button>
            </div>
          )}

          {/* Profile: Name, Age, Gender */}
          {step === 1 && (
            <div>
              <h2 className="text-sm font-medium text-white mb-1">About you</h2>
              <p className="text-xs text-gray-500 mb-5">Let us personalize your dashboard.</p>
              <div className="space-y-3 mb-5">
                <input
                  type="text" placeholder="Your name" value={profile.name}
                  onChange={e => setProfile(p => ({ ...p, name: e.target.value }))}
                  className="w-full bg-transparent border border-white/20 rounded-md px-3 py-2 text-sm text-white placeholder-white/40 outline-none focus:border-white/60"
                />
                <div className="flex gap-3">
                    <input
                    type="number" placeholder="Age" value={profile.age} min="1"
                    onChange={e => {
                      const v = e.target.value;
                      if (v === '' || Number(v) >= 1) setProfile(p => ({ ...p, age: v }));
                    }}
                    className="flex-1 bg-transparent border border-white/20 rounded-md px-3 py-2 text-sm text-white placeholder-white/40 outline-none focus:border-white/60"
                  />
                  <select
                    value={profile.gender}
                    onChange={e => setProfile(p => ({ ...p, gender: e.target.value }))}
                    className="flex-1 bg-transparent border border-white/20 rounded-md px-3 py-2 text-sm text-white outline-none focus:border-white/60"
                  >
                    <option value="" disabled className="bg-black">Gender</option>
                    <option value="male" className="bg-black">Male</option>
                    <option value="female" className="bg-black">Female</option>
                    <option value="other" className="bg-black">Other</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-3 justify-end">
                <button onClick={() => setStep(0)} className="text-xs text-gray-500 hover:text-white transition-colors">Back</button>
                <button onClick={() => setStep(2)} className="px-4 py-2 text-xs bg-white text-gray-900 rounded-md hover:bg-gray-900 hover:text-white hover:-translate-y-1 transition-all duration-300">Next</button>
              </div>
            </div>
          )}

          {/* Daily Habits */}
          {step === 2 && (
            <div>
              <h2 className="text-sm font-medium text-white mb-1">Daily Habits</h2>
              <p className="text-xs text-gray-500 mb-5">What daily habits do you want to track?</p>
              <div className="flex flex-wrap gap-2 mb-4">
                {HABIT_OPTIONS.map(h => (
                  <button
                    key={h}
                    onClick={() => toggleHabit(h)}
                    className={`px-3 py-1.5 text-xs rounded-md border transition-all duration-300 ${
                      selectedHabits.includes(h)
                        ? 'bg-white text-gray-900 border-white'
                        : 'bg-transparent text-gray-400 border-white/20 hover:border-white/50'
                    }`}
                  >
                    {h}
                  </button>
                ))}
              </div>
              <input
                type="text" placeholder="Type a custom habit..." value={customHabit}
                onChange={e => setCustomHabit(e.target.value)}
                onKeyDown={addCustomHabit}
                className="w-full bg-transparent border border-white/20 rounded-md px-3 py-2 text-sm text-white placeholder-white/40 outline-none focus:border-white/60 mb-5"
              />
              <div className="flex gap-3 justify-end">
                <button onClick={() => setStep(1)} className="text-xs text-gray-500 hover:text-white transition-colors">Back</button>
                <button onClick={() => setStep(3)} className="px-4 py-2 text-xs bg-white text-gray-900 rounded-md hover:bg-gray-900 hover:text-white hover:-translate-y-1 transition-all duration-300">Next</button>
              </div>
            </div>
          )}

          {/* 5-Year Vision */}
          {step === 3 && (
            <div>
              <h2 className="text-sm font-medium text-white mb-1">5-Year Vision</h2>
              <p className="text-xs text-gray-500 mb-5">What do you want to achieve? Coach will create your monthly and yearly plans. You can edit them anytime.</p>
              <div className="space-y-3 mb-5">
                {CATEGORIES.map(c => (
                  <div key={c.key}>
                    <label className="text-[10px] text-gray-500 uppercase tracking-wide mb-1 block">{c.label}</label>
                    <input
                      type="text" placeholder={c.placeholder}
                      value={goals[c.key]}
                      onChange={e => setGoals(p => ({ ...p, [c.key]: e.target.value }))}
                      className="w-full bg-transparent border border-white/20 rounded-md px-3 py-2 text-sm text-white placeholder-white/40 outline-none focus:border-white/60"
                    />
                  </div>
                ))}
              </div>
              <div className="flex gap-3 justify-end">
                <button onClick={() => setStep(2)} className="text-xs text-gray-500 hover:text-white transition-colors">Back</button>
                <button onClick={() => setStep(4)} className="px-4 py-2 text-xs bg-white text-gray-900 rounded-md hover:bg-gray-900 hover:text-white hover:-translate-y-1 transition-all duration-300">Next</button>
              </div>
            </div>
          )}

          {/* Sleep */}
          {step === 4 && (
            <div>
              <h2 className="text-sm font-medium text-white mb-1">Sleep Target</h2>
              <p className="text-xs text-gray-500 mb-8">How many hours of sleep do you aim for each night?</p>
              <input
                type="range" min="5" max="12" step="0.5" value={sleepTarget}
                onChange={e => setSleepTarget(Number(e.target.value))}
                className="w-full accent-white"
              />
              <div className="text-center text-3xl font-semibold text-white mt-3 mb-8">{sleepTarget}h</div>
              <div className="flex gap-3 justify-end">
                <button onClick={() => setStep(3)} className="text-xs text-gray-500 hover:text-white transition-colors">Back</button>
                <button onClick={() => setStep(5)} className="px-4 py-2 text-xs bg-white text-gray-900 rounded-md hover:bg-gray-900 hover:text-white hover:-translate-y-1 transition-all duration-300">Next</button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Tour step
  if (tourStep < TOUR_SPOTS.length) {
    const currentSpot = TOUR_SPOTS[tourStep];
    return (
      <div className="fixed inset-0 z-50">
        {spotlight && (
          <div
            className="absolute"
            style={{
              left: spotlight.left,
              top: spotlight.top,
              width: spotlight.width,
              height: spotlight.height,
              boxShadow: '0 0 0 9999px rgba(0,0,0,0.65)',
              borderRadius: '8px',
              pointerEvents: 'none',
              zIndex: 1,
            }}
          />
        )}
        <div
          className="absolute bottom-8 left-1/2 -translate-x-1/2 bg-[#0a0a0a] border border-white/25 rounded-lg p-5 max-w-sm w-[90vw] shadow-2xl z-10"
          style={{ pointerEvents: 'auto' }}
        >
          <div className="text-xs text-gray-400 tracking-wider uppercase mb-1">{currentSpot.title}</div>
          <p className="text-sm text-gray-200 mb-4">{currentSpot.text}</p>
          <div className="flex items-center justify-between">
            <button
              onClick={() => { setTourStep(TOUR_SPOTS.length); setSpotlight(null); }}
              className="text-xs text-gray-500 hover:text-white transition-colors"
            >
              Skip tour
            </button>
            <button
              onClick={() => setTourStep(t => t + 1)}
              className="px-4 py-2 text-xs bg-white text-gray-900 rounded-md hover:bg-gray-900 hover:text-white hover:-translate-y-1 transition-all duration-300"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    );
  }

  // All set screen
  const handleFinish = () => {
    const data = {
      profile: {
        name: profile.name.trim() || 'User',
        age: profile.age,
        gender: profile.gender,
      },
      dailyChecklist: {
        presets: selectedHabits.map((text, i) => ({ id: `pc-${i}`, text, active: true })),
        logs: {},
      },
      goals: {
        fiveYear: CATEGORIES
          .filter(c => goals[c.key].trim())
          .map((c, i) => ({ id: `fy-${c.key}`, text: goals[c.key].trim(), progress: 0 })),
        yearly: [],
        monthly: [],
      },
      settings: { sleepTarget, installDate: new Date().toISOString() },
    };
    onFinish(data);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
      <div className="text-center">
        <h2 className="text-lg font-medium text-white mb-2">You're all set, {profile.name.trim() || 'User'}.</h2>
        <p className="text-sm text-gray-500 mb-6">Lock in.</p>
        <button onClick={handleFinish} className="px-6 py-2.5 text-sm bg-white text-gray-900 rounded-md hover:bg-gray-900 hover:text-white hover:-translate-y-1 transition-all duration-300">
          Start
        </button>
      </div>
    </div>
  );
}