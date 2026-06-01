import React from 'react';
import { useData } from '../store';
import { getOverallProgress, getWeeklyWorkoutStreak, getSleepAverage, getChecklistCompletionRate } from '../utils/analysis';

export default function Overview() {
  const { data } = useData();
  const overall = getOverallProgress(data);
  const workoutDays = getWeeklyWorkoutStreak(data);
  const sleepAvg = getSleepAverage(data);
  const checklistRate = getChecklistCompletionRate(data);

  const metrics = [
    { label: 'Overall Progress', value: `${overall}%`, color: overall > 50 ? '#4ade80' : overall > 25 ? '#fbbf24' : '#f87171' },
    { label: 'Workout Days (Week)', value: `${workoutDays}/7`, color: workoutDays >= 5 ? '#4ade80' : workoutDays >= 3 ? '#fbbf24' : '#f87171' },
    { label: 'Avg Sleep (Week)', value: `${sleepAvg}h`, color: sleepAvg >= 6 ? '#4ade80' : '#f87171' },
    { label: 'Checklist Rate (Week)', value: `${checklistRate}%`, color: checklistRate > 70 ? '#4ade80' : checklistRate > 40 ? '#fbbf24' : '#f87171' },
  ];

  const topGoal = data.goals.monthly[0] || data.goals.yearly[0] || data.goals.fiveYear[0];

  return (
    <div className="tab-content">
      <h2>Overview</h2>

      <div className="overall-progress-card">
        <div className="overall-ring">
          <svg viewBox="0 0 120 120" className="progress-ring">
            <circle cx="60" cy="60" r="54" fill="none" stroke="#1e293b" strokeWidth="10" />
            <circle
              cx="60" cy="60" r="54" fill="none" stroke="#4ade80" strokeWidth="10"
              strokeLinecap="round" strokeDasharray="339.292"
              strokeDashoffset={339.292 - (339.292 * overall) / 100}
              transform="rotate(-90 60 60)"
              className="progress-ring-fill"
            />
            <text x="60" y="60" textAnchor="middle" dominantBaseline="central" className="ring-text">
              {overall}%
            </text>
          </svg>
        </div>
        <div className="overall-status">
          <h3>Overall Progress</h3>
          {overall < 10 && <p className="coach-msg">Just started. Every day counts. Lock in.</p>}
          {overall >= 10 && overall < 30 && <p className="coach-msg">Building momentum. Stay consistent.</p>}
          {overall >= 30 && overall < 60 && <p className="coach-msg">Solid progress. Keep pushing.</p>}
          {overall >= 60 && <p className="coach-msg">Beast mode. Don't stop now.</p>}
        </div>
      </div>

      <div className="metrics-grid">
        {metrics.map(m => (
          <div key={m.label} className="metric-card" style={{ borderLeftColor: m.color }}>
            <span className="metric-label">{m.label}</span>
            <span className="metric-value" style={{ color: m.color }}>{m.value}</span>
          </div>
        ))}
      </div>

      <div className="focus-card">
        <h3>🎯 Current Focus</h3>
        <p className="focus-text">{topGoal?.text || 'No goals set'}</p>
        <div className="progress-bar-container">
          <div className="progress-bar-fill" style={{ width: `${topGoal?.progress || 0}%` }} />
        </div>
        <span className="progress-label">{topGoal?.progress || 0}% complete</span>
      </div>

      <div className="overview-challenges">
        <h3>Active Challenges</h3>
        {data.workouts.challenges.filter(c => c.active).map(c => {
          const done = c.steps.filter(s => s.done).length;
          const total = c.steps.length;
          return (
            <div key={c.id} className="challenge-mini">
              <span>{c.name}</span>
              <span className="challenge-progress">{done}/{total} steps</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
