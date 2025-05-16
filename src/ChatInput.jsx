import React, { useState, useRef, useEffect } from 'react';

export default function ChatInput({ onSend }) {
  const [value, setValue] = useState('');
  const textareaRef = useRef(null);

  // auto‐resize de la textarea
  useEffect(() => {
    const ta = textareaRef.current;
    ta.style.height = 'auto';
    ta.style.height = ta.scrollHeight + 'px';
  }, [value]);

  const send = () => {
    const txt = value.trim();
    if (!txt) return;
    onSend(txt);
    setValue('');
  };

  const handleKey = e => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  return (
    <div className="chat-input">
      <button
        type="button"
        className="action-btn"
        aria-label="Actions"
      >＋</button>
      <textarea
        ref={textareaRef}
        className="input-area"
        rows={1}
        placeholder="Tapez votre message…"
        value={value}
        onChange={e => setValue(e.target.value)}
        onKeyDown={handleKey}
      />
      <button
        type="button"
        className={`send-btn${value.trim() ? ' enabled' : ''}`}
        onClick={send}
        aria-label="Envoyer"
      >➤</button>
    </div>
  );
}
