import React, { useState } from 'react';
import { useData } from '../store';
import { getSleepTrend, getSleepAverage } from '../utils/analysis';

export default function SleepTracker() {
  const { data, logSleep, getTodayKey } = useData();
  const [inputHours, setInputHours] = useState('');
  const trend = getSleepTrend(data);
  const avg = getSleepAverage(data);
  const todayKey = getTodayKey();
  const todaySleep = data.sleep.logs[todayKey];
  const target = data.settings.sleepTarget;

  const handleLog = () => {
    const hours = parseFloat(inputHours);
    if (isNaN(hours) || hours < 0 || hours > 24) return;
    logSleep(hours);
    setInputHours('');
  };

  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const getDayLabel = (dateStr) => {
    const d = new Date(dateStr);
    return days[d.getDay()];
  };

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      <p className="text-xs text-slate-500">Target: {target}h minimum</p>

      <div className="bg-[#0a0a0a] border border-[#1e3a5f]/60 rounded-lg p-5">
        <div className="text-xs text-slate-400 tracking-wider uppercase mb-3">Log Tonight's Sleep</div>
        <div className="flex gap-2">
          <input
            type="number" step="0.5" min="0" max="24"
            placeholder="Hours slept..." value={inputHours}
            onChange={(e) => setInputHours(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleLog()}
            className="flex-1 bg-black border border-[#1e3a5f]/40 rounded-md px-3 py-2 text-sm text-slate-200 placeholder-slate-600 outline-none focus:border-blue-900/60 transition-colors [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
          />
          <button onClick={handleLog} className="px-3 py-2 text-xs bg-blue-900/30 border border-blue-900/60 text-blue-400 rounded-md hover:bg-blue-900/50 transition-all duration-150">
            Log
          </button>
        </div>
        {todaySleep && <div className="text-xs text-blue-400 mt-2">Today: {todaySleep}h logged</div>}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="bg-[#0a0a0a] border border-[#1e3a5f]/60 rounded-lg p-4">
          <div className="text-[10px] text-slate-400 tracking-wider uppercase mb-1">Weekly Average</div>
          <div className={`text-lg font-semibold ${avg < target ? 'text-red-400' : 'text-slate-200'}`}>{avg}h</div>
        </div>
        <div className="bg-[#0a0a0a] border border-[#1e3a5f]/60 rounded-lg p-4">
          <div className="text-[10px] text-slate-400 tracking-wider uppercase mb-1">Target</div>
          <div className="text-lg font-semibold text-slate-200">{target}h</div>
        </div>
      </div>

      <div className="bg-[#0a0a0a] border border-[#1e3a5f]/60 rounded-lg p-5">
        <div className="text-xs text-slate-400 tracking-wider uppercase mb-4">7-Day Trend</div>
        {trend.length === 0 ? (
          <span className="text-xs text-slate-600 italic">No sleep data logged yet</span>
        ) : (
          <div className="flex items-end gap-2 justify-center min-h-[140px]">
            {trend.map(t => {
              const height = Math.min((t.hours / 10) * 100, 100);
              const belowTarget = t.hours < target;
              return (
                <div key={t.date} className="flex flex-col items-center gap-1 flex-1">
                  <div className="w-full max-w-[36px] h-[120px] bg-[#1e3a5f]/30 rounded-t-md relative overflow-hidden">
                    <div
                      className={`absolute bottom-0 w-full rounded-t-md transition-all duration-500 ${
                        belowTarget ? 'bg-red-500/70' : 'bg-blue-500'
                      }`}
                      style={{ height: `${height}%` }}
                    />
                  </div>
                  <span className="text-[10px] text-slate-600">{getDayLabel(t.date)}</span>
                  <span className="text-[11px] font-semibold text-slate-400">{t.hours}h</span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
