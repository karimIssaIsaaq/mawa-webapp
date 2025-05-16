import React, { useState, useRef, useEffect } from 'react';
import './ChatInput.css';

export default function ChatInput({ onSend }) {
  const [value, setValue] = useState('');
  const textareaRef = useRef(null);

  // Ajuste la hauteur de la textarea en fonction du contenu
  useEffect(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = 'auto';
    ta.style.height = ta.scrollHeight + 'px';
  }, [value]);

  const handleChange = (e) => {
    setValue(e.target.value);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  };

  const submit = () => {
    const txt = value.trim();
    if (!txt) return;
    onSend(txt);
    setValue('');
  };

  return (
    <div className="chatgpt-input-wrapper">
      <button
        type="button"
        className="chatgpt-action-button"
        aria-label="Nouvelle ligne ou actions"
      >
        ＋
      </button>
      <textarea
        ref={textareaRef}
        className="chatgpt-textarea"
        rows={1}
        placeholder="Envoyer un message..."
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
      />
      <button
        type="button"
        className={`chatgpt-send-button${value.trim() ? ' enabled' : ''}`}
        onClick={submit}
        aria-label="Envoyer"
      >
        ➤
      </button>
    </div>
  );
}
