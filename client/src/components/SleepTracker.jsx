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
    <div className="tab-content">
      <h2>Sleep Tracker</h2>
      <p className="section-subtitle">Target: {data.settings.sleepTarget}h minimum</p>

      <div className="sleep-input-card">
        <h3>Log Tonight's Sleep</h3>
        <div className="add-row">
          <input
            type="number" step="0.5" min="0" max="24"
            placeholder="Hours slept..." value={inputHours}
            onChange={(e) => setInputHours(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleLog()}
            className="input-text"
          />
          <button className="btn-primary" onClick={handleLog}>Log</button>
        </div>
        {todaySleep && <span className="today-sleep">Today: {todaySleep}h logged</span>}
      </div>

      <div className="sleep-stats">
        <div className="stat-card">
          <span className="stat-label">Weekly Average</span>
          <span className="stat-value" style={{ color: avg >= 6 ? '#4ade80' : '#f87171' }}>{avg}h</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Target</span>
          <span className="stat-value">{data.settings.sleepTarget}h</span>
        </div>
      </div>

      <div className="trend-chart">
        <h3>7-Day Trend</h3>
        <div className="bar-chart">
          {trend.length === 0 && <span className="empty-hint">No sleep data logged yet</span>}
          {trend.map(t => {
            const height = Math.min((t.hours / 10) * 100, 100);
            return (
              <div key={t.date} className="bar-column">
                <div className="bar-wrapper">
                  <div
                    className="bar-fill"
                    style={{ height: `${height}%` }}
                    data-below={t.hours < 6 ? 'true' : 'false'}
                  />
                </div>
                <span className="bar-label">{getDayLabel(t.date)}</span>
                <span className="bar-value">{t.hours}h</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
