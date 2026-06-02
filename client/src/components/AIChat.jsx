import React, { useState, useRef, useEffect } from 'react';
import { useData } from '../store';

export default function AIChat({ onClose }) {
  const { data, exportData, updateData, setTodayChecklist, getTodayChecklist, logWorkout, logSleep, getTodayKey } = useData();
  const [messages, setMessages] = useState([
    { role: 'ai', content: 'Ready to work. What did you do?' },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const applyMutations = (mutations) => {
    if (!mutations || !Array.isArray(mutations)) return;
    for (const m of mutations) {
      switch (m.action) {
        case 'toggleChecklist': {
          const items = getTodayChecklist();
          const updated = items.map(i =>
            i.id === m.id ? { ...i, done: m.done ?? !i.done } : i
          );
          setTodayChecklist(updated);
          break;
        }
        case 'logWorkout':
          logWorkout({ text: m.text });
          break;
        case 'logSleep':
          logSleep(m.hours);
          break;
        case 'updateGoal':
          updateData(prev => ({
            ...prev,
            goals: {
              ...prev.goals,
              [m.level]: prev.goals[m.level].map(g =>
                g.id === m.id ? { ...g, progress: m.progress } : g
              ),
            },
          }));
          break;
        case 'toggleChallengeStep':
          updateData(prev => ({
            ...prev,
            workouts: {
              ...prev.workouts,
              challenges: prev.workouts.challenges.map(c =>
                c.id === m.challengeId ? {
                  ...c,
                  steps: c.steps.map(s =>
                    s.id === m.stepId ? { ...s, done: m.done ?? !s.done } : s
                  ),
                } : c
              ),
            },
          }));
          break;
        case 'addTodo':
          updateData(prev => ({
            ...prev,
            todos: [...prev.todos, { id: `t-${Date.now()}`, text: m.text, progress: 0, notes: '', createdAt: new Date().toISOString() }],
          }));
          break;
        case 'updateChecklistProgress':
          updateData(prev => ({
            ...prev,
            dailyChecklist: {
              ...prev.dailyChecklist,
              presets: prev.dailyChecklist.presets.map(p =>
                p.id === m.id ? { ...p, active: m.active ?? p.active } : p
              ),
            },
          }));
          break;
        default:
          break;
      }
    }
  };

  const sendMessage = async () => {
    if (!input.trim() || loading) return;
    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setLoading(true);

    try {
      const context = exportData();
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMsg, context }),
      });
      const result = await res.json();
      setMessages(prev => [...prev, { role: 'ai', content: result.reply }]);
      if (result.mutations) {
        applyMutations(result.mutations);
      }
    } catch (e) {
      setMessages(prev => [...prev, { role: 'ai', content: '⚠️ Connection error. Make sure the server is running.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex justify-end animate-[fadeIn_0.2s_ease]">
      <div className="w-[400px] max-w-full h-full bg-white border-l border-black flex flex-col animate-[slideIn_0.25s_ease]">
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-black/10 shrink-0">
          <span className="text-sm font-medium text-gray-900 tracking-wide">Coach</span>
          <button
            onClick={onClose}
            className="px-2 py-1 text-xs text-gray-400 bg-transparent rounded hover:bg-gray-900 hover:text-white hover:-translate-y-1 transition-all duration-300"
          >
            ✕ Esc
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
          {messages.map((m, i) => (
            <div
              key={i}
              className={`px-4 py-3 rounded-lg text-sm leading-relaxed max-w-[88%] animate-[msgIn_0.2s_ease] ${
                m.role === 'ai'
                  ? 'bg-gray-100 border border-gray-200 self-start text-gray-800 whitespace-pre-wrap'
                  : 'bg-gray-900 self-end text-white'
              }`}
            >
              {m.content}
            </div>
          ))}
          {loading && (
            <div className="px-4 py-3 rounded-lg text-sm bg-gray-100 border border-gray-200 self-start text-gray-400 italic">
              Thinking...
            </div>
          )}
          <div ref={bottomRef} />
        </div>
        <div className="flex gap-2 px-5 py-3.5 border-t border-black/10 shrink-0">
          <input
            type="text" placeholder="Tell me what you did..." value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
            disabled={loading}
            className="flex-1 bg-white border border-black/20 rounded-md px-3 py-2 text-sm text-gray-900 placeholder-gray-400 outline-none focus:border-gray-500 transition-colors disabled:opacity-50"
          />
          <button
            className="px-3 py-2 text-xs bg-gray-900 text-white rounded-md hover:bg-white hover:text-gray-900 hover:-translate-y-1 transition-all duration-300 disabled:opacity-50 disabled:hover:-translate-y-0"
            onClick={sendMessage}
            disabled={loading}
          >
            Send
          </button>
        </div>
      </div>
      <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideIn { from { transform: translateX(100%); } to { transform: translateX(0); } }
        @keyframes msgIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
}
