import React from 'react';
import { useData } from '../store';

function ladder(v, l=40, h=90) {
  if (v < l) return { cls: 'text-red-400', bg: 'bg-red-400', fill: '#f87171' };
  if (v >= h) return { cls: 'text-green-400', bg: 'bg-green-400', fill: '#4ade80' };
  return { cls: 'text-gray-700', bg: 'bg-gray-600', fill: '#555' };
}

export default function DailyChecklist() {
  const { data, getTodayChecklist, setTodayChecklist, updateData } = useData();
  const items = getTodayChecklist();
  const doneCount = items.filter(i => i.done).length;
  const totalCount = items.length;
  const progress = totalCount > 0 ? Math.round((doneCount / totalCount) * 100) : 0;
  const pc = ladder(progress);

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
      <div className="bg-[#f5f5f5] border border-black rounded-lg p-5 shadow-card-white">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs text-gray-500 tracking-wider uppercase">Today</span>
          <span className={`text-xs ${pc.cls}`}>{doneCount}/{totalCount} done</span>
        </div>
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden mb-5">
          <div className={`h-full rounded-full transition-all duration-500 ${pc.bg}`} style={{ width: `${progress}%` }} />
        </div>
        <div className="space-y-1">
          {items.map(item => (
            <label
              key={item.id}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-md cursor-pointer transition-all duration-150 ${
                item.done ? 'bg-black/5' : 'bg-white border border-black/10 hover:border-gray-400'
              }`}
            >
              <input
                type="checkbox" checked={item.done}
                onChange={() => toggleItem(item.id)}
                className="appearance-none w-4 h-4 border-2 rounded-sm cursor-pointer shrink-0 transition-all duration-150
                  checked:bg-gray-900 checked:border-gray-900
                  border-gray-400 hover:border-gray-600
                  checked:after:content-['✓'] checked:after:text-[10px] checked:after:text-white checked:after:flex checked:after:items-center checked:after:justify-center"
              />
              <span className={`text-sm ${item.done ? 'line-through text-gray-400' : 'text-gray-900'}`}>
                {item.text}
              </span>
            </label>
          ))}
        </div>
        <input
          type="text" placeholder="Add a task for today..." onKeyDown={addManualItem}
          className="w-full bg-white border border-black/20 rounded-md px-3 py-2 mt-3 text-sm text-gray-900 placeholder-gray-400 outline-none focus:border-gray-500 transition-colors"
        />
      </div>

      <div className="bg-[#f5f5f5] border border-black rounded-lg p-5 shadow-card-white">
        <div className="text-xs text-gray-500 tracking-wider uppercase mb-3">Recurring Items</div>
        <div className="space-y-1">
          {data.dailyChecklist.presets.map(p => (
            <label key={p.id} className="flex items-center gap-3 px-3 py-2 rounded-md cursor-pointer hover:bg-black/5 transition-colors">
              <input
                type="checkbox" checked={p.active}
                onChange={() => togglePreset(p.id)}
                className="appearance-none w-4 h-4 border-2 rounded-sm cursor-pointer shrink-0 transition-all duration-150
                  checked:bg-gray-900 checked:border-gray-900
                  border-gray-400 hover:border-gray-600
                  checked:after:content-['✓'] checked:after:text-[10px] checked:after:text-white checked:after:flex checked:after:items-center checked:after:justify-center"
              />
              <span className={`text-sm ${p.active ? 'text-gray-900' : 'text-gray-400 line-through'}`}>
                {p.text}
              </span>
            </label>
          ))}
        </div>
        <input
          type="text" placeholder="Add recurring item..." onKeyDown={addPreset}
          className="w-full bg-white border border-black/20 rounded-md px-3 py-2 mt-3 text-sm text-gray-900 placeholder-gray-400 outline-none focus:border-gray-500 transition-colors"
        />
      </div>
    </div>
  );
}
