import React, { useState } from 'react';
import { useData } from '../store';
import { getWeeklyWorkoutStreak } from '../utils/analysis';

export default function WorkoutTracker() {
  const { data, logWorkout, getTodayWorkout, updateData } = useData();
  const [logText, setLogText] = useState('');
  const todayWorkout = getTodayWorkout();
  const streak = getWeeklyWorkoutStreak(data);

  const handleLog = () => {
    if (!logText.trim()) return;
    logWorkout({ text: logText.trim() });
    setLogText('');
  };

  const toggleChallengeStep = (challengeId, stepId) => {
    updateData(prev => ({
      ...prev,
      workouts: {
        ...prev.workouts,
        challenges: prev.workouts.challenges.map(c =>
          c.id === challengeId ? {
            ...c,
            steps: c.steps.map(s =>
              s.id === stepId ? { ...s, done: !s.done } : s
            ),
          } : c
        ),
      },
    }));
  };

  const addChallenge = (name) => {
    if (!name.trim()) return;
    updateData(prev => ({
      ...prev,
      workouts: {
        ...prev.workouts,
        challenges: [...prev.workouts.challenges, {
          id: `ch-${Date.now()}`,
          name: name.trim(),
          active: true,
          steps: [{ id: `ch-${Date.now()}-s1`, text: 'Define training plan', done: false }],
        }],
      },
    }));
  };

  const addChallengeStep = (challengeId, text) => {
    if (!text.trim()) return;
    updateData(prev => ({
      ...prev,
      workouts: {
        ...prev.workouts,
        challenges: prev.workouts.challenges.map(c =>
          c.id === challengeId ? {
            ...c,
            steps: [...c.steps, { id: `${c.id}-s${Date.now()}`, text: text.trim(), done: false }],
          } : c
        ),
      },
    }));
  };

  const [newChallenge, setNewChallenge] = useState('');
  const [newStepText, setNewStepText] = useState({});

  return (
    <div className="tab-content">
      <h2>Workout Tracker</h2>

      <div className="streak-banner">
        <span className="streak-label">This Week</span>
        <span className="streak-value">{streak}/7 days</span>
        <div className="streak-bar">
          {[0,1,2,3,4,5,6].map(i => (
            <div key={i} className={`streak-dot ${i < streak ? 'filled' : ''}`} />
          ))}
        </div>
        {streak === 0 && <p className="coach-msg">Not a single workout this week. Start today.</p>}
        {streak === 7 && <p className="coach-msg">Perfect week. This is the standard.</p>}
      </div>

      <div className="workout-log-section">
        <h3>Today's Log</h3>
        <div className="add-row">
          <input
            type="text" placeholder="e.g., Ran 5km, 30min" value={logText}
            onChange={(e) => setLogText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleLog()}
            className="input-text"
          />
          <button className="btn-primary" onClick={handleLog}>Log</button>
        </div>
        <div className="log-entries">
          {todayWorkout.map(entry => (
            <div key={entry.id} className="log-entry">{entry.text}</div>
          ))}
          {todayWorkout.length === 0 && <span className="empty-hint">Nothing logged yet today</span>}
        </div>
      </div>

      <div className="challenges-section">
        <h3>Active Challenges</h3>
        {data.workouts.challenges.filter(c => c.active).map(c => {
          const doneSteps = c.steps.filter(s => s.done).length;
          const progress = c.steps.length > 0 ? Math.round((doneSteps / c.steps.length) * 100) : 0;
          return (
            <div key={c.id} className="challenge-card">
              <div className="challenge-header">
                <span className="challenge-name">{c.name}</span>
                <span className="challenge-percent">{doneSteps}/{c.steps.length}</span>
              </div>
              <div className="progress-bar-container">
                <div className="progress-bar-fill" style={{ width: `${progress}%` }} />
              </div>
              <div className="challenge-steps">
                {c.steps.map((s, idx) => (
                  <label key={s.id} className={`step-item ${s.done ? 'done' : ''}`}>
                    <input
                      type="checkbox" checked={s.done}
                      onChange={() => toggleChallengeStep(c.id, s.id)}
                      className="checkbox"
                    />
                    <span>Step {idx + 1}: {s.text}</span>
                  </label>
                ))}
                <div className="add-step-row">
                  <input
                    type="text" placeholder="Add step..."
                    value={newStepText[c.id] || ''}
                    onChange={(e) => setNewStepText(p => ({ ...p, [c.id]: e.target.value }))}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        addChallengeStep(c.id, newStepText[c.id] || '');
                        setNewStepText(p => ({ ...p, [c.id]: '' }));
                      }
                    }}
                    className="input-text small"
                  />
                </div>
              </div>
            </div>
          );
        })}
        {data.workouts.challenges.filter(c => c.active).length === 0 && (
          <div className="empty-hint">No active challenges. Add one below.</div>
        )}

        <div className="add-challenge-row">
          <input
            type="text" placeholder="New challenge (e.g., Muscle Up, 10k under 5:30)"
            value={newChallenge}
            onChange={(e) => setNewChallenge(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') { addChallenge(newChallenge); setNewChallenge(''); } }}
            className="input-text"
          />
          <button className="btn-primary" onClick={() => { addChallenge(newChallenge); setNewChallenge(''); }}>Add</button>
        </div>
      </div>
    </div>
  );
}
