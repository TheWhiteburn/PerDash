import React from 'react';
import { LayoutDashboard, Target, ClipboardCheck, ListChecks, Dumbbell, Moon } from 'lucide-react';

const TABS = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'goals', label: 'Goals', icon: Target },
  { id: 'checklist', label: 'Checklist', icon: ClipboardCheck },
  { id: 'todos', label: 'To-Do', icon: ListChecks },
  { id: 'workouts', label: 'Workouts', icon: Dumbbell },
  { id: 'sleep', label: 'Sleep', icon: Moon },
];

export default function SidebarNav({ active, onSelect }) {
  return (
    <nav className="w-14 md:w-44 bg-[#0a0a0a] border-r border-[#1e3a5f] flex flex-col items-center md:items-stretch gap-1 py-3 px-1 md:px-3 shrink-0 h-full overflow-y-auto">
      <div className="hidden md:block text-[10px] text-slate-600 tracking-[0.2em] uppercase px-2 pb-3 pt-1 border-b border-[#1e3a5f]/40 mb-2">
        PerDash
      </div>
      {TABS.map(tab => {
        const Icon = tab.icon;
        const isActive = active === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onSelect(tab.id)}
            className={`flex items-center justify-center md:justify-start gap-3 px-2 md:px-3 py-2.5 rounded-md text-sm transition-all duration-150 ${
              isActive
                ? 'bg-[#1e3a5f]/30 text-blue-400 border border-[#1e3a5f]/60'
                : 'text-slate-500 hover:text-slate-300 hover:bg-[#1e3a5f]/10 border border-transparent'
            }`}
          >
            <Icon size={18} strokeWidth={1.5} />
            <span className="hidden md:inline text-xs tracking-wide">{tab.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
