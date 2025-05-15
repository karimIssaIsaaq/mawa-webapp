// src/ChatBox.jsx
import {
    MainContainer,
    ChatContainer,
    MessageList,
    Message,
    MessageInput,
    TypingIndicator
  } from "@chatscope/chat-ui-kit-react";
  import { useState } from "react";
  import "@chatscope/chat-ui-kit-styles/dist/default/styles.min.css";
  import "./ChatBox.css";
  
  export default function ChatBox() {
    const [messages, setMessages] = useState([
      {
        message: "Salam Karim 👋 Je suis là si tu veux parler à ton Créateur ✨",
        sender: "ChatGPT"
      }
    ]);
    const [typing, setTyping] = useState(false);
  
    const handleSend = async (userMessage) => {
      const newMessage = {
        message: userMessage,
        sender: "user"
      };
  
      const newMessages = [...messages, newMessage];
      setMessages(newMessages);
      setTyping(true);
  
      const response = await fetch("https://mawa-backend.vercel.app/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: newMessages.map((m) => ({
            role: m.sender === "ChatGPT" ? "assistant" : "user",
            content: m.message
          }))
        })
      });
  
      const data = await response.json();
      setMessages([
        ...newMessages,
        { message: data.reply, sender: "ChatGPT" }
      ]);
      setTyping(false);
    };
  
    return (
      <div className="chatbox-wrapper">
        <div className="chatbox-container">
          <MainContainer>
            <ChatContainer>
              <MessageList
                typingIndicator={
                  typing ? <TypingIndicator content="ChatGPT est en train d’écrire..." /> : null
                }
              >
                {messages.map((msg, i) => (
                  <Message
                    key={i}
                    model={{
                      message: msg.message,
                      sentTime: "just now",
                      sender: msg.sender
                    }}
                  />
                ))}
                <h1 className="chatbox-title">✅ Chat fonctionnel et stylisé</h1>
              </MessageList>
              <MessageInput placeholder="Pose ta question..." onSend={handleSend} />
            </ChatContainer>
          </MainContainer>
        </div>
      </div>
    );
  }
  