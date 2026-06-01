import React, { useState } from 'react';
import { useData } from '../store';
import { getGoalDeadlineStatus } from '../utils/analysis';

function GoalSection({ title, goals, onAdd, onUpdate, onDelete }) {
  const [newText, setNewText] = useState('');

  const handleAdd = () => {
    if (!newText.trim()) return;
    onAdd({ text: newText.trim(), progress: 0 });
    setNewText('');
  };

  return (
    <div>
      <div className="text-xs text-slate-400 tracking-wider uppercase mb-3">{title}</div>
      <div className="space-y-2">
        {goals.map(g => {
          const status = getGoalDeadlineStatus(g);
          const isUrgent = status === 'at-risk';
          const isCompleted = status === 'completed';
          return (
            <div
              key={g.id}
              className={`bg-[#0a0a0a] border rounded-lg p-4 ${
                isCompleted
                  ? 'border-green-900/40 opacity-60'
                  : isUrgent
                    ? 'border-red-900/50'
                    : 'border-[#1e3a5f]/60'
              }`}
            >
              <div className="flex items-start justify-between gap-3 mb-3">
                <span className={`text-sm flex-1 ${isCompleted ? 'line-through text-slate-600' : 'text-slate-200'}`}>
                  {g.text}
                </span>
                <span className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded shrink-0 ${
                  isUrgent ? 'bg-red-900/30 text-red-400' : isCompleted ? 'bg-green-900/30 text-green-400' : 'bg-blue-900/30 text-blue-400'
                }`}>
                  {status}
                </span>
                <button className="text-xs text-slate-600 hover:text-red-400 transition-colors shrink-0" onClick={() => onDelete(g.id)}>
                  ✕
                </button>
              </div>
              <div className="flex items-center gap-3">
                <input
                  type="range" min="0" max="100" value={g.progress}
                  onChange={(e) => onUpdate(g.id, { ...g, progress: Number(e.target.value) })}
                  className="flex-1 h-1.5 bg-[#1e3a5f]/40 rounded-full appearance-none cursor-pointer
                    [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3.5 [&::-webkit-slider-thumb]:h-3.5
                    [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-blue-500
                    [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-[#0a0a0a]
                    [&::-webkit-slider-thumb]:shadow-[0_0_6px_rgba(59,130,246,0.4)]
                    [&::-moz-range-thumb]:w-3.5 [&::-moz-range-thumb]:h-3.5 [&::-moz-range-thumb]:rounded-full
                    [&::-moz-range-thumb]:bg-blue-500 [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-[#0a0a0a]"
                />
                <span className="text-xs text-slate-500 min-w-[32px] text-right">{g.progress}%</span>
              </div>
            </div>
          );
        })}
      </div>
      <div className="flex gap-2 mt-3">
        <input
          type="text" placeholder={`Add ${title.toLowerCase()}...`} value={newText}
          onChange={(e) => setNewText(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
          className="flex-1 bg-black border border-[#1e3a5f]/40 rounded-md px-3 py-2 text-sm text-slate-200 placeholder-slate-600 outline-none focus:border-blue-900/60 transition-colors"
        />
        <button onClick={handleAdd} className="px-3 py-2 text-xs bg-blue-900/30 border border-blue-900/60 text-blue-400 rounded-md hover:bg-blue-900/50 transition-all duration-150">
          + Add
        </button>
      </div>
    </div>
  );
}

export default function Goals() {
  const { data, updateData } = useData();
  const { fiveYear, yearly, monthly } = data.goals;

  const handleAdd = (level) => (item) => {
    updateData(prev => ({
      ...prev,
      goals: {
        ...prev.goals,
        [level]: [...prev.goals[level], { id: `${level}-${Date.now()}`, ...item }],
      },
    }));
  };

  const handleUpdate = (level) => (id, updated) => {
    updateData(prev => ({
      ...prev,
      goals: {
        ...prev.goals,
        [level]: prev.goals[level].map(g => g.id === id ? updated : g),
      },
    }));
  };

  const handleDelete = (level) => (id) => {
    updateData(prev => ({
      ...prev,
      goals: {
        ...prev.goals,
        [level]: prev.goals[level].filter(g => g.id !== id),
      },
    }));
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <p className="text-xs text-slate-400">5-Year → Yearly → Monthly. Each milestone feeds the next.</p>
      <GoalSection
        title="5-Year Goals"
        goals={fiveYear}
        onAdd={handleAdd('fiveYear')}
        onUpdate={handleUpdate('fiveYear')}
        onDelete={handleDelete('fiveYear')}
      />
      <GoalSection
        title="Yearly Goals"
        goals={yearly}
        onAdd={handleAdd('yearly')}
        onUpdate={handleUpdate('yearly')}
        onDelete={handleDelete('yearly')}
      />
      <GoalSection
        title="Monthly Goals"
        goals={monthly}
        onAdd={handleAdd('monthly')}
        onUpdate={handleUpdate('monthly')}
        onDelete={handleDelete('monthly')}
      />
    </div>
  );
}
