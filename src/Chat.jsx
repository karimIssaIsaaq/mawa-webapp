import React, { useState } from 'react';
import ChatInput from './ChatInput';
import './ChatBox.css';

export default function ChatBox() {
  const [messages, setMessages] = useState([
    { text: 'Salam 👋…', sender: 'bot' }
  ]);

  const handleSend = (text) => {
    // ajoute ton message et appelle l’API…
    setMessages(prev => [...prev, { text, sender: 'user' }]);
  };

  return (
    <div className="chat-container">
      {/* … header + zone messages scrollable … */}
      <div className="chat-messages">
        {messages.map((m,i) => (
          <div key={i} className={`message ${m.sender}`}>{m.text}</div>
        ))}
      </div>
      {/* insert the custom ChatGPT‐style input here */}
      <ChatInput onSend={handleSend} />
    </div>
  );
}
