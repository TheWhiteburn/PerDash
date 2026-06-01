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
    <div className="tab-content">
      <h2>To-Do List</h2>
      <p className="section-subtitle">Long-term milestones. Stays until checked off.</p>

      <div className="add-row">
        <input
          type="text" placeholder="Add a milestone..." value={newText}
          onChange={(e) => setNewText(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && addTodo()}
          className="input-text"
        />
        <button className="btn-primary" onClick={addTodo}>+</button>
      </div>

      <div className="todo-list">
        {sorted.map(todo => (
          <div key={todo.id} className={`todo-card ${todo.progress >= 100 ? 'completed' : ''}`}>
            <div className="todo-header" onClick={() => setExpanded(expanded === todo.id ? null : todo.id)}>
              <div className="todo-info">
                <span className="todo-text">{todo.text}</span>
                <span className="todo-percent">{todo.progress}%</span>
              </div>
              <div className="todo-actions">
                <input
                  type="range" min="0" max="100" value={todo.progress}
                  onChange={(e) => updateTodo(todo.id, { progress: Number(e.target.value) })}
                  className="progress-slider"
                  onClick={(e) => e.stopPropagation()}
                />
                <button className="btn-sm danger" onClick={(e) => { e.stopPropagation(); deleteTodo(todo.id); }}>✕</button>
              </div>
            </div>
            {expanded === todo.id && (
              <div className="todo-notes">
                <textarea
                  placeholder="Notes, deadlines, links..."
                  value={todo.notes || ''}
                  onChange={(e) => updateTodo(todo.id, { notes: e.target.value })}
                  className="input-textarea"
                />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
