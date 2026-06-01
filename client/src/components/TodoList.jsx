import React, { useState } from 'react';
import { useData } from '../store';

function ladder(v, l=40, h=90) {
  if (v < l) return { cls: 'text-red-400' };
  if (v >= h) return { cls: 'text-green-400' };
  return { cls: 'text-gray-300' };
}

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
      <p className="text-xs text-gray-400">Long-term milestones. Stays until checked off.</p>

      <div className="flex gap-2">
        <input
          type="text" placeholder="Add a milestone..." value={newText}
          onChange={(e) => setNewText(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && addTodo()}
          className="flex-1 bg-black border border-white/15 rounded-md px-3 py-2 text-sm text-gray-200 placeholder-gray-600 outline-none focus:border-gray-400 transition-colors"
        />
        <button onClick={addTodo} className="px-3 py-2 text-xs bg-white text-gray-900 rounded-md hover:bg-gray-100 transition-all duration-150">
          + Add
        </button>
      </div>

      <div className="space-y-2">
        {sorted.map(todo => {
          const isComplete = todo.progress >= 100;
          const pc = ladder(todo.progress);
          return (
            <div
              key={todo.id}
              className={`bg-[#0a0a0a] border border-white/15 rounded-lg overflow-hidden transition-all duration-150 shadow-card-white ${isComplete ? 'opacity-60' : ''}`}
            >
              <div
                className="px-4 py-3 cursor-pointer"
                onClick={() => setExpanded(expanded === todo.id ? null : todo.id)}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-sm ${isComplete ? 'line-through text-gray-600' : 'text-gray-200'}`}>
                    {todo.text}
                  </span>
                  <span className={`text-xs ml-3 ${pc.cls}`}>{todo.progress}%</span>
                </div>
                <div className="flex items-center gap-3">
                  <input
                    type="range" min="0" max="100" value={todo.progress}
                    onChange={(e) => updateTodo(todo.id, { progress: Number(e.target.value) })}
                    onClick={(e) => e.stopPropagation()}
                    className="flex-1 h-1.5 bg-gray-800 rounded-full appearance-none cursor-pointer
                      [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3.5 [&::-webkit-slider-thumb]:h-3.5
                      [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-gray-300
                      [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-[#0a0a0a]
                      [&::-moz-range-thumb]:w-3.5 [&::-moz-range-thumb]:h-3.5 [&::-moz-range-thumb]:rounded-full
                      [&::-moz-range-thumb]:bg-gray-300 [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-[#0a0a0a]"
                  />
                  <button
                    className="text-xs text-gray-500 hover:text-red-400 transition-colors shrink-0"
                    onClick={(e) => { e.stopPropagation(); deleteTodo(todo.id); }}
                  >
                    ✕
                  </button>
                </div>
              </div>
              {expanded === todo.id && (
                <div className="px-4 pb-3 border-t border-white/10 pt-3">
                  <textarea
                    placeholder="Notes, deadlines, links..."
                    value={todo.notes || ''}
                    onChange={(e) => updateTodo(todo.id, { notes: e.target.value })}
                    className="w-full bg-black border border-white/15 rounded-md px-3 py-2 text-sm text-gray-200 placeholder-gray-600 outline-none focus:border-gray-400 transition-colors resize-vertical min-h-[60px]"
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
