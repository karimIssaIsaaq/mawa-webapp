// src/ChatBox.jsx
import React, { useState, useEffect, useRef } from 'react';
import './ChatBox.css';

export default function ChatBox() {
  const [messages, setMessages] = useState([
    { text: "Salam 👋 Je suis ton assistant, là pour t'aider quand tu en as besoin.", sender: 'bot' }
  ]);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef(null);

  // Scroll to bottom on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = async e => {
    e.preventDefault();
    const text = input.trim();
    if (!text) return;
    // add user message
    setMessages(msgs => [...msgs, { text, sender: 'user' }]);
    setInput('');
    // simulate bot response (replace with your API call)
    setTimeout(() => {
      setMessages(msgs => [
        ...msgs,
        { text: "Voilà la réponse 🚀", sender: 'bot' }
      ]);
    }, 800);
  };

  return (
    <div className="chat-app">
      <div className="chat-window">
        <div className="messages">
          {messages.map((m, i) => (
            <div
              key={i}
              className={`message ${m.sender === 'user' ? 'user' : 'bot'}`}
            >
              {m.text}
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
        <form className="input-form" onSubmit={handleSubmit}>
          <textarea
            rows={1}
            placeholder="Tapez votre message…"
            value={input}
            onChange={e => setInput(e.target.value)}
          />
          <button type="submit">Envoyer</button>
        </form>
      </div>
    </div>
);
}
