import React, { useState, useRef, useEffect } from 'react';
import { useData } from '../store';

export default function AIChat({ onClose }) {
  const { data, exportData } = useData();
  const [messages, setMessages] = useState([
    { role: 'ai', content: 'Ready to work. What needs to happen today?' },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

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
    } catch (e) {
      setMessages(prev => [...prev, { role: 'ai', content: '⚠️ Connection error. Make sure the server is running.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="chat-overlay">
      <div className="chat-panel">
        <div className="chat-header">
          <h3>🤖 AI Coach</h3>
          <button className="btn-icon" onClick={onClose}>✕</button>
        </div>
        <div className="chat-messages">
          {messages.map((m, i) => (
            <div key={i} className={`chat-msg ${m.role === 'ai' ? 'ai' : 'user'}`}>
              {m.content}
            </div>
          ))}
          {loading && <div className="chat-msg ai">Thinking...</div>}
          <div ref={bottomRef} />
        </div>
        <div className="chat-input-row">
          <input
            type="text" placeholder="Tell me what to do..." value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
            className="input-text"
            disabled={loading}
          />
          <button className="btn-primary" onClick={sendMessage} disabled={loading}>
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
