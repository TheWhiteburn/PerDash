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
    <nav className="w-14 md:w-44 bg-[#0a0a0a] border-r border-white/10 flex flex-col items-center md:items-stretch gap-1.5 py-3 px-1 md:px-3 shrink-0 h-full overflow-y-auto">
      <div className="hidden md:block text-[10px] text-white/60 tracking-[0.2em] uppercase px-2 pb-3 pt-1 border-b border-white/10 mb-2">
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
                ? 'bg-white/10 text-white border border-white/30'
                : 'text-white/65 hover:text-white hover:bg-white/5 border border-transparent'
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
