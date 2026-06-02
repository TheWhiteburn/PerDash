import React from 'react';
import { useData } from '../store';
import { getOverallProgress, getWeeklyWorkoutStreak, getSleepAverage, getChecklistCompletionRate } from '../utils/analysis';

function ladder(v, l=40, h=90) {
  if (v < l) return { cls: 'text-red-400', fill: '#f87171', bg: 'bg-red-400' };
  if (v >= h) return { cls: 'text-green-400', fill: '#4ade80', bg: 'bg-green-400' };
  return { cls: 'text-gray-300', fill: '#999', bg: 'bg-gray-400' };
}

export default function Overview() {
  const { data } = useData();
  const overall = getOverallProgress(data);
  const workoutDays = getWeeklyWorkoutStreak(data);
  const sleepAvg = getSleepAverage(data);
  const checklistRate = getChecklistCompletionRate(data);
  const ringCircumference = 2 * Math.PI * 54;
  const ringColor = ladder(overall);

  const metrics = [
    { label: 'Overall Progress', value: `${overall}%`, raw: overall },
    { label: 'Workout Days', value: `${workoutDays}/7`, raw: workoutDays, low: 3, high: 6 },
    { label: 'Avg Sleep', value: `${sleepAvg}h`, raw: sleepAvg, low: data.settings.sleepTarget * 0.7, high: data.settings.sleepTarget },
    { label: 'Checklist Rate', value: `${checklistRate}%`, raw: checklistRate },
  ];

  const topGoal = data.goals.monthly[0] || data.goals.yearly[0] || data.goals.fiveYear[0];
  const goalProgress = topGoal?.progress || 0;
  const goalColor = ladder(goalProgress);

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      <div className="flex items-center gap-5 card-bg border border-white/25 rounded-lg p-5 shadow-card-white hover:-translate-y-1 hover:shadow-[-8px_8px_28px_rgba(255,255,255,0.2)] hover:border-white/50 transition-all duration-300">
        <svg viewBox="0 0 120 120" className="w-28 h-28 shrink-0">
          <circle cx="60" cy="60" r="54" fill="none" stroke="#333" strokeWidth="8" />
          <circle
            cx="60" cy="60" r="54" fill="none" stroke={ringColor.fill} strokeWidth="8"
            strokeLinecap="round" strokeDasharray={ringCircumference}
            strokeDashoffset={ringCircumference - (ringCircumference * overall) / 100}
            transform="rotate(-90 60 60)"
            className="transition-all duration-700 ease-out pulse-ring"
          />
          <text x="60" y="60" textAnchor="middle" dominantBaseline="central" fill={ringColor.fill} fontSize="28" fontFamily="inherit" fontWeight="700">
            {overall}%
          </text>
        </svg>
        <div>
          <div className="text-xs text-gray-400 tracking-wider uppercase mb-1">Overall Progress</div>
          {overall < 10 && <p className="text-gray-400 text-sm mt-1">Just started. Every day counts. Lock in.</p>}
          {overall >= 10 && overall < 30 && <p className="text-gray-400 text-sm mt-1">Building momentum. Stay consistent.</p>}
          {overall >= 30 && overall < 60 && <p className="text-gray-400 text-sm mt-1">Solid progress. Keep pushing.</p>}
          {overall >= 60 && <p className="text-gray-400 text-sm mt-1">Beast mode. Don't stop now.</p>}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {metrics.map(m => {
          const mc = ladder(m.raw, m.low ?? 40, m.high ?? 90);
          return (
            <div key={m.label} className="card-bg border border-white/25 rounded-lg p-4 shadow-card-white hover:-translate-y-1 hover:shadow-[-8px_8px_28px_rgba(255,255,255,0.2)] hover:border-white/50 transition-all duration-300">
              <div className="text-[10px] text-gray-400 tracking-wider uppercase mb-2">{m.label}</div>
              <div className={`text-lg font-semibold ${mc.cls}`}>{m.value}</div>
            </div>
          );
        })}
      </div>

      <div className="card-bg border border-white/25 rounded-lg p-5 shadow-card-white hover:-translate-y-1 hover:shadow-[-8px_8px_28px_rgba(255,255,255,0.2)] hover:border-white/50 transition-all duration-300">
        <div className="text-xs text-gray-400 tracking-wider uppercase mb-3">Current Focus</div>
        <p className="text-sm font-medium text-gray-200 mb-3">{topGoal?.text || 'No goals set'}</p>
        <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
          <div className={`h-full rounded-full transition-all duration-500 ${goalColor.bg}`} style={{ width: `${goalProgress}%` }} />
        </div>
        <div className={`text-[11px] mt-2 ${goalColor.cls}`}>{goalProgress}% complete</div>
      </div>

      {data.workouts.challenges.filter(c => c.active).length > 0 && (
        <div>
          <div className="text-xs text-gray-400 tracking-wider uppercase mb-3">Active Challenges</div>
          <div className="space-y-3">
            {data.workouts.challenges.filter(c => c.active).map(c => {
              const done = c.steps.filter(s => s.done).length;
              const total = c.steps.length;
              const pct = total > 0 ? Math.round((done / total) * 100) : 0;
              const cc = ladder(pct);
              return (
                <div key={c.id} className="flex items-center justify-between card-bg border border-white/25 rounded-lg p-4 shadow-card-white hover:-translate-y-1 hover:shadow-[-8px_8px_28px_rgba(255,255,255,0.2)] hover:border-white/50 transition-all duration-300">
                  <span className="text-sm text-gray-200">{c.name}</span>
                  <span className={`text-xs ${cc.cls}`}>{done}/{total} steps</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
