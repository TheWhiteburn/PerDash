import React from 'react';
import { useData } from '../store';
import { getSleepAverage, getChecklistCompletionRate, getTodaySummary } from '../utils/analysis';

function ladder(v, l = 40, h = 90) {
  if (v < l) return { cls: 'text-red-400', fill: '#f87171', bg: 'bg-red-400' };
  if (v >= h) return { cls: 'text-green-400', fill: '#4ade80', bg: 'bg-green-400' };
  return { cls: 'text-gray-300', fill: '#999', bg: 'bg-gray-400' };
}

function getMonday(d) {
  const date = new Date(d);
  const day = date.getDay();
  date.setDate(date.getDate() - (day === 0 ? 6 : day - 1));
  date.setHours(0, 0, 0, 0);
  return date;
}

function formatKey(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function isToday(d) {
  const t = new Date();
  return d.getFullYear() === t.getFullYear() && d.getMonth() === t.getMonth() && d.getDate() === t.getDate();
}

function isFuture(d) {
  const t = new Date();
  t.setHours(23, 59, 59, 999);
  return d > t;
}

const CARD = 'card-bg border border-white/25 rounded-lg p-4 shadow-card-white hover:-translate-y-1 hover:shadow-[-8px_8px_28px_rgba(255,255,255,0.2)] hover:border-white/50 transition-all duration-300';

function JournalCard() {
  const { data, getTodayKey } = useData();
  const todayKey = getTodayKey();
  const summary = getTodaySummary(data, todayKey);

  const sleepOk = summary.sleep >= data.settings.sleepTarget;
  const checklistPct = summary.checklistTotal > 0 ? Math.round((summary.checklistDone / summary.checklistTotal) * 100) : null;

  let lines = [];
  if (summary.sleep) {
    lines.push(summary.sleep >= data.settings.sleepTarget
      ? `Slept ${summary.sleep}h \u2014 plenty of rest.`
      : `Only ${summary.sleep}h sleep \u2014 rest up tonight.`);
  } else {
    lines.push('No sleep logged yet today.');
  }

  if (summary.workoutsDone > 0) {
    lines.push(`Logged ${summary.workoutsDone} workout${summary.workoutsDone > 1 ? 's' : ''}.`);
  } else {
    lines.push('No workout logged.');
  }

  if (checklistPct !== null) {
    lines.push(`Checklist: ${summary.checklistDone}/${summary.checklistTotal} (${checklistPct}%).`);
  } else {
    lines.push('Checklist not started.');
  }

  if (summary.sleep >= data.settings.sleepTarget && summary.workoutsDone > 0 && checklistPct !== null && checklistPct >= 60) {
    lines.push('Strong day. Stack another like it tomorrow.');
  } else if (summary.sleep >= data.settings.sleepTarget && summary.workoutsDone > 0) {
    lines.push('Good momentum. Finish the checklist.');
  } else if (summary.sleep >= data.settings.sleepTarget) {
    lines.push('Rested and ready. Get to work.');
  } else if (summary.workoutsDone > 0) {
    lines.push('Workout done. Now recover and finish strong.');
  } else {
    lines.push('Plenty of day left. Start now.');
  }

  const color = sleepOk && summary.workoutsDone > 0 && (checklistPct === null || checklistPct >= 50)
    ? 'text-green-400' : !sleepOk && summary.workoutsDone === 0 ? 'text-red-400' : 'text-gray-300';

  return (
    <div className={CARD}>
      <div className="text-xs text-gray-400 tracking-wider uppercase mb-2">Today's Review</div>
      <p className={`text-sm leading-relaxed ${color}`}>{lines.join(' ')}</p>
    </div>
  );
}

function WorkoutCalendar() {
  const { data } = useData();
  const logs = data.workouts.logs;
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startPad = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1;
  const totalDays = lastDay.getDate();
  const rows = [];
  let cells = [];
  for (let p = 0; p < startPad; p++) cells.push(null);
  for (let d = 1; d <= totalDays; d++) {
    cells.push(d);
    if (cells.length === 7) {
      rows.push(cells);
      cells = [];
    }
  }
  if (cells.length > 0) rows.push(cells);
  const dayHeaders = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
  const monthLabel = now.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  return (
    <div className={CARD}>
      <div className="text-[10px] text-gray-400 tracking-wider uppercase mb-2">{monthLabel}</div>
      <div className="grid grid-cols-7 gap-1">
        {dayHeaders.map(d => (
          <div key={d} className="text-[9px] text-gray-600 text-center h-5 flex items-center justify-center">{d}</div>
        ))}
        {rows.flat().map((d, i) => {
          if (d === null) return <div key={`e-${i}`} />;
          const date = new Date(year, month, d);
          const key = formatKey(date);
          const workedOut = logs[key] && logs[key].length > 0;
          const future = isFuture(date);
          let cls = 'bg-gray-800 text-gray-500';
          if (future) cls = 'border border-gray-800 text-gray-700 bg-transparent';
          else if (workedOut) cls = 'bg-green-500/70 text-black';
          else if (isToday(date)) cls = 'bg-red-500/50 text-white';
          else cls = 'bg-red-500/50 text-white';
          return (
            <div
              key={key}
              className={`w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-medium mx-auto transition-all duration-300 ${cls}`}
              title={`${key}${workedOut ? ' — workout logged' : ''}`}
            >
              {d}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function SleepLineChart() {
  const { data } = useData();
  const logs = data.sleep.logs;
  const target = data.settings.sleepTarget;

  const monday = getMonday(new Date());
  const days = [];
  const dayLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const now = new Date();
  now.setHours(23, 59, 59, 999);
  for (let i = 0; i < 7; i++) {
    const d = new Date(monday);
    d.setDate(d.getDate() + i);
    const key = formatKey(d);
    days.push({ key, label: dayLabels[i], hours: logs[key] || 0, date: d, passed: d <= now });
  }

  const hasData = days.some(d => d.passed && d.hours > 0);
  if (!hasData) {
    return (
      <div className={CARD}>
        <div className="text-[10px] text-gray-400 tracking-wider uppercase mb-2">Sleep Trends</div>
        <p className="text-xs text-gray-600 italic">Log sleep data to see trends.</p>
      </div>
    );
  }

  const passedDays = days.filter(d => d.passed);
  const maxH = Math.max(...passedDays.map(d => d.hours), target, 1);
  const w = 220, h = 140, padL = 24, padR = 8, padT = 16, padB = 22;
  const graphW = w - padL - padR;
  const graphH = h - padT - padB;
  const yMax = Math.ceil(maxH) + 1;

  const xScale = (i) => padL + (i / (days.length - 1)) * graphW;
  const yScale = (val) => padT + graphH - ((val - 0) / (yMax - 0)) * graphH;
  const targetY = yScale(target);

  const linePoints = passedDays.map((d, i) => {
    const x = xScale(days.indexOf(d));
    const y = yScale(d.hours);
    return `${x},${y}`;
  });

  return (
    <div className={CARD}>
      <div className="text-[10px] text-gray-400 tracking-wider uppercase mb-2">Sleep Trends</div>
      <svg viewBox={`0 0 ${w} ${h}`} className="w-full max-w-[240px] mx-auto">
        {/* horizontal grid lines */}
        {[...Array(yMax + 1).keys()].filter(v => v % 1 === 0).map(hh => (
          <line key={hh} x1={padL} y1={yScale(hh)} x2={w - padR} y2={yScale(hh)} stroke="#1a1a1a" strokeWidth="1" />
        ))}
        {/* target line */}
        <line x1={padL} y1={targetY} x2={w - padR} y2={targetY} stroke="#555" strokeWidth="1" strokeDasharray="3,3" />
        <text x={w - padR + 2} y={targetY + 3} fill="#555" fontSize="7">{target}h</text>
        {/* y-axis labels */}
        {[...Array(yMax + 1).keys()].filter(v => v % 1 === 0 && v > 0).map(hh => (
          <text key={hh} x={padL - 4} y={yScale(hh) + 3} textAnchor="end" fill="#444" fontSize="7">{hh}</text>
        ))}
        {/* line — only through passed days */}
        {linePoints.length > 1 && (
          <polyline
            points={linePoints.join(' ')}
            fill="none" stroke="#4ade80" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round"
          />
        )}
        {/* dots — only on passed days */}
        {days.map((d, i) => {
          if (!d.passed) return null;
          const x = xScale(i);
          const y = yScale(d.hours);
          return (
            <g key={d.key}>
              <circle cx={x} cy={y} r="3" fill="#4ade80" />
              <text x={x} y={padT + graphH + 14} textAnchor="middle" fill="#666" fontSize="8">{d.label}</text>
              {d.hours > 0 && <text x={x} y={y - 8} textAnchor="middle" fill="#999" fontSize="7">{d.hours}h</text>}
            </g>
          );
        })}
        {/* future day labels — muted */}
        {days.map((d, i) => {
          if (d.passed) return null;
          const x = xScale(i);
          return (
            <text key={d.key} x={x} y={padT + graphH + 14} textAnchor="middle" fill="#333" fontSize="8">{d.label}</text>
          );
        })}
      </svg>
    </div>
  );
}

function GoalProgress() {
  const { data } = useData();
  const levels = [
    { label: '5-Year', goals: data.goals.fiveYear },
    { label: 'Yearly', goals: data.goals.yearly },
    { label: 'Monthly', goals: data.goals.monthly },
  ];

  return (
    <div className={CARD}>
      <div className="text-[10px] text-gray-400 tracking-wider uppercase mb-3">Goal Progress</div>
      <div className="space-y-3">
        {levels.map(level => {
          const avg = level.goals.length > 0
            ? Math.round(level.goals.reduce((s, g) => s + g.progress, 0) / level.goals.length)
            : 0;
          const lc = ladder(avg);
          return (
            <div key={level.label}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] text-gray-400">{level.label}</span>
                <span className={`text-[10px] font-semibold ${lc.cls}`}>{avg}%</span>
              </div>
              {level.goals.map(g => {
                const gc = ladder(g.progress);
                return (
                  <div key={g.id} className="flex items-center gap-2 mb-0.5">
                    <div className="flex-1 h-1 bg-gray-800 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full transition-all duration-500 ${gc.bg}`} style={{ width: `${g.progress}%` }} />
                    </div>
                    <span className="text-[9px] text-gray-600 w-6 text-right">{g.progress}%</span>
                  </div>
                );
              })}
              {level.goals.length === 0 && <span className="text-[9px] text-gray-600 italic">No goals set</span>}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function Overview() {
  const { data } = useData();
  const rate = getChecklistCompletionRate(data);
  const rc = ladder(rate);

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <JournalCard />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <WorkoutCalendar />
        <SleepLineChart />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
        <GoalProgress />
        <div className={`${CARD} flex flex-col items-center justify-center py-6`}>
          <div className="text-[10px] text-gray-400 tracking-wider uppercase mb-1">Checklist Rate</div>
          <div className={`text-3xl font-semibold ${rc.cls}`}>{rate}%</div>
        </div>
      </div>
    </div>
  );
}
