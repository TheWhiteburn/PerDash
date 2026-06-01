import React, { useState } from 'react';
import { useData } from '../store';
import { getGoalDeadlineStatus } from '../utils/analysis';

function ladder(v, l=40, h=90) {
  if (v < l) return { cls: 'text-red-400', bg: 'bg-red-400' };
  if (v >= h) return { cls: 'text-green-400', bg: 'bg-green-400' };
  return { cls: 'text-gray-700', bg: 'bg-gray-600' };
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
      <div className="text-xs text-gray-500 tracking-wider uppercase mb-3">{title}</div>
      <div className="space-y-2">
        {goals.map(g => {
          const status = getGoalDeadlineStatus(g);
          const isUrgent = status === 'at-risk';
          const isCompleted = status === 'completed';
          const pc = ladder(g.progress);
          return (
            <div
              key={g.id}
              className={`bg-[#f5f5f5] border border-black rounded-lg p-4 shadow-card-white ${
                isCompleted ? 'opacity-60' : ''
              }`}
            >
              <div className="flex items-start justify-between gap-3 mb-3">
                <span className={`text-sm flex-1 ${isCompleted ? 'line-through text-gray-400' : 'text-gray-900'}`}>
                  {g.text}
                </span>
                <span className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded shrink-0 ${
                  isUrgent ? 'bg-red-100 text-red-600' : isCompleted ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-600'
                }`}>
                  {status}
                </span>
                <button className="text-xs text-gray-400 hover:text-red-500 transition-colors shrink-0" onClick={() => onDelete(g.id)}>
                  ✕
                </button>
              </div>
              <div className="flex items-center gap-3">
                <input
                  type="range" min="0" max="100" value={g.progress}
                  onChange={(e) => onUpdate(g.id, { ...g, progress: Number(e.target.value) })}
                  className="flex-1 h-1.5 bg-gray-200 rounded-full appearance-none cursor-pointer
                    [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3.5 [&::-webkit-slider-thumb]:h-3.5
                    [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-gray-700
                    [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white
                    [&::-moz-range-thumb]:w-3.5 [&::-moz-range-thumb]:h-3.5 [&::-moz-range-thumb]:rounded-full
                    [&::-moz-range-thumb]:bg-gray-700 [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-white"
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
          className="flex-1 bg-white border border-black/20 rounded-md px-3 py-2 text-sm text-gray-900 placeholder-gray-400 outline-none focus:border-gray-500 transition-colors"
        />
        <button onClick={handleAdd} className="px-3 py-2 text-xs bg-gray-900 text-white rounded-md hover:bg-gray-800 transition-all duration-150">
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
