import React, { useState } from 'react';
import { useData } from '../store';
import { getGoalDeadlineStatus } from '../utils/analysis';

function ladder(v, l=40, h=90) {
  if (v < l) return { cls: 'text-red-400', bg: 'bg-red-400' };
  if (v >= h) return { cls: 'text-green-400', bg: 'bg-green-400' };
  return { cls: 'text-gray-300', bg: 'bg-gray-400' };
}

function GoalSection({ title, goals, onAdd, onUpdate, onDelete }) {
  const [newText, setNewText] = useState('');

  const handleAdd = () => {
    if (!newText.trim()) return;
    onAdd({ text: newText.trim(), progress: 0 });
    setNewText('');
  };

  return (
    <div>
      <div className="text-xs text-gray-400 tracking-wider uppercase mb-3">{title}</div>
      <div className="space-y-2">
        {goals.map(g => {
          const status = getGoalDeadlineStatus(g);
          const isUrgent = status === 'at-risk';
          const isCompleted = status === 'completed';
          const pc = ladder(g.progress);
          return (
            <div
              key={g.id}
              className={`bg-[#0a0a0a] border border-white/25 rounded-lg p-4 shadow-card-white hover:-translate-y-0.5 hover:border-white/35 transition-all duration-200 ${isCompleted ? 'opacity-60' : ''}`}
            >
              <div className="flex items-start justify-between gap-3 mb-3">
                <span className={`text-sm flex-1 ${isCompleted ? 'line-through text-gray-600' : 'text-gray-200'}`}>
                  {g.text}
                </span>
                <span className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded shrink-0 ${
                  isUrgent ? 'bg-red-900/30 text-red-400' : isCompleted ? 'bg-green-900/30 text-green-400' : 'bg-gray-800 text-gray-400'
                }`}>
                  {status}
                </span>
                <button className="text-xs text-gray-500 hover:text-red-400 transition-colors shrink-0" onClick={() => onDelete(g.id)}>
                  ✕
                </button>
              </div>
              <div className="flex items-center gap-3">
                <input
                  type="range" min="0" max="100" value={g.progress}
                  onChange={(e) => onUpdate(g.id, { ...g, progress: Number(e.target.value) })}
                  className="flex-1 h-1.5 bg-gray-800 rounded-full appearance-none cursor-pointer
                    [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3.5 [&::-webkit-slider-thumb]:h-3.5
                    [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-gray-300
                    [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-[#0a0a0a]
                    [&::-moz-range-thumb]:w-3.5 [&::-moz-range-thumb]:h-3.5 [&::-moz-range-thumb]:rounded-full
                    [&::-moz-range-thumb]:bg-gray-300 [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-[#0a0a0a]"
                />
                <span className={`text-xs min-w-[32px] text-right ${pc.cls}`}>{g.progress}%</span>
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
          className="flex-1 bg-black border border-white/25 rounded-md px-3 py-2 text-sm text-gray-200 placeholder-gray-600 outline-none focus:border-gray-400 transition-colors"
        />
        <button onClick={handleAdd} className="group relative overflow-hidden px-3 py-2 text-xs bg-white text-gray-900 rounded-md hover:bg-gray-100 hover:-translate-y-0.5 transition-all duration-200">
          <span className="relative">
            <span className="relative z-10">+ Add</span>
            <span className="absolute inset-0 bg-black/8 rounded-sm scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left pointer-events-none" />
          </span>
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
      <p className="text-xs text-gray-400">5-Year → Yearly → Monthly. Each milestone feeds the next.</p>
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
