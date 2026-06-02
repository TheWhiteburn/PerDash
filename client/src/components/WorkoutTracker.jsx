import React, { useState } from 'react';
import { useData } from '../store';
import { getWeeklyWorkoutStreak } from '../utils/analysis';

function ladder(v, l=40, h=90) {
  if (v < l) return { cls: 'text-red-400', fill: '#f87171', bg: 'bg-red-400', dot: 'bg-red-400 border-red-400' };
  if (v >= h) return { cls: 'text-green-400', fill: '#4ade80', bg: 'bg-green-400', dot: 'bg-green-400 border-green-400' };
  return { cls: 'text-gray-300', fill: '#999', bg: 'bg-gray-400', dot: 'bg-gray-400 border-gray-400' };
}

export default function WorkoutTracker() {
  const { data, logWorkout, getTodayWorkout, updateData } = useData();
  const [logText, setLogText] = useState('');
  const todayWorkout = getTodayWorkout();
  const streak = getWeeklyWorkoutStreak(data);
  const sc = ladder(streak, 3, 6);

  const handleLog = () => {
    if (!logText.trim()) return;
    logWorkout({ text: logText.trim() });
    setLogText('');
  };

  const toggleChallengeStep = (challengeId, stepId) => {
    updateData(prev => ({
      ...prev,
      workouts: {
        ...prev.workouts,
        challenges: prev.workouts.challenges.map(c =>
          c.id === challengeId ? {
            ...c,
            steps: c.steps.map(s =>
              s.id === stepId ? { ...s, done: !s.done } : s
            ),
          } : c
        ),
      },
    }));
  };

  const addChallenge = (name) => {
    if (!name.trim()) return;
    updateData(prev => ({
      ...prev,
      workouts: {
        ...prev.workouts,
        challenges: [...prev.workouts.challenges, {
          id: `ch-${Date.now()}`,
          name: name.trim(),
          active: true,
          steps: [{ id: `ch-${Date.now()}-s1`, text: 'Define training plan', done: false }],
        }],
      },
    }));
  };

  const addChallengeStep = (challengeId, text) => {
    if (!text.trim()) return;
    updateData(prev => ({
      ...prev,
      workouts: {
        ...prev.workouts,
        challenges: prev.workouts.challenges.map(c =>
          c.id === challengeId ? {
            ...c,
            steps: [...c.steps, { id: `${c.id}-s${Date.now()}`, text: text.trim(), done: false }],
          } : c
        ),
      },
    }));
  };

  const [newChallenge, setNewChallenge] = useState('');
  const [newStepText, setNewStepText] = useState({});

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      <div className="card-bg border border-white/25 rounded-lg p-5 shadow-card-white hover:-translate-y-1 hover:shadow-[-8px_8px_28px_rgba(255,255,255,0.2)] hover:border-white/50 transition-all duration-300">
        <div className="flex items-center gap-4 flex-wrap">
          <div>
            <div className="text-[10px] text-gray-400 tracking-wider uppercase">This Week</div>
            <div className={`text-lg font-semibold ${sc.cls}`}>{streak}/7 days</div>
          </div>
          <div className="flex gap-1">
            {[0,1,2,3,4,5,6].map(i => {
              const fillClass = i < streak ? sc.dot : 'bg-transparent border-gray-600';
              return (
                <div key={i} className={`w-5 h-5 rounded-full border transition-all duration-300 ${fillClass}`} />
              );
            })}
          </div>
          {streak === 0 && <p className="text-xs text-red-400 w-full">Not a single workout this week. Start today.</p>}
          {streak === 7 && <p className="text-xs text-green-400 w-full">Perfect week. This is the standard.</p>}
        </div>
      </div>

      <div className="card-bg border border-white/25 rounded-lg p-5 shadow-card-white hover:-translate-y-1 hover:shadow-[-8px_8px_28px_rgba(255,255,255,0.2)] hover:border-white/50 transition-all duration-300">
        <div className="text-xs text-gray-400 tracking-wider uppercase mb-3">Today's Log</div>
        <div className="flex gap-2 mb-3">
          <input
            type="text" placeholder="e.g., Ran 5km, 30min" value={logText}
            onChange={(e) => setLogText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleLog()}
            className="flex-1 bg-black border border-white/25 rounded-md px-3 py-2 text-sm text-gray-200 placeholder-gray-600 outline-none focus:border-gray-400 transition-colors"
          />
          <button onClick={handleLog} className="px-3 py-2 text-xs bg-white text-gray-900 rounded-md hover:bg-gray-900 hover:text-white hover:-translate-y-1 transition-all duration-300">
            Log
          </button>
        </div>
        <div className="space-y-1">
          {todayWorkout.map(entry => (
            <div key={entry.id} className="px-3 py-2 bg-black border border-white/10 rounded-md text-sm text-gray-400">
              {entry.text}
            </div>
          ))}
          {todayWorkout.length === 0 && <span className="text-xs text-gray-600 italic">Nothing logged yet today</span>}
        </div>
      </div>

      <div>
        <div className="text-xs text-gray-400 tracking-wider uppercase mb-3">Active Challenges</div>
        <div className="space-y-3">
          {data.workouts.challenges.filter(c => c.active).map(c => {
            const doneSteps = c.steps.filter(s => s.done).length;
            const progress = c.steps.length > 0 ? Math.round((doneSteps / c.steps.length) * 100) : 0;
            const pc = ladder(progress);
            return (
              <div key={c.id} className="card-bg border border-white/25 rounded-lg p-4 shadow-card-white hover:-translate-y-1 hover:shadow-[-8px_8px_28px_rgba(255,255,255,0.2)] hover:border-white/50 transition-all duration-300">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-200">{c.name}</span>
                  <span className={`text-xs ${pc.cls}`}>{doneSteps}/{c.steps.length}</span>
                </div>
                <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden mb-3">
                  <div className={`h-full rounded-full transition-all duration-500 ${pc.bg}`} style={{ width: `${progress}%` }} />
                </div>
                <div className="space-y-1">
                  {c.steps.map((s, idx) => (
                    <label key={s.id} className={`flex items-center gap-3 px-2 py-1.5 rounded cursor-pointer transition-colors hover:bg-white/5 ${s.done ? 'opacity-60' : ''}`}>
                      <input
                        type="checkbox" checked={s.done}
                        onChange={() => toggleChallengeStep(c.id, s.id)}
                        className="appearance-none w-4 h-4 border-2 rounded-sm cursor-pointer shrink-0 transition-all duration-150
                          checked:bg-gray-300 checked:border-gray-300
                          border-gray-500 hover:border-gray-400
                          checked:after:content-['✓'] checked:after:text-[10px] checked:after:text-black checked:after:flex checked:after:items-center checked:after:justify-center"
                      />
                      <span className={`text-xs ${s.done ? 'line-through text-gray-600' : 'text-gray-400'}`}>
                        Step {idx + 1}: {s.text}
                      </span>
                    </label>
                  ))}
                  <div className="mt-2">
                    <input
                      type="text" placeholder="Add step..."
                      value={newStepText[c.id] || ''}
                      onChange={(e) => setNewStepText(p => ({ ...p, [c.id]: e.target.value }))}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          addChallengeStep(c.id, newStepText[c.id] || '');
                          setNewStepText(p => ({ ...p, [c.id]: '' }));
                        }
                      }}
                      className="w-full bg-black border border-white/25 rounded-md px-3 py-1.5 text-xs text-gray-200 placeholder-gray-600 outline-none focus:border-gray-400 transition-colors"
                    />
                  </div>
                </div>
              </div>
            );
          })}
          {data.workouts.challenges.filter(c => c.active).length === 0 && (
            <div className="text-xs text-gray-600 italic">No active challenges. Add one below.</div>
          )}
        </div>
        <div className="flex gap-2 mt-3">
          <input
            type="text" placeholder="New challenge (e.g., Muscle Up, 10k under 5:30)"
            value={newChallenge}
            onChange={(e) => setNewChallenge(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') { addChallenge(newChallenge); setNewChallenge(''); } }}
            className="flex-1 bg-black border border-white/25 rounded-md px-3 py-2 text-sm text-gray-200 placeholder-gray-600 outline-none focus:border-gray-400 transition-colors"
          />
          <button className="px-3 py-2 text-xs bg-white text-gray-900 rounded-md hover:bg-gray-900 hover:text-white hover:-translate-y-1 transition-all duration-300" onClick={() => { addChallenge(newChallenge); setNewChallenge(''); }}>
            Add
          </button>
        </div>
      </div>
    </div>
  );
}
