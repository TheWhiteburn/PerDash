import React, { useState, useCallback } from 'react';
import { DataProvider, useData } from './store';
import { downloadBackup, uploadBackup } from './utils/backup';
import SidebarNav from './components/SidebarNav';
import Overview from './components/Overview';
import Goals from './components/Goals';
import DailyChecklist from './components/DailyChecklist';
import TodoList from './components/TodoList';
import WorkoutTracker from './components/WorkoutTracker';
import SleepTracker from './components/SleepTracker';
import AIChat from './components/AIChat';
import BackgroundScene from './components/BackgroundScene';

function Dashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [chatOpen, setChatOpen] = useState(false);
  const { exportData, importData } = useData();

  const handleExport = useCallback(() => {
    downloadBackup(exportData());
  }, [exportData]);

  const handleImport = useCallback(async () => {
    try {
      const newData = await uploadBackup();
      importData(newData);
    } catch (e) {
      alert('Import failed: ' + e);
    }
  }, [importData]);

  return (
    <div className="flex h-screen bg-black text-slate-200 overflow-hidden relative">
      <BackgroundScene />
      <SidebarNav active={activeTab} onSelect={setActiveTab} />
      <div className="flex-1 flex flex-col min-w-0 relative z-10">
        <header className="flex items-center justify-between px-6 py-3 border-b border-white/10 shrink-0 bg-black/80 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <span className="text-slate-200 text-lg">◉</span>
            <h1 className="text-sm font-medium tracking-wide text-white">
              Avijeet's PerDash
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setChatOpen(true)}
              className="group relative overflow-hidden px-3 py-1.5 text-xs bg-white text-gray-900 rounded-md hover:bg-gray-100 hover:-translate-y-0.5 transition-all duration-200 tracking-wide"
            >
              <span className="relative">
                <span className="relative z-10">Coach</span>
                <span className="absolute inset-0 bg-black/8 rounded-sm scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left pointer-events-none" />
              </span>
            </button>
            <button
              onClick={handleExport}
              className="group relative overflow-hidden px-3 py-1.5 text-xs leading-none bg-white text-gray-900 rounded-md hover:bg-gray-100 hover:-translate-y-0.5 transition-all duration-200"
              title="Export backup"
            >
              <span className="relative">
                <span className="relative z-10">↓ Export</span>
                <span className="absolute inset-0 bg-black/8 rounded-sm scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left pointer-events-none" />
              </span>
            </button>
            <button
              onClick={handleImport}
              className="group relative overflow-hidden px-3 py-1.5 text-xs leading-none bg-white text-gray-900 rounded-md hover:bg-gray-100 hover:-translate-y-0.5 transition-all duration-200"
              title="Import backup"
            >
              <span className="relative">
                <span className="relative z-10">↑ Import</span>
                <span className="absolute inset-0 bg-black/8 rounded-sm scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left pointer-events-none" />
              </span>
            </button>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-6 relative">
          <div key={activeTab} className="fade-in">
            {activeTab === 'overview' && <Overview />}
            {activeTab === 'goals' && <Goals />}
            {activeTab === 'checklist' && <DailyChecklist />}
            {activeTab === 'todos' && <TodoList />}
            {activeTab === 'workouts' && <WorkoutTracker />}
            {activeTab === 'sleep' && <SleepTracker />}
          </div>
        </main>
      </div>
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
