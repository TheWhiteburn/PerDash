import React from 'react';
import { useData } from '../store';
import { getOverallProgress, getWeeklyWorkoutStreak, getSleepAverage, getChecklistCompletionRate } from '../utils/analysis';

export default function Overview() {
  const { data } = useData();
  const overall = getOverallProgress(data);
  const workoutDays = getWeeklyWorkoutStreak(data);
  const sleepAvg = getSleepAverage(data);
  const checklistRate = getChecklistCompletionRate(data);
  const ringCircumference = 2 * Math.PI * 54;

  const metrics = [
    { label: 'Overall Progress', value: `${overall}%`, urgent: overall < 10 },
    { label: 'Workout Days', value: `${workoutDays}/7`, urgent: workoutDays < 3 },
    { label: 'Avg Sleep', value: `${sleepAvg}h`, urgent: sleepAvg < 6 },
    { label: 'Checklist Rate', value: `${checklistRate}%`, urgent: checklistRate < 40 },
  ];

  const topGoal = data.goals.monthly[0] || data.goals.yearly[0] || data.goals.fiveYear[0];

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      <div className="flex items-center gap-5 bg-[#0a0a0a] border border-[#1e3a5f]/60 rounded-lg p-5">
        <svg viewBox="0 0 120 120" className="w-28 h-28 shrink-0">
          <circle cx="60" cy="60" r="54" fill="none" stroke="#1e3a5f" strokeWidth="8" />
          <circle
            cx="60" cy="60" r="54" fill="none" stroke={overall < 10 ? '#ef4444' : '#3b82f6'} strokeWidth="8"
            strokeLinecap="round" strokeDasharray={ringCircumference}
            strokeDashoffset={ringCircumference - (ringCircumference * overall) / 100}
            transform="rotate(-90 60 60)"
            className="transition-all duration-700 ease-out"
          />
          <text x="60" y="60" textAnchor="middle" dominantBaseline="central" fill="#e5e7eb" fontSize="28" fontFamily="inherit" fontWeight="700">
            {overall}%
          </text>
        </svg>
        <div>
          <div className="text-xs text-slate-400 tracking-wider uppercase mb-1">Overall Progress</div>
          {overall < 10 && <p className="text-blue-400 text-sm mt-1">Just started. Every day counts. Lock in.</p>}
          {overall >= 10 && overall < 30 && <p className="text-blue-400 text-sm mt-1">Building momentum. Stay consistent.</p>}
          {overall >= 30 && overall < 60 && <p className="text-blue-400 text-sm mt-1">Solid progress. Keep pushing.</p>}
          {overall >= 60 && <p className="text-blue-400 text-sm mt-1">Beast mode. Don't stop now.</p>}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {metrics.map(m => (
          <div
            key={m.label}
            className={`bg-[#0a0a0a] border rounded-lg p-4 ${
              m.urgent ? 'border-red-900/50' : 'border-[#1e3a5f]/60'
            }`}
          >
            <div className="text-[10px] text-slate-400 tracking-wider uppercase mb-2">{m.label}</div>
            <div className={`text-lg font-semibold ${m.urgent ? 'text-red-400' : 'text-slate-200'}`}>
              {m.value}
            </div>
          </div>
        ))}
      </div>

      <div className="bg-[#0a0a0a] border border-[#1e3a5f]/60 rounded-lg p-5">
        <div className="text-xs text-slate-400 tracking-wider uppercase mb-3">Current Focus</div>
        <p className="text-sm font-medium text-slate-200 mb-3">{topGoal?.text || 'No goals set'}</p>
        <div className="h-2 bg-[#1e3a5f]/40 rounded-full overflow-hidden">
          <div className="h-full bg-blue-500 rounded-full transition-all duration-500" style={{ width: `${topGoal?.progress || 0}%` }} />
        </div>
        <div className="text-[11px] text-slate-400 mt-2">{topGoal?.progress || 0}% complete</div>
      </div>

      {data.workouts.challenges.filter(c => c.active).length > 0 && (
        <div>
          <div className="text-xs text-slate-400 tracking-wider uppercase mb-3">Active Challenges</div>
          <div className="space-y-2">
            {data.workouts.challenges.filter(c => c.active).map(c => {
              const done = c.steps.filter(s => s.done).length;
              const total = c.steps.length;
              return (
                <div key={c.id} className="flex items-center justify-between bg-[#0a0a0a] border border-[#1e3a5f]/40 rounded-lg p-4">
                  <span className="text-sm text-slate-300">{c.name}</span>
                  <span className="text-xs text-slate-500">{done}/{total} steps</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
