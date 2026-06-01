import React, { useState } from 'react';
import { useData } from '../store';

export default function TodoList() {
  const { data, updateData } = useData();
  const [newText, setNewText] = useState('');
  const [expanded, setExpanded] = useState(null);

  const todos = data.todos;

  const addTodo = () => {
    if (!newText.trim()) return;
    updateData(prev => ({
      ...prev,
      todos: [...prev.todos, { id: `t-${Date.now()}`, text: newText.trim(), progress: 0, notes: '', createdAt: new Date().toISOString() }],
    }));
    setNewText('');
  };

  const deleteTodo = (id) => {
    updateData(prev => ({
      ...prev,
      todos: prev.todos.filter(t => t.id !== id),
    }));
  };

  const updateTodo = (id, changes) => {
    updateData(prev => ({
      ...prev,
      todos: prev.todos.map(t => t.id === id ? { ...t, ...changes } : t),
    }));
  };

  const sorted = [...todos].sort((a, b) => b.progress - a.progress);

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      <p className="text-xs text-slate-500">Long-term milestones. Stays until checked off.</p>

      <div className="flex gap-2">
        <input
          type="text" placeholder="Add a milestone..." value={newText}
          onChange={(e) => setNewText(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && addTodo()}
          className="flex-1 bg-black border border-[#1e3a5f]/40 rounded-md px-3 py-2 text-sm text-slate-200 placeholder-slate-600 outline-none focus:border-blue-900/60 transition-colors"
        />
        <button onClick={addTodo} className="px-3 py-2 text-xs bg-blue-900/30 border border-blue-900/60 text-blue-400 rounded-md hover:bg-blue-900/50 transition-all duration-150">
          + Add
        </button>
      </div>

      <div className="space-y-2">
        {sorted.map(todo => {
          const isComplete = todo.progress >= 100;
          return (
            <div
              key={todo.id}
              className={`bg-[#0a0a0a] border rounded-lg overflow-hidden transition-all duration-150 ${
                isComplete ? 'border-green-900/40 opacity-60' : 'border-[#1e3a5f]/60 hover:border-slate-600'
              }`}
            >
              <div
                className="px-4 py-3 cursor-pointer"
                onClick={() => setExpanded(expanded === todo.id ? null : todo.id)}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-sm ${isComplete ? 'line-through text-slate-600' : 'text-slate-200'}`}>
                    {todo.text}
                  </span>
                  <span className="text-xs text-slate-500 ml-3">{todo.progress}%</span>
                </div>
                <div className="flex items-center gap-3">
                  <input
                    type="range" min="0" max="100" value={todo.progress}
                    onChange={(e) => updateTodo(todo.id, { progress: Number(e.target.value) })}
                    onClick={(e) => e.stopPropagation()}
                    className="flex-1 h-1.5 bg-[#1e3a5f]/40 rounded-full appearance-none cursor-pointer
                      [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3.5 [&::-webkit-slider-thumb]:h-3.5
                      [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-blue-500
                      [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-[#0a0a0a]
                      [&::-moz-range-thumb]:w-3.5 [&::-moz-range-thumb]:h-3.5 [&::-moz-range-thumb]:rounded-full
                      [&::-moz-range-thumb]:bg-blue-500 [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-[#0a0a0a]"
                  />
                  <button
                    className="text-xs text-slate-600 hover:text-red-400 transition-colors shrink-0"
                    onClick={(e) => { e.stopPropagation(); deleteTodo(todo.id); }}
                  >
                    ✕
                  </button>
                </div>
              </div>
              {expanded === todo.id && (
                <div className="px-4 pb-3 border-t border-[#1e3a5f]/30 pt-3">
                  <textarea
                    placeholder="Notes, deadlines, links..."
                    value={todo.notes || ''}
                    onChange={(e) => updateTodo(todo.id, { notes: e.target.value })}
                    className="w-full bg-black border border-[#1e3a5f]/40 rounded-md px-3 py-2 text-sm text-slate-200 placeholder-slate-600 outline-none focus:border-blue-900/60 transition-colors resize-vertical min-h-[60px]"
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
