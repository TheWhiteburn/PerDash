import React from 'react';
import { useData } from '../store';

export default function DailyChecklist() {
  const { data, getTodayChecklist, setTodayChecklist, updateData } = useData();
  const items = getTodayChecklist();
  const doneCount = items.filter(i => i.done).length;
  const totalCount = items.length;

  const toggleItem = (id) => {
    const updated = items.map(i => i.id === id ? { ...i, done: !i.done } : i);
    setTodayChecklist(updated);
  };

  const addManualItem = (e) => {
    if (e.key !== 'Enter') return;
    const text = e.target.value.trim();
    if (!text) return;
    const updated = [...items, { id: `manual-${Date.now()}`, text, done: false }];
    setTodayChecklist(updated);
    e.target.value = '';
  };

  const togglePreset = (id) => {
    updateData(prev => ({
      ...prev,
      dailyChecklist: {
        ...prev.dailyChecklist,
        presets: prev.dailyChecklist.presets.map(p =>
          p.id === id ? { ...p, active: !p.active } : p
        ),
      },
    }));
  };

  const addPreset = (e) => {
    if (e.key !== 'Enter') return;
    const text = e.target.value.trim();
    if (!text) return;
    updateData(prev => ({
      ...prev,
      dailyChecklist: {
        ...prev.dailyChecklist,
        presets: [...prev.dailyChecklist.presets, { id: `pc-${Date.now()}`, text, active: true }],
      },
    }));
    e.target.value = '';
  };

  return (
    <div className="tab-content">
      <h2>Daily Checklist</h2>

      <div className="checklist-progress">
        <div className="progress-bar-container large">
          <div className="progress-bar-fill" style={{ width: totalCount > 0 ? `${(doneCount / totalCount) * 100}%` : '0%' }} />
        </div>
        <span className="progress-label">{doneCount}/{totalCount} done</span>
      </div>

      <div className="checklist-items">
        {items.map(item => (
          <label key={item.id} className={`checklist-item ${item.done ? 'done' : ''}`}>
            <input
              type="checkbox" checked={item.done}
              onChange={() => toggleItem(item.id)}
              className="checkbox"
            />
            <span className="checklist-text">{item.text}</span>
          </label>
        ))}
      </div>

      <input
        type="text" placeholder="Add a task for today..." onKeyDown={addManualItem}
        className="input-text"
      />

      <div className="presets-section">
        <h3>Recurring Items</h3>
        {data.dailyChecklist.presets.map(p => (
          <label key={p.id} className="preset-item">
            <input
              type="checkbox" checked={p.active}
              onChange={() => togglePreset(p.id)}
              className="checkbox"
            />
            <span className={p.active ? '' : 'inactive'}>{p.text}</span>
          </label>
        ))}
        <input
          type="text" placeholder="Add recurring item..." onKeyDown={addPreset}
          className="input-text"
        />
      </div>
    </div>
  );
}
