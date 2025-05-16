// src/ChatBox.jsx
import React, { useState, useEffect, useRef } from 'react';
import './ChatBox.css';

export default function ChatBox() {
  const [messages, setMessages] = useState([
    { text: "Salam 👋 Je suis ton assistant, là pour t'aider quand tu en as besoin.", sender: 'bot' }
  ]);
  const [input, setInput] = useState('');
  const endRef = useRef(null);

  // Scroll automatique à chaque nouveau message
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Simule envoi et réponse (remplace par ton API)
  const handleSubmit = e => {
    e.preventDefault();
    const txt = input.trim();
    if (!txt) return;
    // Ajout message utilisateur
    setMessages(m => [...m, { text: txt, sender: 'user' }]);
    setInput('');
    // Réponse simulée
    setTimeout(() => {
      setMessages(m => [...m, { text: "Voilà ma réponse 🚀", sender: 'bot' }]);
    }, 800);
  };

  return (
    <div className="chat-app">
      <div className="chat-container">
        {/* HEADER (facultatif) */}
        <div className="chat-header">ChatGPT</div>

        {/* ZONE DE MESSAGES */}
        <div className="chat-messages">
          {messages.map((m,i) => (
            <div key={i} className={`message ${m.sender}`}>
              {m.text}
            </div>
          ))}
          <div ref={endRef} />
        </div>

        {/* FORMULAIRE FIXÉ */}
        <form className="chat-input" onSubmit={handleSubmit}>
          <textarea
            rows={1}
            placeholder="Tapez votre message…"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e);
              }
            }}
          />
          <button type="submit" aria-label="Envoyer">
            ➤
          </button>
        </form>
      </div>
    </div>
  );
}
