import React from 'react';

export default function TabNav({ tabs, active, onSelect }) {
  return (
    <nav className="tab-nav">
      {tabs.map(tab => (
        <button
          key={tab.id}
          className={`tab-btn ${active === tab.id ? 'active' : ''}`}
          onClick={() => onSelect(tab.id)}
        >
          {tab.label}
        </button>
      ))}
    </nav>
  );
}
