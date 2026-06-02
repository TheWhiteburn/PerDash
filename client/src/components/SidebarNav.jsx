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

export default function SidebarNav({ active, onSelect, mobileOpen, onMobileClose }) {
  const renderItems = (showLabels) => TABS.map(tab => {
    const Icon = tab.icon;
    const isActive = active === tab.id;
    return (
      <button
        key={tab.id}
        onClick={() => onSelect(tab.id)}
        className={`flex items-center gap-3 px-2 md:px-3 py-2.5 rounded-md text-sm transition-all duration-300 hover:-translate-y-1 ${
          isActive
            ? 'bg-white/10 text-white border border-white/30'
            : 'text-white/65 hover:bg-white hover:text-gray-900 border border-transparent'
        }`}
      >
        <Icon size={18} strokeWidth={1.5} />
        {showLabels && <span className="text-xs tracking-wide">{tab.label}</span>}
      </button>
    );
  });

  return (
    <>
      {/* Desktop sidebar */}
      <nav className="hidden md:flex w-44 bg-[#0a0a0a] border-r border-white/10 flex-col items-stretch gap-1.5 py-3 px-3 shrink-0 h-full overflow-y-auto">
        <div className="text-[10px] text-white/60 tracking-[0.2em] uppercase px-2 pb-3 pt-1 border-b border-white/10 mb-2">
          PerDash
        </div>
        {renderItems(true)}
      </nav>

      {/* Mobile drawer overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={onMobileClose} />
          <nav className="relative w-56 bg-[#0a0a0a] h-full border-r border-white/10 flex flex-col gap-1.5 py-3 px-3 overflow-y-auto animate-[slideInLeft_0.25s_ease]">
            <div className="text-[10px] text-white/60 tracking-[0.2em] uppercase px-2 pb-3 pt-1 border-b border-white/10 mb-2">
              PerDash
            </div>
            {renderItems(true)}
          </nav>
        </div>
      )}
    </>
  );
}
