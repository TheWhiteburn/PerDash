import React, { useState, useCallback } from 'react';
import { DataProvider, useData } from './store';
import { downloadBackup, uploadBackup } from './utils/backup';
import TabNav from './components/TabNav';
import Overview from './components/Overview';
import Goals from './components/Goals';
import DailyChecklist from './components/DailyChecklist';
import TodoList from './components/TodoList';
import WorkoutTracker from './components/WorkoutTracker';
import SleepTracker from './components/SleepTracker';
import AIChat from './components/AIChat';

const TABS = [
  { id: 'overview', label: 'Overview' },
  { id: 'goals', label: 'Goals' },
  { id: 'checklist', label: 'Daily Checklist' },
  { id: 'todos', label: 'To-Do' },
  { id: 'workouts', label: 'Workouts' },
  { id: 'sleep', label: 'Sleep' },
];

function Dashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [chatOpen, setChatOpen] = useState(false);
  const [showDataMenu, setShowDataMenu] = useState(false);
  const { exportData, importData } = useData();

  const handleExport = useCallback(() => {
    downloadBackup(exportData());
    setShowDataMenu(false);
  }, [exportData]);

  const handleImport = useCallback(async () => {
    try {
      const newData = await uploadBackup();
      importData(newData);
      setShowDataMenu(false);
      alert('Data imported successfully!');
    } catch (e) {
      alert('Import failed: ' + e);
    }
  }, [importData]);

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-left">
          <h1 className="app-title">⚡ Personal Dashboard</h1>
          <span className="header-date">{new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
        </div>
        <div className="header-right">
          <button className="btn-icon" onClick={() => setChatOpen(true)} title="AI Coach">
            🤖
          </button>
          <div className="data-menu-container">
            <button className="btn-icon" onClick={() => setShowDataMenu(v => !v)} title="Data">
              💾
            </button>
            {showDataMenu && (
              <div className="data-menu">
                <button onClick={handleExport}>📥 Export Backup</button>
                <button onClick={handleImport}>📤 Import Backup</button>
              </div>
            )}
          </div>
        </div>
      </header>

      <TabNav tabs={TABS} active={activeTab} onSelect={setActiveTab} />

      <main className="app-main">
        {activeTab === 'overview' && <Overview />}
        {activeTab === 'goals' && <Goals />}
        {activeTab === 'checklist' && <DailyChecklist />}
        {activeTab === 'todos' && <TodoList />}
        {activeTab === 'workouts' && <WorkoutTracker />}
        {activeTab === 'sleep' && <SleepTracker />}
      </main>

      {chatOpen && <AIChat onClose={() => setChatOpen(false)} />}
    </div>
  );
}

export default function App() {
  return (
    <DataProvider>
      <Dashboard />
    </DataProvider>
  );
}
