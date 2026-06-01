import React, { useState } from 'react';
import { useData } from '../store';
import { getWeeklyWorkoutStreak } from '../utils/analysis';

export default function WorkoutTracker() {
  const { data, logWorkout, getTodayWorkout, updateData } = useData();
  const [logText, setLogText] = useState('');
  const todayWorkout = getTodayWorkout();
  const streak = getWeeklyWorkoutStreak(data);

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
      <div className="bg-[#0a0a0a] border border-[#1e3a5f]/60 rounded-lg p-5">
        <div className="flex items-center gap-4 flex-wrap">
          <div>
            <div className="text-[10px] text-slate-600 tracking-wider uppercase">This Week</div>
            <div className={`text-lg font-semibold ${streak < 3 ? 'text-red-400' : 'text-slate-200'}`}>
              {streak}/7 days
            </div>
          </div>
          <div className="flex gap-1">
            {[0,1,2,3,4,5,6].map(i => (
              <div
                key={i}
                className={`w-5 h-5 rounded-full border transition-all duration-300 ${
                  i < streak
                    ? 'bg-blue-500 border-blue-500 shadow-[0_0_6px_rgba(59,130,246,0.4)]'
                    : 'bg-transparent border-[#1e3a5f]/60'
                }`}
              />
            ))}
          </div>
          {streak === 0 && <p className="text-xs text-red-400 w-full">Not a single workout this week. Start today.</p>}
          {streak === 7 && <p className="text-xs text-green-400 w-full">Perfect week. This is the standard.</p>}
        </div>
      </div>

      <div className="bg-[#0a0a0a] border border-[#1e3a5f]/60 rounded-lg p-5">
        <div className="text-xs text-slate-500 tracking-wider uppercase mb-3">Today's Log</div>
        <div className="flex gap-2 mb-3">
          <input
            type="text" placeholder="e.g., Ran 5km, 30min" value={logText}
            onChange={(e) => setLogText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleLog()}
            className="flex-1 bg-black border border-[#1e3a5f]/40 rounded-md px-3 py-2 text-sm text-slate-200 placeholder-slate-600 outline-none focus:border-blue-900/60 transition-colors"
          />
          <button onClick={handleLog} className="px-3 py-2 text-xs bg-blue-900/30 border border-blue-900/60 text-blue-400 rounded-md hover:bg-blue-900/50 transition-all duration-150">
            Log
          </button>
        </div>
        <div className="space-y-1">
          {todayWorkout.map(entry => (
            <div key={entry.id} className="px-3 py-2 bg-black border border-[#1e3a5f]/30 rounded-md text-sm text-slate-400">
              {entry.text}
            </div>
          ))}
          {todayWorkout.length === 0 && <span className="text-xs text-slate-600 italic">Nothing logged yet today</span>}
        </div>
      </div>

      <div>
        <div className="text-xs text-slate-500 tracking-wider uppercase mb-3">Active Challenges</div>
        <div className="space-y-3">
          {data.workouts.challenges.filter(c => c.active).map(c => {
            const doneSteps = c.steps.filter(s => s.done).length;
            const progress = c.steps.length > 0 ? Math.round((doneSteps / c.steps.length) * 100) : 0;
            return (
              <div key={c.id} className="bg-[#0a0a0a] border border-[#1e3a5f]/60 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-slate-200">{c.name}</span>
                  <span className="text-xs text-slate-500">{doneSteps}/{c.steps.length}</span>
                </div>
                <div className="h-1.5 bg-[#1e3a5f]/40 rounded-full overflow-hidden mb-3">
                  <div className="h-full bg-blue-500 rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
                </div>
                <div className="space-y-1">
                  {c.steps.map((s, idx) => (
                    <label key={s.id} className={`flex items-center gap-3 px-2 py-1.5 rounded cursor-pointer transition-colors hover:bg-[#1e3a5f]/10 ${s.done ? 'opacity-60' : ''}`}>
                      <input
                        type="checkbox" checked={s.done}
                        onChange={() => toggleChallengeStep(c.id, s.id)}
                        className="appearance-none w-4 h-4 border-2 rounded-sm cursor-pointer shrink-0 transition-all duration-150
                          checked:bg-blue-500 checked:border-blue-500
                          border-slate-600 hover:border-slate-400
                          checked:after:content-['✓'] checked:after:text-[10px] checked:after:text-black checked:after:flex checked:after:items-center checked:after:justify-center"
                      />
                      <span className={`text-xs ${s.done ? 'line-through text-slate-600' : 'text-slate-400'}`}>
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
                      className="w-full bg-black border border-[#1e3a5f]/40 rounded-md px-3 py-1.5 text-xs text-slate-200 placeholder-slate-600 outline-none focus:border-blue-900/60 transition-colors"
                    />
                  </div>
                </div>
              </div>
            );
          })}
          {data.workouts.challenges.filter(c => c.active).length === 0 && (
            <div className="text-xs text-slate-600 italic">No active challenges. Add one below.</div>
          )}
        </div>
        <div className="flex gap-2 mt-3">
          <input
            type="text" placeholder="New challenge (e.g., Muscle Up, 10k under 5:30)"
            value={newChallenge}
            onChange={(e) => setNewChallenge(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') { addChallenge(newChallenge); setNewChallenge(''); } }}
            className="flex-1 bg-black border border-[#1e3a5f]/40 rounded-md px-3 py-2 text-sm text-slate-200 placeholder-slate-600 outline-none focus:border-blue-900/60 transition-colors"
          />
          <button className="px-3 py-2 text-xs bg-blue-900/30 border border-blue-900/60 text-blue-400 rounded-md hover:bg-blue-900/50 transition-all duration-150" onClick={() => { addChallenge(newChallenge); setNewChallenge(''); }}>
            Add
          </button>
        </div>
      </div>
    </div>
  );
}
