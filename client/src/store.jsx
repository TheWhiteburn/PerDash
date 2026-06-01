import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'personal-dashboard-data';

function getDefaultData() {
  return {
    goals: {
      fiveYear: [
        { id: 'fy1', text: 'Career: Business running with regular income', progress: 15 },
        { id: 'fy2', text: 'Fitness: Marathon yearly + 8K peak + leanest physique', progress: 10 },
        { id: 'fy3', text: 'Finance: ₹2L+/month income', progress: 5 },
        { id: 'fy4', text: 'Skills: Mountaineer, Paragliding, Rafting, Scuba certified', progress: 20 },
      ],
      yearly: [
        { id: 'y1', year: 2026, text: 'Land stable job via MBA', progress: 10, parentId: 'fy3' },
        { id: 'y2', year: 2026, text: 'Rethink The Nativs business model', progress: 5, parentId: 'fy1' },
        { id: 'y3', year: 2026, text: 'Complete first marathon', progress: 0, parentId: 'fy2' },
        { id: 'y4', year: 2026, text: 'AMC (Advanced Mountaineering Course)', progress: 0, parentId: 'fy4' },
      ],
      monthly: [
        { id: 'm1', month: 'June', year: 2026, text: 'Build base fitness — run 3x/week', progress: 0, parentId: 'y3' },
        { id: 'm2', month: 'June', year: 2026, text: 'Research AMC course dates & registration', progress: 0, parentId: 'y4' },
        { id: 'm3', month: 'June', year: 2026, text: 'Polish resume & start job applications', progress: 0, parentId: 'y1' },
      ],
    },
    dailyChecklist: {
      presets: [
        { id: 'pc1', text: 'Sleep minimum 6 hours', active: true },
        { id: 'pc2', text: 'Eat healthy — no junk', active: true },
        { id: 'pc3', text: 'Workout / run', active: true },
        { id: 'pc4', text: 'MBA study 1 hour', active: true },
      ],
      logs: {},
    },
    todos: [
      { id: 't1', text: 'Advanced Mountaineering Course (AMC)', progress: 0, notes: '', createdAt: new Date().toISOString() },
      { id: 't2', text: 'Search & Rescue course', progress: 0, notes: '', createdAt: new Date().toISOString() },
      { id: 't3', text: 'Scuba certification', progress: 0, notes: '', createdAt: new Date().toISOString() },
      { id: 't4', text: 'Paragliding certification', progress: 0, notes: '', createdAt: new Date().toISOString() },
    ],
    workouts: {
      logs: {},
      challenges: [
        {
          id: 'ch1', name: 'Unlock Muscle Up', active: true,
          steps: [
            { id: 'ch1s1', text: '3x8 Pull-ups', done: false },
            { id: 'ch1s2', text: '3x5 Chest-to-bar Pull-ups', done: false },
            { id: 'ch1s3', text: 'Negative Muscle-ups 3x3', done: false },
            { id: 'ch1s4', text: 'Banded Muscle-up 3x1', done: false },
            { id: 'ch1s5', text: 'Full Muscle-up — UNLOCKED', done: false },
          ],
        },
        {
          id: 'ch2', name: '10k Under 5:30/km', active: true,
          steps: [
            { id: 'ch2s1', text: 'Run 5km at 6:00/km pace', done: false },
            { id: 'ch2s2', text: 'Run 8km at 5:45/km pace', done: false },
            { id: 'ch2s3', text: 'Run 10km at 5:30/km pace', done: false },
            { id: 'ch2s4', text: 'Run 10km under 5:30/km — UNLOCKED', done: false },
          ],
        },
      ],
    },
    sleep: {
      logs: {},
    },
    settings: {
      sleepTarget: 6,
      installDate: new Date().toISOString(),
    },
  };
}

function loadData() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      const defaults = getDefaultData();
      return { ...defaults, ...parsed, goals: { ...defaults.goals, ...parsed.goals } };
    }
  } catch (e) {
    console.error('Failed to load data:', e);
  }
  return getDefaultData();
}

function saveData(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.error('Failed to save data:', e);
  }
}

const DataContext = createContext(null);

export function DataProvider({ children }) {
  const [data, setData] = useState(loadData);

  useEffect(() => {
    saveData(data);
  }, [data]);

  const updateData = useCallback((updater) => {
    setData(prev => {
      const next = typeof updater === 'function' ? updater(prev) : { ...prev, ...updater };
      saveData(next);
      return next;
    });
  }, []);

  const getTodayKey = useCallback(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }, []);

  const getTodayChecklist = useCallback(() => {
    const todayKey = getTodayKey();
    const log = data.dailyChecklist.logs[todayKey];
    if (log) return log;
    const items = data.dailyChecklist.presets.filter(p => p.active).map(p => ({
      id: p.id,
      text: p.text,
      done: false,
    }));
    return items;
  }, [data.dailyChecklist, getTodayKey]);

  const setTodayChecklist = useCallback((items) => {
    const todayKey = getTodayKey();
    updateData(prev => ({
      ...prev,
      dailyChecklist: {
        ...prev.dailyChecklist,
        logs: {
          ...prev.dailyChecklist.logs,
          [todayKey]: items,
        },
      },
    }));
  }, [getTodayKey, updateData]);

  const getTodayWorkout = useCallback(() => {
    const todayKey = getTodayKey();
    return data.workouts.logs[todayKey] || [];
  }, [data.workouts.logs, getTodayKey]);

  const logWorkout = useCallback((entry) => {
    const todayKey = getTodayKey();
    updateData(prev => {
      const today = prev.workouts.logs[todayKey] || [];
      return {
        ...prev,
        workouts: {
          ...prev.workouts,
          logs: {
            ...prev.workouts.logs,
            [todayKey]: [...today, { id: Date.now().toString(), ...entry }],
          },
        },
      };
    });
  }, [getTodayKey, updateData]);

  const logSleep = useCallback((hours) => {
    const todayKey = getTodayKey();
    updateData(prev => ({
      ...prev,
      sleep: {
        ...prev.sleep,
        logs: {
          ...prev.sleep.logs,
          [todayKey]: hours,
        },
      },
    }));
  }, [getTodayKey, updateData]);

  const exportData = useCallback(() => {
    return data;
  }, [data]);

  const importData = useCallback((newData) => {
    setData(newData);
  }, []);

  const value = {
    data,
    updateData,
    getTodayChecklist,
    setTodayChecklist,
    getTodayWorkout,
    logWorkout,
    logSleep,
    exportData,
    importData,
    getTodayKey,
  };

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error('useData must be used within DataProvider');
  return ctx;
}
