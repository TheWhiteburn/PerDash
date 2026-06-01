import React from 'react';
import { useData } from '../store';

export default function DailyChecklist() {
  const { data, getTodayChecklist, setTodayChecklist, updateData } = useData();
  const items = getTodayChecklist();
  const doneCount = items.filter(i => i.done).length;
  const totalCount = items.length;
  const progress = totalCount > 0 ? Math.round((doneCount / totalCount) * 100) : 0;

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
    <div className="max-w-2xl mx-auto space-y-5">
      <div className="bg-[#0a0a0a] border border-[#1e3a5f]/60 rounded-lg p-5">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs text-slate-500 tracking-wider uppercase">Today</span>
          <span className="text-xs text-slate-500">{doneCount}/{totalCount} done</span>
        </div>
        <div className="h-2 bg-[#1e3a5f]/40 rounded-full overflow-hidden mb-5">
          <div className="h-full bg-blue-500 rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
        </div>
        <div className="space-y-1">
          {items.map(item => (
            <label
              key={item.id}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-md cursor-pointer transition-all duration-150 ${
                item.done ? 'bg-[#1e3a5f]/10' : 'bg-[#0a0a0a] border border-[#1e3a5f]/40 hover:border-slate-600'
              }`}
            >
              <input
                type="checkbox" checked={item.done}
                onChange={() => toggleItem(item.id)}
                className="appearance-none w-4 h-4 border-2 rounded-sm cursor-pointer shrink-0 transition-all duration-150
                  checked:bg-blue-500 checked:border-blue-500
                  border-slate-600 hover:border-slate-400
                  checked:after:content-['✓'] checked:after:text-[10px] checked:after:text-black checked:after:flex checked:after:items-center checked:after:justify-center"
              />
              <span className={`text-sm ${item.done ? 'line-through text-slate-600' : 'text-slate-300'}`}>
                {item.text}
              </span>
            </label>
          ))}
        </div>
        <input
          type="text" placeholder="Add a task for today..." onKeyDown={addManualItem}
          className="w-full bg-black border border-[#1e3a5f]/40 rounded-md px-3 py-2 mt-3 text-sm text-slate-200 placeholder-slate-600 outline-none focus:border-blue-900/60 transition-colors"
        />
      </div>

      <div className="bg-[#0a0a0a] border border-[#1e3a5f]/40 rounded-lg p-5">
        <div className="text-xs text-slate-500 tracking-wider uppercase mb-3">Recurring Items</div>
        <div className="space-y-1">
          {data.dailyChecklist.presets.map(p => (
            <label key={p.id} className="flex items-center gap-3 px-3 py-2 rounded-md cursor-pointer hover:bg-[#1e3a5f]/10 transition-colors">
              <input
                type="checkbox" checked={p.active}
                onChange={() => togglePreset(p.id)}
                className="appearance-none w-4 h-4 border-2 rounded-sm cursor-pointer shrink-0 transition-all duration-150
                  checked:bg-blue-500 checked:border-blue-500
                  border-slate-600 hover:border-slate-400
                  checked:after:content-['✓'] checked:after:text-[10px] checked:after:text-black checked:after:flex checked:after:items-center checked:after:justify-center"
              />
              <span className={`text-sm ${p.active ? 'text-slate-300' : 'text-slate-600 line-through'}`}>
                {p.text}
              </span>
            </label>
          ))}
        </div>
        <input
          type="text" placeholder="Add recurring item..." onKeyDown={addPreset}
          className="w-full bg-black border border-[#1e3a5f]/40 rounded-md px-3 py-2 mt-3 text-sm text-slate-200 placeholder-slate-600 outline-none focus:border-blue-900/60 transition-colors"
        />
      </div>
    </div>
  );
}
