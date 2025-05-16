import React, { useState, useEffect, useRef } from 'react';
import {
  MainContainer,
  ChatContainer,
  MessageList,
  Message,
  TypingIndicator,
  MessageInput
} from '@chatscope/chat-ui-kit-react';
import '@chatscope/chat-ui-kit-styles/dist/default/styles.min.css';
import './ChatBox.css';

export default function ChatBox() {
  const [messages, setMessages] = useState([
    { text: "Salam 👋 Je suis ton assistant, là pour t'aider quand tu en as besoin.", sender: 'assistant' }
  ]);
  const [typing, setTyping] = useState(false);
  const listRef = useRef(null);

  // Scroll automatique à chaque nouveau message
  useEffect(() => {
    listRef.current?.scrollToBottom();
  }, [messages]);

  const handleSend = async (text) => {
    setMessages(prev => [...prev, { text, sender: 'user' }]);
    setTyping(true);
    // Simule une réponse
    setTimeout(() => {
      setMessages(prev => [...prev, { text: "Voilà ma réponse 🚀", sender: 'assistant' }]);
      setTyping(false);
    }, 800);
  };

  return (
    <div className="chat-wrapper">
      <MainContainer className="main-container">
        <ChatContainer>
          <MessageList
            ref={listRef}
            className="message-list"
            typingIndicator={
              typing ? <TypingIndicator content="Assistant écrit…" /> : null
            }
          >
            {messages.map((m, i) => (
              <Message
                key={i}
                model={{
                  message: m.text,
                  sender: m.sender,
                  sentTime: 'maintenant'
                }}
              />
            ))}
          </MessageList>
          <MessageInput
            className="message-input"
            placeholder="Pose ta question…"
            onSend={handleSend}
            attachButton={false}
            autoFocus
          />
        </ChatContainer>
      </MainContainer>
    </div>
  );
}
