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
    <div className="goal-section">
      <h3>{title}</h3>
      {goals.map(g => (
        <div key={g.id} className="goal-card" data-status={getGoalDeadlineStatus(g)}>
          <div className="goal-header">
            <span className="goal-text">{g.text}</span>
            <span className="goal-status-badge">{getGoalDeadlineStatus(g)}</span>
            <button className="btn-sm danger" onClick={() => onDelete(g.id)}>✕</button>
          </div>
          <div className="goal-progress-row">
            <input
              type="range"
              min="0" max="100" value={g.progress}
              onChange={(e) => onUpdate(g.id, { ...g, progress: Number(e.target.value) })}
              className="progress-slider"
            />
            <span className="goal-percent">{g.progress}%</span>
          </div>
        </div>
      ))}
      <div className="add-goal-row">
        <input
          type="text" placeholder={`Add ${title.toLowerCase()}...`} value={newText}
          onChange={(e) => setNewText(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
          className="input-text"
        />
        <button className="btn-primary" onClick={handleAdd}>+</button>
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
    <div className="tab-content">
      <h2>Goals</h2>
      <p className="section-subtitle">5-Year → Yearly → Monthly. Each milestone feeds the next.</p>

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
